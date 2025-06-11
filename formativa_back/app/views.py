from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario, Disciplina, Sala, Reserva
from .serializers import UsuarioSerializer, DisciplinaSerializer, SalasSerializer, ReservaSerializer, LoginSerializer
from .permissions import IsGestor, IsProfessorOrGestor, IsProfessor


class LoginView(TokenObtainPairView):
    """View para autenticação de usuários com JWT.

    Gera um token de acesso e refresh para usuários autenticados.
    Métodos HTTP suportados: POST
    """
    serializer_class = LoginSerializer


class UsuarioListCreateView(ListCreateAPIView):
    """View para listar e criar usuários.

    Permite que apenas gestores listem todos os usuários ou criem novos usuários.
    Métodos HTTP suportados: GET (listar), POST (criar)
    Permissões: Apenas gestores (IsGestor)
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsGestor]


class UsuarioRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """View para visualizar, atualizar ou excluir um usuário específico.

    Permite que gestores visualizem, atualizem (total ou parcialmente) ou excluam
    um usuário com base no ID (pk).
    Métodos HTTP suportados: GET (visualizar), PUT (atualizar), PATCH (atualização parcial), DELETE (excluir)
    Permissões: Apenas gestores (IsGestor)
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsGestor]
    lookup_field = 'pk'


class DisciplinaListCreateView(ListCreateAPIView):
    """View para listar e criar disciplinas.

    Permite que gestores listem todas as disciplinas ou criem novas disciplinas.
    Métodos HTTP suportados: GET (listar), POST (criar)
    Permissões: Apenas gestores (IsGestor)
    """
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [IsGestor]


class DisciplinaRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """View para visualizar, atualizar ou excluir uma disciplina específica.

    Permite que gestores visualizem, atualizem (total ou parcialmente) ou excluam
    uma disciplina com base no ID (pk).
    Métodos HTTP suportados: GET (visualizar), PUT (atualizar), PATCH (atualização parcial), DELETE (excluir)
    Permissões: Apenas gestores (IsGestor)
    """
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [IsGestor]
    lookup_field = 'pk'


class DisciplinaPorProfessorListView(ListAPIView):
    """View para listar disciplinas de um professor específico.

    Permite que professores visualizem apenas suas próprias disciplinas.
    Filtra as disciplinas com base no usuário logado (professor).
    Métodos HTTP suportados: GET (listar)
    Permissões: Apenas professores (IsProfessor)
    """
    serializer_class = DisciplinaSerializer
    permission_classes = [IsProfessor]
    lookup_field = 'ni'

    def get_queryset(self):
        """Retorna as disciplinas associadas ao professor logado."""
        return Disciplina.objects.filter(professor=self.request.user)


class SalaListCreateAPIView(ListCreateAPIView):
    """View para listar e criar salas.

    Permite que professores ou gestores listem todas as salas ou criem novas salas.
    Métodos HTTP suportados: GET (listar), POST (criar)
    Permissões: Professores ou gestores (IsProfessorOrGestor)
    """
    queryset = Sala.objects.all()
    serializer_class = SalasSerializer
    permission_classes = [IsProfessorOrGestor]


class SalaRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """View para visualizar, atualizar ou excluir uma sala específica.

    Permite que gestores visualizem, atualizem (total ou parcialmente) ou excluam
    uma sala com base no ID (pk).
    Métodos HTTP suportados: GET (visualizar), PUT (atualizar), PATCH (atualização parcial), DELETE (excluir)
    Permissões: Apenas gestores (IsGestor)
    """
    queryset = Sala.objects.all()
    serializer_class = SalasSerializer
    permission_classes = [IsGestor]
    lookup_field = 'pk'


class ReservaListCreateView(ListCreateAPIView):
    """View para listar e criar reservas.

    Permite que qualquer usuário autenticado (professor ou gestor) liste todas as reservas.
    Apenas gestores podem criar novas reservas. Suporta filtragem por professor_id via query parameter.
    Métodos HTTP suportados: GET (listar), POST (criar)
    Permissões: Professores ou gestores (IsProfessorOrGestor)
    """
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [IsProfessorOrGestor]

    def get_queryset(self):
        """Filtra reservas por professor_id, se fornecido nos query parameters."""
        queryset = super().get_queryset()
        professor_id = self.request.query_params.get('Professor', None)
        if professor_id:
            queryset = queryset.filter(professor_id=professor_id)
        return queryset


class ReservaRetrieveDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """View para visualizar, atualizar ou excluir uma reserva específica.

    Permite que gestores ou o professor dono da reserva visualizem, atualizem
    (total ou parcialmente) ou excluam uma reserva com base no ID (pk).
    Métodos HTTP suportados: GET (visualizar), PUT (atualizar), PATCH (atualização parcial), DELETE (excluir)
    Permissões: Professores ou gestores (IsProfessorOrGestor)
    """
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [IsProfessorOrGestor]
    lookup_field = 'pk'


class ReservaPorProfessorListView(ListAPIView):
    """View para listar reservas de um professor específico.

    Permite que professores visualizem apenas suas próprias reservas.
    Filtra as reservas com base no usuário logado (professor).
    Métodos HTTP suportados: GET (listar)
    Permissões: Apenas professores (IsProfessor)
    """
    serializer_class = ReservaSerializer
    permission_classes = [IsProfessor]

    def get_queryset(self):
        """Retorna as reservas associadas ao professor logado."""
        return Reserva.objects.filter(professor_responsavel=self.request.user)