from django.contrib import admin
from django.urls import include, path
from . import views
from .views import chatbot_view
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('chat/', chatbot_view, name = "chat"),
]+ static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])