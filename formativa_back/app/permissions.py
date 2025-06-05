from rest_framework.permissions import BasePermission

class IsGestor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == 'Gestor'


class IsProfessor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == 'Professor'
    
    
class IsDonoOuGestor(BasePermission):
    def has_object_permission(self, request, view, obj): # método para um objeto específico
        if request.user.tipo == 'Gestor':
            return True
        return obj.professor == request.user