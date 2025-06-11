from rest_framework.permissions import BasePermission


class IsGestor(BasePermission):
    """Permite acesso apenas a usuários autenticados do tipo Gestor."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == 'GESTOR'


class IsProfessor(BasePermission):
    """Permite acesso apenas a usuários autenticados do tipo Professor."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == 'PROFESSOR'


class IsProfessorOrGestor(BasePermission):
    """Permite acesso a Gestores (qualquer objeto) ou Professores (objetos próprios)."""
    
    def has_permission(self, request, view):
        """Verifica permissões no nível da view (listar/criar).
        
        Permite acesso se o usuário for autenticado e for Gestor ou Professor.
        """
        return request.user.is_authenticated and request.user.tipo in ('GESTOR', 'PROFESSOR')
    
    def has_object_permission(self, request, view, obj):
        """Verifica permissões no nível do objeto (visualizar/atualizar/excluir).
        
        - Gestores têm acesso a qualquer objeto.
        - Professores têm acesso apenas aos objetos onde são o professor responsável.
        """
        if request.user.tipo == 'GESTOR':
            return True
        # Verifica se o objeto tem 'professor' ou 'professor_responsavel'
        professor_field = getattr(obj, 'professor', getattr(obj, 'professor_responsavel', None))
        return professor_field == request.user