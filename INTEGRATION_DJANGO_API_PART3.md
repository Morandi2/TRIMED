# 🔗 Guide d'Intégration: React + Django API (Partie 3)

## 📝 Exemples Pratiques d'Intégration

### Backend: URLs Configuration

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import LoginView, LogoutView, UserViewSet
from apps.patients.views import PatientViewSet
from apps.consultations.views import ConsultationViewSet
from apps.ordonnances.views import OrdonnanceViewSet
from apps.medicaments.views import MedicamentViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'ordonnances', OrdonnanceViewSet, basename='ordonnance')
router.register(r'medicaments', MedicamentViewSet, basename='medicament')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

### Backend: Views Complètes

```python
# apps/users/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer
from .permissions import IsAdminOrManager

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            return Response(
                {'error': 'Identifiants invalides'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.actif:
            return Response(
                {'error': 'Compte désactivé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Déconnexion réussie'})
        except Exception:
            return Response(
                {'error': 'Token invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        user = self.get_object()
        user.actif = not user.actif
        user.save()
        return Response({'actif': user.actif})
```

```python
# apps/patients/views.py
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Patient
from .serializers import PatientSerializer, PatientDetailSerializer
from apps.users.permissions import CanEditPatients

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'prenom', 'numero_dossier_medical', 'telephone', 'email']
    ordering_fields = ['nom', 'prenom', 'date_naissance', 'cree_le']
    ordering = ['-cree_le']
    
    def get_queryset(self):
        queryset = Patient.objects.filter(tenant=self.request.tenant)
        
        # Filtrer par médecin si l'utilisateur est médecin
        if self.request.user.role == 'MEDECIN':
            queryset = queryset.filter(
                consultations__medecin=self.request.user
            ).distinct()
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PatientDetailSerializer
        return PatientSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanEditPatients()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def consultations(self, request, pk=None):
        patient = self.get_object()
        consultations = patient.consultations.all()
        from apps.consultations.serializers import ConsultationSerializer
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def ordonnances(self, request, pk=None):
        patient = self.get_object()
        ordonnances = patient.ordonnances.all()
        from apps.ordonnances.serializers import OrdonnanceSerializer
        serializer = OrdonnanceSerializer(ordonnances, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        queryset = self.get_queryset()
        return Response({
            'total': queryset.count(),
            'hommes': queryset.filter(sexe='M').count(),
            'femmes': queryset.filter(sexe='F').count(),
        })
```

### Frontend: Composant de Connexion

```typescript
// src/pages/AuthPages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { handleApiError } from '../../utils/errorHandler';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/home');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">TRIMED</h2>
          <p className="mt-2 text-center text-gray-600">Connexion</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

### Frontend: Hook React Query

```typescript
// src/hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, Patient, PatientFormData } from '../services/patientService';
import { handleApiError } from '../utils/errorHandler';

export const usePatients = () => {
  const queryClient = useQueryClient();

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: PatientFormData) => patientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PatientFormData> }) =>
      patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  return {
    patients: patients || [],
    isLoading,
    error,
    createPatient: createMutation.mutateAsync,
    updatePatient: updateMutation.mutateAsync,
    deletePatient: deleteMutation.mutateAsync,
  };
};
```

---

## 🚀 Déploiement

### Backend: Configuration Production

```python
# config/settings_prod.py
from .settings import *

DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS').split(',')

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
        'CONN_MAX_AGE': 600,
    }
}

# Static files
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_ROOT = BASE_DIR / 'media'
```

### Frontend: Build Production

```bash
# .env.production
VITE_API_BASE_URL=https://api.trimed.com/api
VITE_APP_NAME=TRIMED
VITE_ENABLE_LOGS=false
```

```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers à déployer
```

---

## 📊 Tests

### Backend: Tests Unitaires

```python
# apps/patients/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.tenants.models import Tenant
from .models import Patient

class PatientAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tenant = Tenant.objects.create(nom='Test Hospital')
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass',
            role='ADMIN'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_patient(self):
        data = {
            'nom': 'Doe',
            'prenom': 'John',
            'date_naissance': '1990-01-01',
            'sexe': 'M',
        }
        response = self.client.post('/api/patients/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_patients(self):
        response = self.client.get('/api/patients/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### Frontend: Tests avec Vitest

```typescript
// src/services/__tests__/patientService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { patientService } from '../patientService';
import axiosInstance from '../../config/axios';

vi.mock('../../config/axios');

describe('PatientService', () => {
  it('should fetch all patients', async () => {
    const mockPatients = [
      { patient_id: 1, nom: 'Doe', prenom: 'John' },
    ];
    
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { results: mockPatients },
    });
    
    const patients = await patientService.getAll();
    expect(patients).toEqual(mockPatients);
  });
});
```

---

## 📚 Ressources Supplémentaires

### Documentation
- Django REST Framework: https://www.django-rest-framework.org/
- Django Tenants: https://django-tenants.readthedocs.io/
- React Query: https://tanstack.com/query/latest
- Axios: https://axios-http.com/

### Commandes Utiles

```bash
# Backend
python manage.py makemigrations
python manage.py migrate_schemas --shared
python manage.py migrate_schemas
python manage.py createsuperuser
python manage.py runserver

# Frontend
npm run dev
npm run build
npm run preview
npm run test
```

---

## ✅ Checklist d'Intégration

- [ ] Backend Django configuré avec DRF
- [ ] Multi-tenant configuré avec django-tenants
- [ ] JWT authentification configurée
- [ ] CORS configuré correctement
- [ ] Models créés pour tous les modules
- [ ] Serializers créés
- [ ] ViewSets et permissions configurés
- [ ] URLs configurées
- [ ] Frontend Axios configuré
- [ ] Services API créés
- [ ] Context d'authentification créé
- [ ] Routes protégées implémentées
- [ ] Gestion d'erreurs implémentée
- [ ] Tests écrits
- [ ] Variables d'environnement configurées
- [ ] Documentation complétée

---

**🎉 Félicitations! Votre application TRIMED est maintenant prête à être connectée à une API Django REST multi-tenant!**
