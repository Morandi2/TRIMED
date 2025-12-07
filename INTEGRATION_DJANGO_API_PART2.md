# 🔗 Guide d'Intégration: React + Django API (Partie 2)

## 🔐 Authentification JWT {#auth}

### Context d'Authentification React

```typescript
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Route Protégée

```typescript
// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

---

## 🏢 Gestion Multi-Tenant {#multi-tenant}

### Backend: Middleware Tenant

```python
# apps/tenants/middleware.py
from django.http import JsonResponse
from django_tenants.utils import get_tenant_model

class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tenant_id = request.headers.get('X-Tenant-ID')
        
        if tenant_id:
            try:
                Tenant = get_tenant_model()
                tenant = Tenant.objects.get(id=tenant_id)
                request.tenant = tenant
            except Tenant.DoesNotExist:
                return JsonResponse({'error': 'Tenant invalide'}, status=400)
        
        response = self.get_response(request)
        return response
```

### Backend: Views avec Tenant

```python
# apps/patients/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filtrer par tenant automatiquement
        return Patient.objects.filter(tenant=self.request.tenant)
    
    def perform_create(self, serializer):
        # Associer le tenant automatiquement
        serializer.save(tenant=self.request.tenant)
```

### Frontend: Service Patient

```typescript
// src/services/patientService.ts
import axiosInstance from '../config/axios';

export interface Patient {
  patient_id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  numero_dossier_medical: string;
}

export interface PatientFormData {
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export const patientService = {
  async getAll(): Promise<Patient[]> {
    const response = await axiosInstance.get('/patients/');
    return response.data.results || response.data;
  },
  
  async getById(id: number): Promise<Patient> {
    const response = await axiosInstance.get(`/patients/${id}/`);
    return response.data;
  },
  
  async create(data: PatientFormData): Promise<Patient> {
    const response = await axiosInstance.post('/patients/', data);
    return response.data;
  },
  
  async update(id: number, data: Partial<PatientFormData>): Promise<Patient> {
    const response = await axiosInstance.patch(`/patients/${id}/`, data);
    return response.data;
  },
  
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/patients/${id}/`);
  },
  
  async search(query: string): Promise<Patient[]> {
    const response = await axiosInstance.get('/patients/', {
      params: { search: query }
    });
    return response.data.results || response.data;
  },
};
```

---

## 🔧 Services API Complets {#services}

### Service Générique

```typescript
// src/services/baseService.ts
import axiosInstance from '../config/axios';

export class BaseService<T, TCreate = Partial<T>> {
  constructor(private endpoint: string) {}

  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response = await axiosInstance.get(this.endpoint, { params });
    return response.data.results || response.data;
  }

  async getById(id: number): Promise<T> {
    const response = await axiosInstance.get(`${this.endpoint}${id}/`);
    return response.data;
  }

  async create(data: TCreate): Promise<T> {
    const response = await axiosInstance.post(this.endpoint, data);
    return response.data;
  }

  async update(id: number, data: Partial<TCreate>): Promise<T> {
    const response = await axiosInstance.patch(`${this.endpoint}${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.endpoint}${id}/`);
  }
}
```

### Utilisation du Service Générique

```typescript
// src/services/consultationService.ts
import { BaseService } from './baseService';

export interface Consultation {
  consultation_id: number;
  patient_id: number;
  medecin_id: number;
  date_consultation: string;
  motif: string;
  diagnostic?: string;
  notes?: string;
}

export interface ConsultationFormData {
  patient_id: number;
  medecin_id: number;
  date_consultation: string;
  motif: string;
  diagnostic?: string;
  notes?: string;
}

class ConsultationService extends BaseService<Consultation, ConsultationFormData> {
  constructor() {
    super('/consultations/');
  }

  async getByPatient(patientId: number): Promise<Consultation[]> {
    return this.getAll({ patient_id: patientId });
  }

  async getByMedecin(medecinId: number): Promise<Consultation[]> {
    return this.getAll({ medecin_id: medecinId });
  }
}

export const consultationService = new ConsultationService();
```

---

## ⚠️ Gestion des Erreurs {#errors}

### Backend: Exception Handler

```python
# apps/core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response = {
            'error': True,
            'message': str(exc),
            'status_code': response.status_code,
            'details': response.data
        }
        response.data = custom_response
    
    return response
```

```python
# config/settings.py
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}
```

### Frontend: Error Handler

```typescript
// src/utils/errorHandler.ts
import axios from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Une erreur est survenue',
        status: error.response.status,
        details: error.response.data?.details,
      };
    } else if (error.request) {
      return {
        message: 'Impossible de contacter le serveur',
        status: 0,
      };
    }
  }
  
  return {
    message: 'Une erreur inattendue est survenue',
  };
};
```

### Hook pour Requêtes API

```typescript
// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { handleApiError, ApiError } from '../utils/errorHandler';

export const useApi = <T, P extends any[]>(
  apiFunc: (...args: P) => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute };
};
```

---

## 🔒 Sécurité {#security}

### Backend: Permissions Personnalisées

```python
# apps/users/permissions.py
from rest_framework import permissions

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['ADMIN', 'MANAGER']

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user

class CanEditPatients(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'MEDECIN', 'RECEPTIONNISTE']
```

### Frontend: Variables d'Environnement

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=TRIMED
VITE_ENABLE_LOGS=true
```

```typescript
// src/config/env.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
  enableLogs: import.meta.env.VITE_ENABLE_LOGS === 'true',
};
```

---

*Suite dans le prochain fichier...*
