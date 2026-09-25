import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Core.settings')
django.setup()

from Accounts.models import User
from Transactions.models import BorrowRecords, Fine, ActivityLog
from Catalogs.models import BookCopy, Books
from rest_framework.authtoken.models import Token

def setup_admin_and_clean():
    print("Removing all dummy users, loans, fines, and activity logs...")
    Fine.objects.all().delete()
    BorrowRecords.objects.all().delete()
    ActivityLog.objects.all().delete()

    # Reset any borrowed book copies back to available
    BookCopy.objects.all().update(status='available')
    for book in Books.objects.all():
        book.available_copies = book.copies.count()
        book.save()

    # Delete all users
    User.objects.all().delete()

    print("Creating superuser admin...")
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@library.com',
        password='admin123',
        first_name='Library',
        last_name='Administrator',
        role='librarian',
        is_librarian=True,
        is_staff=True,
        is_superuser=True,
        status='active',
        membership_id='ADMIN-001',
        membership_tier='System Administrator',
        avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        phone_number='+1 (555) 000-0001'
    )
    Token.objects.create(user=admin_user)

    ActivityLog.objects.create(
        action_type='system',
        description='System initialized with superuser admin',
        user='admin'
    )

    print("\nSUCCESS:")
    print(f"Created superuser: username='admin', password='admin123', email='admin@library.com'")
    print("All dummy users removed.")
    print("Admin portal URL: http://127.0.0.1:8000/admin/")

if __name__ == '__main__':
    setup_admin_and_clean()
