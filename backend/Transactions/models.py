from django.db import models
from django.conf import settings #settings.AUTH_USER_MODEL give us the model that is currently set as the user model
from Catalogs.models import Books

# Create your models here.
class BorrowRecords(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='borrowed_books')
    book = models.ForeignKey(Books, on_delete=models.CASCADE, related_name='borrowed_books')
    copy = models.ForeignKey('Catalogs.BookCopy', on_delete=models.SET_NULL, null=True, blank=True, related_name='borrow_records')
    borrow_date = models.DateField(auto_now_add=True)
    return_date = models.DateField(null=True, blank=True)
    due_date = models.DateField()
    is_returned = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='active')
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    fine_paid = models.BooleanField(default=True)
    renewals_left = models.PositiveIntegerField(default=2)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f'{self.user.username} borrowed {self.book.title}'

class Fine(models.Model):
    borrow_record = models.ForeignKey(BorrowRecords, on_delete=models.CASCADE, related_name='fines', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fines', null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2)
    fine_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')  # 'pending', 'paid', 'waived'
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True, default='')
    days_overdue = models.PositiveIntegerField(default=0)
    rate_per_day = models.DecimalField(max_digits=5, decimal_places=2, default=0.50)
    reason = models.TextField(blank=True, default='')
    waived_reason = models.TextField(blank=True, default='')

    def __str__(self):
        user_name = self.user.username if self.user else (self.borrow_record.user.username if self.borrow_record else 'Unknown')
        book_title = self.borrow_record.book.title if self.borrow_record else 'Fine'
        return f'{user_name} fine for {book_title}'

class Memberprofile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='member_profile')
    member_id = models.CharField(max_length=30, unique=True)
    address = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=30, null=True, blank=True)
    member_since = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} Profile'

class ActivityLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    action_type = models.CharField(max_length=50)
    description = models.TextField()
    user = models.CharField(max_length=150, default='System')

    def __str__(self):
        return f'[{self.action_type}] {self.description[:40]}'

