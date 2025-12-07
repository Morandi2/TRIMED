# 🔗 Guide d'Intégration: React Frontend + Django REST API Multi-Tenant

## 📋 Table des Matières
1. [Architecture Globale](#architecture)
2. [Configuration Backend Django](#backend)
3. [Configuration Frontend React](#frontend)
4. [Authentification JWT](#auth)
5. [Gestion Multi-Tenant](#multi-tenant)
6. [Services API](#services)
7. [Gestion des Erreurs](#errors)
8. [Sécurité](#security)

---

## 🏗️ Architecture Globale {#architecture}

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Services   │  │   Context    │  │  Components  │     │
│  │   API        │  │   Auth       │  │  Pages       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS (JWT)
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Django REST Framework)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Views      │  │  Serializers │  │   Models     │     │
│  │   API        │  │              │  │  Multi-Tenant│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │  Multi-Tenant│
                    └──────────────┘
```

---

## 🐍 Configuration Backend Django {#backend}

### Étape 1: Installation des Dépendances

```bash
# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Installer packages
pip install django djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install django-tenant-schemas
pip install psycopg2-binary
pip install python-decouple
```

### Étape 2: Structure du Projet Django

```
trimed_backend/
├── manage.py
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── tenants/
│   │   ├── models.py
│   │   ├── middleware.py
│   │   └── utils.py
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── permissions.py
│   ├── patients/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── consultations/
│   ├── ordonnances/
│   └── medicaments/
└── requirements.txt
```

### Étape 3: Configuration settings.py

```python
# config/settings.py
from pathlib import Path
from decouple import config
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Applications
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_tenants',
    
    # Local apps
    'apps.tenants',
    'apps.users',
    'apps.patients',
    'apps.consultations',
    'apps.ordonnances',
    'apps.medicaments',
]

# Middleware
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-tenant-id',
]

# Database Multi-Tenant
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

DATABASE_ROUTERS = (
    'django_tenants.routers.TenantSyncRouter',
)

# Tenant Configuration
TENANT_MODEL = "tenants.Tenant"
TENANT_DOMAIN_MODEL = "tenants.Domain"

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# Custom User Model
AUTH_USER_MODEL = 'users.User'
```

### Étape 4: Modèles Multi-Tenant

```python
# apps/tenants/models.py
from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Tenant(TenantMixin):
    nom = models.CharField(max_length=200)
    adresse = models.TextField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    logo = models.ImageField(upload_to='tenants/logos/', blank=True, null=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    # Champs requis par django-tenants
    auto_create_schema = True
    auto_drop_schema = False
    
    class Meta:
        db_table = 'tenants'
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'
    
    def __str__(self):
        return self.nom

class Domain(DomainMixin):
    pass
```

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('ADMIN', 'Administrateur'),
        ('MEDECIN', 'Médecin'),
        ('INFIRMIER', 'Infirmier'),
        ('RECEPTIONNISTE', 'Réceptionniste'),
        ('PHARMACIEN', 'Pharmacien'),
        ('MANAGER', 'Manager'),
        ('TECHNICIEN', 'Technicien'),
        ('FINANCE', 'Finance'),
        ('AUDITEUR', 'Auditeur'),
    )
    
    role = models.CharField(max_length=20, choices=ROLES, default='RECEPTIONNISTE')
    telephone = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to='users/photos/', blank=True, null=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"
```

### Étape 5: Serializers

```python
# apps/users/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'telephone', 'photo', 'actif', 'date_creation']
        read_only_fields = ['id', 'date_creation']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                  'role', 'telephone']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
```

---

## ⚛️ Configuration Frontend React {#frontend}

### Étape 1: Installation des Dépendances

```bash
npm install axios
npm install jwt-decode
npm install @tanstack/react-query
```

### Étape 2: Configuration Axios

```typescript
// src/config/axios.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    const tenantId = localStorage.getItem('tenant_id');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer le refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/connexion';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Étape 3: Service d'Authentification

```typescript
// src/services/authService.ts
import axiosInstance from '../config/axios';
import { jwtDecode } from 'jwt-decode';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

interface DecodedToken {
  user_id: number;
  username: string;
  role: string;
  tenant_id: number;
  exp: number;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    
    // Stocker les tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Décoder le token pour obtenir tenant_id
    const decoded: DecodedToken = jwtDecode(access);
    localStorage.setItem('tenant_id', decoded.tenant_id.toString());
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },
  
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
    } finally {
      localStorage.clear();
    }
  },
  
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axiosInstance.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    return access;
  },
  
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
```

---

*Suite dans le prochain fichier...*
