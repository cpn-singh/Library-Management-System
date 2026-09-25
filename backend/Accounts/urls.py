from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/register/', views.api_register, name='api_register'),
    path('auth/me/', views.api_current_user, name='api_current_user'),
    path('auth/users/', views.api_user_list, name='api_user_list'),
    path('auth/users/<int:pk>/status/', views.api_update_user_status, name='api_update_user_status'),
]
