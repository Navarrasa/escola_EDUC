from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from .constants import TIPO_USUARIO, PERIODO_CHOICES


class Usuario(AbstractUser):
    """Modelo de usuário personalizado com tipos Gestor e Professor."""
    tipo = models.CharField(
        max_length=10,
        choices=TIPO_USUARIO,
        default='PROFESSOR',
        help_text="Tipo de usuário (Gestor ou Professor)."
    )
    ni = models.PositiveIntegerField(
        unique=True,
        help_text="Número de identificação único."
    )
    email = models.EmailField(
        unique=True,
        blank=True,
        null=True,
        help_text="E-mail do usuário."
    )
    telefone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Formato de telefone inválido.')],
        help_text="Telefone no formato +5511999999999."
    )
    data_nascimento = models.DateField(
        blank=True,
        null=True,
        help_text="Data de nascimento do usuário."
    )
    data_contratacao = models.DateField(
        blank=True,
        null=True,
        help_text="Data de contratação do usuário."
    )

    REQUIRED_FIELDS = ['ni', 'email', 'tipo']  # Ajustado para consistência com blank/null

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.username} ({self.ni})"

    class Meta:
        indexes = [models.Index(fields=['ni'])]
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"


class Disciplina(models.Model):
    """Modelo para representar disciplinas acadêmicas."""
    nome = models.CharField(max_length=100, help_text="Nome da disciplina.")
    curso = models.CharField(max_length=100, help_text="Curso associado à disciplina.")
    descricao = models.TextField(blank=True, null=True, help_text="Descrição da disciplina.")
    carga_horaria = models.PositiveIntegerField(help_text="Carga horária em horas.")
    professor = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        related_name='disciplinas',
        null=True,
        blank=True,
        limit_choices_to={'tipo': 'PROFESSOR'},
        help_text="Professor responsável pela disciplina."
    )

    def __str__(self):
        return f"{self.nome} ({self.curso})"

    class Meta:
        verbose_name = "Disciplina"
        verbose_name_plural = "Disciplinas"


class Sala(models.Model):
    """Modelo para representar salas disponíveis."""
    nome = models.CharField(max_length=100, help_text="Nome ou identificador da sala.")
    curso = models.CharField(max_length=100, help_text="Curso associado à sala.")
    descricao = models.TextField(blank=True, null=True, help_text="Descrição da sala.")
    capacidade = models.PositiveIntegerField(help_text="Capacidade máxima da sala.")
    professor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='salas',
        null=False,
        blank=False,
        limit_choices_to={'tipo': 'PROFESSOR'},
        help_text="Professor responsável pela sala, se aplicável."
    )
    periodo = models.CharField(max_length=5, choices=PERIODO_CHOICES, help_text="Período em que a sala está disponível.")

    def save(self, *args, **kwargs):
        """Garante que um professor não seja associado a mais de uma sala."""
        if self.professor:
            existing = Sala.objects.filter(professor=self.professor)
            if self.pk:
                existing = existing.exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError("Um professor não pode ser responsável por mais de uma sala.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sala {self.nome} (Capacidade: {self.capacidade})"

    class Meta:
        verbose_name = "Sala"
        verbose_name_plural = "Salas"


class Reserva(models.Model):
    """Modelo para representar reservas de salas."""
    data_inicio = models.DateTimeField(help_text="Data e hora de início da reserva.")
    data_termino = models.DateTimeField(help_text="Data e hora de término da reserva.")
    periodo = models.CharField(
        max_length=5,  # Ajustado para corresponder a PERIODO_CHOICES
        choices=PERIODO_CHOICES,
        help_text="Período da reserva (Manhã, Tarde, Noite)."
    )
    sala_reservada = models.ForeignKey(
        Sala,
        on_delete=models.CASCADE,
        related_name='reservas',
        help_text="Sala reservada."
    )
    professor_responsavel = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='reservas',
        limit_choices_to={'tipo': 'PROFESSOR'},
        help_text="Professor responsável pela reserva."
    )
    disciplina_associada = models.ForeignKey(
        Disciplina,
        on_delete=models.CASCADE,
        related_name='reservas',
        help_text="Disciplina associada à reserva."
    )

    def save(self, *args, **kwargs):
        """Valida que não há conflitos de horário para a mesma sala."""
        if self.data_termino <= self.data_inicio:
            raise ValidationError("A data de término deve ser posterior à data de início.")

        # Verifica conflitos de horário
        overlapping = Reserva.objects.filter(
            sala_reservada=self.sala_reservada,
            data_inicio__lt=self.data_termino,
            data_termino__gt=self.data_inicio
        )
        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)
        if overlapping.exists():
            raise ValidationError("A sala já está reservada para este período.")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reserva {self.sala_reservada.nome} ({self.get_periodo_display()}) {self.data_inicio.strftime('%d/%m/%Y %H:%M')} - {self.data_termino.strftime('%d/%m/%Y %H:%M')}"

    class Meta:
        indexes = [
            models.Index(fields=['data_inicio', 'data_termino']),
            models.Index(fields=['sala_reservada'])
        ]
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
