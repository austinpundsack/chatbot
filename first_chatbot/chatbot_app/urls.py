from django.contrib import admin
from django.urls import include, path
from . import views


urlpatterns = [
    path('', views.chatbot_app, name = "chatbot_app"),
    path('admin/', admin.site.urls),
]