from django.contrib import admin
from .models import *
# Register your models here.

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'date_of_birth')
    list_filter = ('date_of_birth',)
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Books)
class BooksAdmin(admin.ModelAdmin):
    list_display = ('title', 'author_name', 'category_name', 'published_year', 'price', 'total_copies', 'available_copies')
    list_filter = ('category_name', 'published_year')
    search_fields = ('title', 'author_name', 'category_name', 'isbn')

@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = ('book', 'copy_id', 'barcode', 'condition', 'status', 'shelf_location')
    list_filter = ('condition', 'status')
    search_fields = ('book__title', 'copy_id', 'barcode')