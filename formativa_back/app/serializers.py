from rest_framework import serializers
from .models import Usuario, Disciplina, Salas, Reserva
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class LoginSerializer(TokenObtainPairSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        data = super().validate(attrs)
        print(data)
        data['user'] ={
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
    class Meta:
        model = Usuario
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
            'tipo': {'required': True},
        }

    def validate_tipo(self, value):
        valid_types = ['P', 'G']  
        if value not in valid_types:
            raise serializers.ValidationError("Tipo inválido. Use  'P' (professor) ou 'G' (gestor).")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
    

class SalasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salas
        fields = '__all__'

class DisciplinaSerializer(serializers.ModelSerializer):
    professor = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.filter(tipo='G'))

    class Meta:
        model = Disciplina
        fields = '__all__'
    def validate_professor(self, value):
        if value.tipo != 'G':
            raise serializers.ValidationError("O usuário deve ser um Gestor!.")
        return value

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = '__all__'
        extra_kwargs = {
            'data_inicio': {'required': True},
            'data_termino': {'required': True},
        }

    def validate(self, data):
        if data['data_inicio'] >= data['data_termino']:
            raise serializers.ValidationError("A data de início deve ser anterior à data de término.")
        return data