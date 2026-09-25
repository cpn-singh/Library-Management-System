from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    is_librarian = models.BooleanField(default=False)
    is_member = models.BooleanField(default=True)
    role = models.CharField(max_length=20, choices=[('member', 'Member'), ('librarian', 'Librarian')], default='member')
    status = models.CharField(max_length=20, default='active')
    membership_id = models.CharField(max_length=30, unique=True, null=True, blank=True)
    membership_tier = models.CharField(max_length=50, default='Standard Reader')
    avatar = models.URLField(max_length=2000, blank=True, null=True)
    phone_number = models.CharField(max_length=30, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.role == 'librarian':
            self.is_librarian = True
            self.is_staff = True
        elif self.role == 'member':
            self.is_member = True
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.username

    def __str__(self):
        return f"{self.full_name} ({self.username})"