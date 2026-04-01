from ninja import Router
from ninja.errors import HttpError
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from ninja_jwt.tokens import RefreshToken
from ninja_jwt.schema import TokenRefreshSchema
import secrets

from .models import User, AuditLog, UserSession
from .schemas import (
    RegisterSchema,
    LoginSchema,
    GoogleAuthSchema,
    UserSchema,
    AuthResponseSchema,
    MessageSchema,
    LogoutSchema,
    TokenRefreshResponseSchema
)

router = Router()


@router.post("/refresh", auth=None, response={200: TokenRefreshResponseSchema})
def refresh_token(request, data: TokenRefreshSchema) -> TokenRefreshResponseSchema:
    """Refrescar el token de acceso usando un token de refresco"""
    session = UserSession.objects.select_related('user').filter(
        token=data.refresh,
        is_active=True
    ).first()

    if not session or session.is_expired():
        create_audit_log(
            session.user if session else None,
            'refresh_failed',
            request,
            {'reason': 'session_not_found_or_expired'}
        )
        raise HttpError(401, 'Invalid refresh token')

    try:
        # Validate provided refresh token is structurally valid
        RefreshToken(data.refresh)
    except Exception:
        create_audit_log(session.user, 'refresh_failed', request, {'reason': 'invalid_refresh'})
        raise HttpError(401, 'Invalid refresh token')

    # Rotate refresh token and issue new access token
    rotated_refresh = RefreshToken.for_user(session.user)
    new_access_token = str(rotated_refresh.access_token)
    new_refresh_token = str(rotated_refresh)

    session.token = new_refresh_token
    session.expires_at = timezone.now() + timedelta(days=7)
    session.is_active = True
    session.save(update_fields=['token', 'expires_at', 'is_active', 'last_activity'])

    create_audit_log(session.user, 'refresh_success', request, {'rotated': True})

    return TokenRefreshResponseSchema(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )


def get_client_ip(request):
    """Obtener IP del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def create_audit_log(user, action, request, details=None):
    """Crear registro de auditoría"""
    AuditLog.objects.create(
        user=user,
        action=action,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        details=details
    )


def create_user_session(user, request, token):
    """Crear sesión de usuario"""
    UserSession.objects.create(
        user=user,
        token=token,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        expires_at=timezone.now() + timedelta(days=7)
    )


@router.post('/register', response=AuthResponseSchema, auth=None)
def register(request, data: RegisterSchema):
    """Registro de nuevo usuario"""
    # Verificar si el email ya existe
    if User.objects.filter(email=data.email).exists():
        raise HttpError(400, 'Este correo electrónico ya está registrado')
    
    # Verificar si el username ya existe
    username = data.email.split('@')[0]
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    try:
        # Crear usuario
        user = User.objects.create(
            email=data.email,
            username=username,
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            unit_number=data.unit_number,
            password=make_password(data.password),
            role='resident',  # Rol por defecto
            is_verified=False
        )
        
        # Crear tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Crear sesión
        create_user_session(user, request, refresh_token)
        
        # Crear log de auditoría
        create_audit_log(user, 'account_created', request)
        
        # Preparar respuesta
        user_data = UserSchema(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role,
            unit_number=user.unit_number,
            is_verified=user.is_verified,
            profile_picture=user.profile_picture
        )
        
        return AuthResponseSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_data
        )
    
    except Exception as e:
        raise HttpError(500, f'Error al crear la cuenta: {str(e)}')


@router.post('/google-auth', response=AuthResponseSchema, auth=None)
def google_auth(request, data: GoogleAuthSchema):
    """Autenticación con Google OAuth - Solo para usuarios existentes"""
    print(f"DEBUG: Intento de Google Login para email: {data.email}")
    try:
        # Buscar usuario por google_id
        user = User.objects.filter(google_id=data.google_id).first()
        
        # Si no existe por google_id, buscar por email
        if not user:
            print(f"DEBUG: Usuario no encontrado por google_id. Buscando por email: {data.email}")
            user = User.objects.filter(email=data.email).first()
            
            # Si existe por email pero no tiene google_id, vincularlo
            if user:
                print(f"DEBUG: Usuario encontrado por email. Vinculando google_id: {data.google_id}")
                user.google_id = data.google_id
                if data.profile_picture and not user.profile_picture:
                    user.profile_picture = data.profile_picture
                user.save()
            else:
                # ❌ NO CREAMOS EL USUARIO AUTOMÁTICAMENTE EN LOGIN
                print(f"DEBUG: Usuario no encontrado. Login fallido para: {data.email}")
                raise HttpError(404, 'Usuario no encontrado. Por favor, regístrate primero.')
        
        # Si llegamos aquí, el usuario existe. Registrar éxito.
        print(f"DEBUG: Login exitoso para {user.email}")
        create_audit_log(user, 'login_success', request, {'method': 'google_oauth'})
        
        # Verificar si el usuario está activo
        if not user.is_active:
            raise HttpError(403, 'Tu cuenta ha sido desactivada')
        
        # Crear tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Crear sesión
        create_user_session(user, request, refresh_token)
        
        # Actualizar last_login
        user.last_login = timezone.now()
        user.save()
        
        # Preparar respuesta
        user_data = UserSchema(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role,
            unit_number=user.unit_number,
            is_verified=user.is_verified,
            profile_picture=user.profile_picture
        )
        
        return AuthResponseSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_data
        )
    
    except HttpError:
        raise
    except Exception as e:
        raise HttpError(500, f'Error en autenticación con Google: {str(e)}')


@router.post('/google-register', response=AuthResponseSchema, auth=None)
def google_register(request, data: GoogleAuthSchema):
    """Registro de nuevo usuario mediante Google OAuth"""
    try:
        # Verificar si el usuario ya existe
        user = User.objects.filter(email=data.email).first()
        
        if user:
            # Si ya existe, actualizamos su google_id si no lo tenía
            if not user.google_id:
                user.google_id = data.google_id
                user.save()
            
            # Y procedemos como un login normal
            create_audit_log(user, 'login_success', request, {'method': 'google_oauth', 'action': 'login_during_register'})
        else:
            # Crear nuevo usuario
            username = data.email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create(
                email=data.email,
                username=username,
                first_name=data.first_name,
                last_name=data.last_name,
                google_id=data.google_id,
                profile_picture=data.profile_picture,
                role='resident',
                is_verified=True,
                is_active=True
            )
            user.set_unusable_password()
            user.save()
            
            create_audit_log(user, 'account_created', request, {'method': 'google_oauth'})
        
        # Generar tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        create_user_session(user, request, refresh_token)
        
        user_data = UserSchema(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role,
            unit_number=user.unit_number,
            is_verified=user.is_verified,
            profile_picture=user.profile_picture
        )
        
        return AuthResponseSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_data
        )
    except Exception as e:
        raise HttpError(500, f'Error al registrar con Google: {str(e)}')


@router.post('/login', response=AuthResponseSchema, auth=None)
def login(request, data: LoginSchema):
    """Inicio de sesión"""
    try:
        # Buscar usuario por email
        user = User.objects.filter(email=data.email).first()
        
        if not user:
            create_audit_log(None, 'login_failed', request, {'email': data.email, 'reason': 'user_not_found'})
            raise HttpError(401, 'EMAIL_NOT_FOUND')
        
        # Verificar contraseña
        if not user.check_password(data.password):
            create_audit_log(user, 'login_failed', request, {'reason': 'invalid_password'})
            raise HttpError(401, 'INVALID_PASSWORD')
        
        # Verificar si el usuario está activo
        if not user.is_active:
            create_audit_log(user, 'login_failed', request, {'reason': 'account_inactive'})
            raise HttpError(403, 'Tu cuenta ha sido desactivada')
        
        # Crear tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Crear sesión
        create_user_session(user, request, refresh_token)
        
        # Actualizar last_login
        user.last_login = timezone.now()
        user.save()
        
        # Crear log de auditoría
        create_audit_log(user, 'login_success', request)
        
        # Preparar respuesta
        user_data = UserSchema(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role,
            unit_number=user.unit_number,
            is_verified=user.is_verified,
            profile_picture=user.profile_picture
        )
        
        return AuthResponseSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_data
        )
    
    except HttpError:
        raise
    except Exception as e:
        raise HttpError(500, f'Error en el inicio de sesión: {str(e)}')


@router.post('/logout', response=MessageSchema, auth=None)
def logout(request, data: LogoutSchema) -> MessageSchema:
    """Cerrar sesión"""
    session = UserSession.objects.select_related('user').filter(
        token=data.refresh,
        is_active=True
    ).first()

    if not session:
        raise HttpError(401, 'Invalid refresh token')

    session.is_active = False
    session.save(update_fields=['is_active', 'last_activity'])

    create_audit_log(session.user, 'logout', request, {'revoked': True})

    return MessageSchema(message='Sesión cerrada exitosamente')


@router.get('/me', response=UserSchema)
def get_current_user(request):
    """Obtener usuario actual (requiere autenticación)"""
    if not request.auth:
        raise HttpError(401, 'No autenticado')
    
    user = request.auth
    return UserSchema(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        role=user.role,
        unit_number=user.unit_number,
        is_verified=user.is_verified,
        profile_picture=user.profile_picture
    )
