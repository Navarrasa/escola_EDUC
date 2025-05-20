from django.urls import path
from rest_framework_simplejwt.views import ( TokenObtainPairView, TokenRefreshView )
from .views import (

    SalasListCreateAPIView,
    UsuarioListCreateView,
    UsuarioRetrieveUpdateDestroyView,
    DisciplinaListCreateView,
    DisciplinaRetrieveUpdateDestroyView,
    DisciplinaPorProfessorListView,
    ReservaListCreateView,
    ReservaRetrieveDestroyAPIView,
    ReservaPorProfessorListView

)

app_name = 'app'

urlpatterns = [
    # Salas
    path('salas/', SalasListCreateAPIView.as_view(), name='salas-list-create'),

    # Usuários
    path('usuarios/', UsuarioListCreateView.as_view(), name='usuario-list-create'),
    path('usuarios/<int:pk>/', UsuarioRetrieveUpdateDestroyView.as_view(), name='usuario-detail'),

    # Disciplinas
    path('disciplinas/', DisciplinaListCreateView.as_view(), name='disciplina-list-create'),
    path('disciplinas/<int:pk>/', DisciplinaRetrieveUpdateDestroyView.as_view(), name='disciplina-detail'),
    path('disciplinas/professores/<int:ni>/', DisciplinaPorProfessorListView.as_view(), name='disciplina-list-professor'),

    # Reservas
    path('reservas/', ReservaListCreateView.as_view(), name='reserva-list-create'),
    path('reservas/<int:pk>/', ReservaRetrieveDestroyAPIView.as_view(), name='reserva-destroy'),
    path('reservas/professores/', ReservaPorProfessorListView.as_view(), name='reserva-list-professor'),
    
    # JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]