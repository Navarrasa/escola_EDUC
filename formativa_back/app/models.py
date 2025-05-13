from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# Create your models here.

class Usuario(AbstractUser):
    TIPO_USUARIO = [
        ('G', 'Gestor'),
        ('P', 'Professor')
    ]

    tipo = models.CharField(max_length=1, choices=TIPO_USUARIO, help_text="Tipo de usuário", null=False, blank=False, default='P')
    ni = models.PositiveIntegerField()
    email = models.EmailField(null=True, blank=True)
    telefone = models.CharField(max_length=15, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)
    data_contratacao = models.DateField(blank=True, null=True)

    REQUIRED_FIELDS = ['ni', 'data_nascimento', 'data_contratacao','tipo']

    def __str__(self):
        return f"{self.get_tipo_display()} {self.username}"


class Disciplina(models.Model):

    nome = models.CharField(max_length=100)
    curso = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    carga_horaria = models.PositiveIntegerField()
    professor = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='disciplinas', null=True, blank=True, limit_choices_to={'tipo':'P'})

    def __str__(self):
        return f"{self.nome}"
    

class Salas(models.Model):
    nome = models.CharField(max_length=100, null=False, blank=False)
    capacidade = models.PositiveIntegerField()
    id_professor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='salas',null=True,blank=True, limit_choices_to={'tipo':'P'})
    
    def save(self, *args, **kwargs):
        if self.pk is None: 
            if self.id_professor is not None:
                if Salas.objects.filter(id_professor=self.id_professor).exists():
                    raise ValidationError("Um professor não pode ocupar mais de uma sala!")
        else:
            if self.id_professor is not None:
                if Salas.objects.filter(id_professor=self.id_professor).exclude(pk=self.pk).exists():
                    raise ValidationError("Um professor não pode ocupar uma sala já ocupada!")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.nome


class Reserva(models.Model):
    PERIODO_CHOICES = [
        ('M', 'Manhã'),
        ('T', 'Tarde'),
        ('N', 'Noite')
    ]

    data_inicio = models.DateTimeField()
    data_termino = models.DateTimeField()
    periodo = models.CharField(max_length=1, choices=PERIODO_CHOICES, help_text="Período da reserva")
    sala_reservada = models.ForeignKey(Salas, on_delete=models.CASCADE, related_name='reservas')
    professor_responsavel = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reservas', limit_choices_to={'tipo':'P'})
    disciplina_associada = models.ForeignKey(Disciplina, on_delete=models.CASCADE, related_name='reservas')

    def save(self, *args, **kwargs):

        if self.pk is None:
            if self.sala_reservada is not None:
                if Reserva.objects.filter(sala_reservada=self.sala_reservada):
                    raise ValidationError("Você não pode reservar uma sala que já está reservada!")
            else:
                if self.sala_reservada is not None:
                    if Reserva.objects.filter(sala_reservada=self.sala_reservada).exclude(pk=self.pk).exists():
                        raise ValidationError("Você não pode reservar uma sala que já está reservada!")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sala {self.sala_reservada} reservada à ({self.get_periodo_display()}) - ({self.data_inicio} - {self.data_termino})"

