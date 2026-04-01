from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """
    Usuario extendido con campos personalizados para la aplicación
    """
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('owner', 'Propietario'),
        ('resident', 'Residente'),
        ('guard', 'Vigilante'),
        ('accountant', 'Contador'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='Correo Electrónico')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Teléfono')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident', verbose_name='Rol')
    unit_number = models.CharField(max_length=10, blank=True, null=True, verbose_name='Número de Unidad')
    is_verified = models.BooleanField(default=False, verbose_name='Email Verificado')
    profile_picture = models.URLField(blank=True, null=True, verbose_name='Foto de Perfil')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')
    
    # OAuth fields
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True, verbose_name='Google ID')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class UserSession(models.Model):
    """
    Registro de sesiones activas de usuarios
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    token = models.CharField(max_length=500, unique=True)
    ip_address = models.GenericIPAddressField(verbose_name='Dirección IP')
    user_agent = models.TextField(verbose_name='User Agent')
    device_info = models.CharField(max_length=255, blank=True, null=True, verbose_name='Información del Dispositivo')
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name='Ubicación')
    is_active = models.BooleanField(default=True, verbose_name='Sesión Activa')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Inicio de Sesión')
    last_activity = models.DateTimeField(auto_now=True, verbose_name='Última Actividad')
    expires_at = models.DateTimeField(verbose_name='Fecha de Expiración')
    
    class Meta:
        verbose_name = 'Sesión de Usuario'
        verbose_name_plural = 'Sesiones de Usuarios'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.created_at}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at


class AuditLog(models.Model):
    """
    Registro de auditoría de acciones de seguridad
    """
    ACTION_CHOICES = [
        ('login_success', 'Login Exitoso'),
        ('login_failed', 'Login Fallido'),
        ('refresh_success', 'Refresh Exitoso'),
        ('refresh_failed', 'Refresh Fallido'),
        ('logout', 'Cierre de Sesión'),
        ('password_change', 'Cambio de Contraseña'),
        ('password_reset', 'Recuperación de Contraseña'),
        ('account_created', 'Cuenta Creada'),
        ('account_deleted', 'Cuenta Eliminada'),
        ('role_changed', 'Cambio de Rol'),
        ('unauthorized_access', 'Acceso No Autorizado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, verbose_name='Acción')
    ip_address = models.GenericIPAddressField(verbose_name='Dirección IP')
    user_agent = models.TextField(blank=True, null=True, verbose_name='User Agent')
    details = models.JSONField(blank=True, null=True, verbose_name='Detalles Adicionales')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Fecha y Hora')
    
    class Meta:
        verbose_name = 'Registro de Auditoría'
        verbose_name_plural = 'Registros de Auditoría'
        ordering = ['-timestamp']
    
    def __str__(self):
        user_email = self.user.email if self.user else 'Usuario Anónimo'
        return f"{user_email} - {self.get_action_display()} - {self.timestamp}"
