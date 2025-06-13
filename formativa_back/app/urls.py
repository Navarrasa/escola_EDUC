from django.urls import path
from .views import (

    SalaListCreateAPIView,
    SalaPorProfessorListView,
    SalaRetrieveUpdateDestroyView,
    UsuarioListCreateView,
    UsuarioRetrieveUpdateDestroyView,
    UsuarioProfessorView,
    DisciplinaListCreateView,
    DisciplinaRetrieveUpdateDestroyView,
    DisciplinaPorProfessorListView,
    ReservaListCreateView,
    ReservaRetrieveDestroyAPIView,
    ReservaPorProfessorListView,
    LoginView,
    getPeriodoData,

)

app_name = 'app'

urlpatterns = [
    # Salas
    path('salas/', SalaListCreateAPIView.as_view(), name='salas-list-create'),
    path('salas/<int:pk>', SalaRetrieveUpdateDestroyView.as_view(), name='salas-list-create'),
    path('salas/professores/', SalaPorProfessorListView.as_view(), name='salas-list-create'),

    # Usuários
    path('usuarios/', UsuarioListCreateView.as_view(), name='usuario-list-create'),
    path('usuarios/professores/', UsuarioProfessorView.as_view(), name='usuario-professor-list'),
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
    path('auth/', LoginView.as_view(), name='token_obtain_pair'),

    # Data extra
    path('periodos/', view=getPeriodoData, name='get_periodo_data')
]