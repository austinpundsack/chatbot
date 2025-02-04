from django.contrib import admin
from django.urls import include, path
from . import views
from .views import chatbot_view


urlpatterns = [
    path('chat/', chatbot_view, name = "chatbot_app"),
    path('admin/', admin.site.urls),
]