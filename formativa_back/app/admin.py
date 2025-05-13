from django.contrib import admin
from .models import Usuario, Disciplina, Salas, Reserva
# Register your models here.

admin.site.register(Usuario)
admin.site.register(Disciplina)
admin.site.register(Salas)
admin.site.register(Reserva)

