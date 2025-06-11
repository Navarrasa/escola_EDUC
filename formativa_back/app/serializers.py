from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
from .models import Usuario, Disciplina, Sala, Reserva


class LoginSerializer(TokenObtainPairSerializer):
    """Serializer para autenticação de usuários com JWT.

    Valida credenciais (username e password) e retorna tokens de acesso/refresh,
    junto com informações do usuário autenticado.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Valida as credenciais e adiciona informações do usuário ao response."""
        # Chama o validador do TokenObtainPairSerializer para autenticar
        data = super().validate(attrs)
        
        # Adiciona detalhes do usuário ao response
        data['user'] = {
            'username': self.user.username,
            'email': self.user.email,
            'tipo': self.user.tipo,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'telefone': self.user.telefone,
            'ni': self.user.ni,
            'data_nascimento': self.user.data_nascimento,
            'data_contratacao': self.user.data_contratacao,
        }
        
        return data


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Usuario.

    Gerencia a serialização/deserialização de usuários, incluindo criação e
    atualização com hash de senha. Valida o campo 'tipo' para aceitar apenas
    'PROFESSOR' ou 'GESTOR'.
    """
    class Meta:
        model = Usuario
        fields = '__all__'  # Inclui todos os campos do modelo
        extra_kwargs = {
            'password': {'write_only': True},  # Senha não é retornada no response
            'tipo': {'required': True},  # Tipo é obrigatório
        }

    def validate_tipo(self, value):
        """Valida se o tipo de usuário é 'PROFESSOR' ou 'GESTOR'."""
        valid_types = ['PROFESSOR', 'GESTOR']
        if value not in valid_types:
            raise serializers.ValidationError("Tipo inválido. Use 'PROFESSOR' ou 'GESTOR'.")
        return value

    def create(self, validated_data):
        """Cria um novo usuário com a senha hasheada."""
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Atualiza um usuário, hasheando a senha se fornecida."""
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)


class SalasSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Sala.

    Gerencia a serialização/deserialização de salas, incluindo todos os campos
    como nome, capacidade e professor responsável.
    """
    class Meta:
        model = Sala
        fields = '__all__'  # Inclui todos os campos do modelo


class DisciplinaSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Disciplina.

    Gerencia a serialização/deserialização de disciplinas, com validação para
    garantir que o professor associado seja do tipo 'PROFESSOR'.
    """
    professor = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(tipo='PROFESSOR')
    )

    class Meta:
        model = Disciplina
        fields = '__all__'  # Inclui todos os campos do modelo

    def validate_professor(self, value):
        """Valida se o usuário associado é um Professor."""
        if value and value.tipo != 'PROFESSOR':
            raise serializers.ValidationError("O usuário deve ser um Professor.")
        return value


class ReservaSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Reserva.

    Gerencia a serialização/deserialização de reservas, com validação para
    garantir que a data de início seja anterior à data de término.
    """
    class Meta:
        model = Reserva
        fields = '__all__'  # Inclui todos os campos do modelo
        extra_kwargs = {
            'data_inicio': {'required': True},  # Data de início é obrigatória
            'data_termino': {'required': True},  # Data de término é obrigatória
        }

    def validate(self, data):
        """Valida se a data de início é anterior à data de término."""
        if data['data_inicio'] >= data['data_termino']:
            raise serializers.ValidationError(
                "A data de início deve ser anterior à data de término."
            )
        return data