from django.contrib import admin
from .models import Usuario, Disciplina, Sala, Reserva
# Register your models here.

admin.site.register(Usuario)
admin.site.register(Disciplina)
admin.site.register(Sala)
admin.site.register(Reserva)

