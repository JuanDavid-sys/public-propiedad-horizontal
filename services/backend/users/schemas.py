from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

# Request Schemas
class RegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    password_confirm: str
    first_name: str = Field(..., min_length=2)
    last_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    unit_number: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(char.isdigit() for char in v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not any(char.isupper() for char in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(char.islower() for char in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        return v
    
    @validator('password_confirm')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v


class LoginSchema(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class LogoutSchema(BaseModel):
    """Request schema for logout with refresh token."""
    refresh: str


class GoogleAuthSchema(BaseModel):
    """Schema para autenticación con Google OAuth"""
    google_id: str
    email: EmailStr
    first_name: str
    last_name: str
    profile_picture: Optional[str] = None


class UserSchema(BaseModel):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: str
    unit_number: Optional[str]
    is_verified: bool
    profile_picture: Optional[str]
    
    class Config:
        from_attributes = True


class AuthResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'Bearer'
    user: UserSchema


class TokenRefreshResponseSchema(BaseModel):
    """Response schema for refresh endpoint."""
    access_token: str
    refresh_token: str


class MessageSchema(BaseModel):
    message: str
    success: bool = True
