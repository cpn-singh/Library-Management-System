from django.contrib import admin
from .models import BorrowRecords, Fine, Memberprofile

# Register your models here.
@admin.register(BorrowRecords)
class BorrowRecordsAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'borrow_date', 'return_date', 'due_date', 'is_returned')
    list_filter = ('is_returned', 'borrow_date', 'return_date', 'due_date')
    search_fields = ('user__username', 'book__title')

@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ('borrow_record', 'fine_amount', 'fine_date', 'is_paid', 'payment_date')
    list_filter = ('is_paid', 'fine_date', 'payment_date')
    search_fields = ('borrow_record__user__username', 'borrow_record__book__title')

@admin.register(Memberprofile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'member_id', 'address', 'phone_number', 'member_since')
    list_filter = ('member_since',)
    search_fields = ('user__username', 'member_id', 'phone_number')