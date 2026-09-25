from django.urls import path
from . import views

urlpatterns = [
    path('catalogs/books/', views.api_books_list, name='api_books_list'),
    path('catalogs/books/<int:pk>/', views.api_book_detail, name='api_book_detail'),
    path('catalogs/books/<int:pk>/copies/', views.api_add_book_copy, name='api_add_book_copy'),
    path('catalogs/copies/<str:pk>/', views.api_manage_copy, name='api_manage_copy'),
]
