from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
# Register your models here.
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Library Role & Profile', {
            'fields': ('role', 'is_librarian', 'is_member', 'membership_id', 'membership_tier', 'status', 'phone_number', 'avatar', 'address')
        }),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'status', 'membership_tier', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_librarian', 'is_member', 'status', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number', 'membership_id')

    fieldsets = UserAdmin.fieldsets + (
        ('Library Role & Profile', {
            'fields': ('role', 'is_librarian', 'is_member', 'membership_id', 'membership_tier', 'status', 'phone_number', 'avatar', 'address')
        }),
    )

    def save_model(self, request, obj, form, change):
        if obj.role == 'librarian' or obj.is_librarian:
            obj.is_librarian = True
            obj.is_staff = True
            obj.role = 'librarian'
            if not obj.membership_tier or obj.membership_tier == 'Standard Reader':
                obj.membership_tier = 'Staff Administrator'
            if not obj.membership_id:
                import random
                obj.membership_id = f"STAFF-{random.randint(100, 999)}"
        elif obj.role == 'member' or obj.is_member:
            obj.is_member = True
            obj.role = 'member'
            if not obj.membership_id:
                import random
                obj.membership_id = f"ATH-{random.randint(1000, 9999)}"
        super().save_model(request, obj, form, change)