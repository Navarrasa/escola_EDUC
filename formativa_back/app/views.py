from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from .models import (Usuario, Disciplina, Salas, Reserva)
from .serializers import (UsuarioSerializer, DisciplinaSerializer, SalasSerializer, ReservaSerializer, LoginSerializer)
from .permissions import (IsGestor, IsProfessor, IsDonoOuGestor)
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


# GET e POST do usuário permitido somente para o Gestor
class UsuarioListCreateView(ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    
    def get_permissions(self):
        if self.request.method:
            return [IsGestor]


# GET, PUT, PATCH e DELETE que é permitido somente para o gestor
# ver, atualizar e deletar um usuario específico
class UsuarioRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    lookup_field = 'pk' # por qual campo procura

    def get_permissions(self):
        if self.request.method:
            return [IsGestor]


# ver todas as displinas e criar uma nova disciplina (apenas o gestor pode fazer)
class DisciplinaListCreateView(ListCreateAPIView):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsProfessor]
        return [IsGestor]


class SalasListCreateAPIView(ListCreateAPIView):
    queryset = Salas.objects.all()
    serializer_class = SalasSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsProfessor]
        return [IsGestor]

class SalasRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Salas.objects.all()
    serializer_class = SalasSerializer
    permission_classes = [IsGestor]
    lookup_field = 'pk'


# GET, PUT, PATCH e DELETE que é permitido somente para o gestor
# ver, atualizar e deletar uma disciplina específica
class DisciplinaRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [IsGestor]
    lookup_field = 'pk'


# listagem das disciplinas (professor)
class DisciplinaPorProfessorListView(ListAPIView):
    serializer_class = DisciplinaSerializer
    permission_classes = [IsProfessor]

    def get_queryset(self):
        return Disciplina.objects.filter(professor=self.request.user) # filtra todas as disciplinas do usuário logado (professor no caso)
    

# permite criar e listar as reservas, qualquer um pode ver todas, só o gestor pode criar
class ReservaListCreateView(ListCreateAPIView):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer

    # se for método get qualquer usuário pode visualizar, se for outro método só o gestor pode realizar a ação
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated]
        return [IsGestor()]
    

    # permite fazer uma consulta para ver as reservas de um professor específico pelo ID
    def get_queryset(self):
        queryset = super().get_queryset()
        professor_id = self.request.query_params.get('P', None)
        if professor_id: 
            queryset = queryset.filter(professor_id=professor_id)
        return queryset
    

# vai permitir que o gestor ou o dono da reserva consiga editar as reservas
class ReservaRetrieveDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [IsDonoOuGestor]
    lookup_field = 'pk'


# permite que apenas o professor pode ver suas próprias reservas
class ReservaPorProfessorListView(ListAPIView):
    serializer_class = ReservaSerializer
    permission_classes = [IsProfessor]

    # filtrar as reservas do professor específico
    def get_queryset(self):
        return Reserva.objects.filter(professor_responsavel=self.request.user)