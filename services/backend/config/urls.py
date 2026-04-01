from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from users.api import router as auth_router
from residential.api import router as residential_router

from ninja_jwt.authentication import JWTAuth

api = NinjaAPI(title="Admin Propiedad Horizontal API", auth=JWTAuth())

# Registrar routers
api.add_router("/auth", auth_router, tags=["Authentication"])
api.add_router("/residential", residential_router, tags=["Residential Management"])

@api.get("/hello")
def hello(request):
    return {"message": "Hola desde Django Ninja!"}

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", api.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
