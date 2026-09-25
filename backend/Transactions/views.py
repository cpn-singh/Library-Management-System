from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from .models import BorrowRecords, Fine, ActivityLog
from .serializers import BorrowRecordSerializer, FineSerializer, ActivityLogSerializer
from Catalogs.models import Books, BookCopy
from Accounts.models import User

FINE_RATE_PER_DAY = 0.50
MAX_LOAN_DAYS = 14
MAX_BORROW_LIMIT = 5

@api_view(['GET'])
@permission_classes([AllowAny])
def api_loans_list(request):
    user_id = request.query_params.get('userId')
    loans = BorrowRecords.objects.select_related('user', 'book', 'copy').order_by('-id')
    if user_id:
        loans = loans.filter(user_id=user_id)
    return Response(BorrowRecordSerializer(loans, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_borrow_book(request):
    data = request.data
    book_id = data.get('bookId')
    copy_id = data.get('copyId')
    user_id = data.get('userId')

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if user.status == 'suspended':
        return Response({'detail': 'Your membership account is suspended. Contact administration.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check active loans limit
    active_loans_count = BorrowRecords.objects.filter(user=user, is_returned=False).count()
    if active_loans_count >= MAX_BORROW_LIMIT:
        return Response({'detail': f'Borrow limit reached. Max {MAX_BORROW_LIMIT} books concurrently.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check outstanding unpaid fines >= $10
    unpaid_fines = Fine.objects.filter(user=user, status='pending').aggregate(total=Sum('fine_amount'))['total'] or 0
    if unpaid_fines >= 10:
        return Response({'detail': f'Borrowing blocked: You have ${unpaid_fines:.2f} in outstanding fines.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        book = Books.objects.get(pk=book_id)
    except Books.DoesNotExist:
        return Response({'detail': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

    copy = None
    if copy_id:
        copy = BookCopy.objects.filter(book=book, copy_id=copy_id, status='available').first()
    if not copy:
        copy = BookCopy.objects.filter(book=book, status='available').first()

    if not copy:
        return Response({'detail': f'Sorry, all copies of "{book.title}" are currently checked out.'}, status=status.HTTP_400_BAD_REQUEST)

    borrow_date = timezone.now().date()
    due_date = borrow_date + timedelta(days=MAX_LOAN_DAYS)

    loan = BorrowRecords.objects.create(
        user=user,
        book=book,
        copy=copy,
        due_date=due_date,
        is_returned=False,
        status='active',
        renewals_left=2,
        notes='Standard 14-day checkout.'
    )

    copy.status = 'borrowed'
    copy.save()

    book.available_copies = book.copies.filter(status='available').count()
    book.save()

    ActivityLog.objects.create(
        action_type='checkout',
        description=f'{user.full_name} checked out "{book.title}" (Copy: {copy.barcode})',
        user=user.full_name
    )

    return Response(BorrowRecordSerializer(loan).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_return_book(request, pk):
    try:
        loan = BorrowRecords.objects.select_related('user', 'book', 'copy').get(pk=pk)
    except BorrowRecords.DoesNotExist:
        return Response({'detail': 'Loan record not found.'}, status=status.HTTP_404_NOT_FOUND)

    if loan.is_returned:
        return Response({'detail': 'Book is already returned.'}, status=status.HTTP_400_BAD_REQUEST)

    return_condition = request.data.get('returnCondition', 'Good')
    notes = request.data.get('notes', '')

    today = timezone.now().date()
    loan.return_date = today
    loan.is_returned = True
    loan.status = 'returned'
    if notes:
        loan.notes = f"{loan.notes} | Return note: {notes}"

    fine_created = None
    fine_amount = 0

    if today > loan.due_date:
        diff_days = (today - loan.due_date).days
        fine_amount = round(diff_days * FINE_RATE_PER_DAY, 2)
        loan.fine_amount = fine_amount
        loan.fine_paid = False

        fine_created = Fine.objects.create(
            borrow_record=loan,
            user=loan.user,
            fine_amount=fine_amount,
            days_overdue=diff_days,
            rate_per_day=FINE_RATE_PER_DAY,
            status='pending',
            reason=f'Late return: {diff_days} day(s) overdue @ ${FINE_RATE_PER_DAY:.2f}/day'
        )
        ActivityLog.objects.create(
            action_type='fine_issued',
            description=f'Late return fee of ${fine_amount:.2f} for {loan.user.full_name} ("{loan.book.title}")',
            user='System Fine Rule'
        )

    loan.save()

    if loan.copy:
        loan.copy.status = 'available'
        loan.copy.condition = return_condition
        loan.copy.save()

    book = loan.book
    book.available_copies = book.copies.filter(status='available').count()
    book.save()

    ActivityLog.objects.create(
        action_type='return',
        description=f'{loan.user.full_name} returned "{loan.book.title}" (Condition: {return_condition})',
        user=loan.user.full_name
    )

    return Response({
        'loan': BorrowRecordSerializer(loan).data,
        'fine': FineSerializer(fine_created).data if fine_created else None,
        'fineAmount': fine_amount,
        'isOverdue': fine_amount > 0
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def api_renew_loan(request, pk):
    try:
        loan = BorrowRecords.objects.select_related('user', 'book').get(pk=pk)
    except BorrowRecords.DoesNotExist:
        return Response({'detail': 'Loan not found.'}, status=status.HTTP_404_NOT_FOUND)

    if loan.is_returned:
        return Response({'detail': 'Book has already been returned.'}, status=status.HTTP_400_BAD_REQUEST)

    today = timezone.now().date()
    if today > loan.due_date:
        return Response({'detail': 'Cannot renew an overdue book. Please return it and settle any fines.'}, status=status.HTTP_400_BAD_REQUEST)

    if loan.renewals_left <= 0:
        return Response({'detail': 'Maximum renewal limit reached (2 renewals allowed).'}, status=status.HTTP_400_BAD_REQUEST)

    loan.due_date = loan.due_date + timedelta(days=7)
    loan.renewals_left -= 1
    loan.save()

    ActivityLog.objects.create(
        action_type='renew',
        description=f'{loan.user.full_name} renewed "{loan.book.title}" (+7 days)',
        user=loan.user.full_name
    )

    return Response(BorrowRecordSerializer(loan).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_fines_list(request):
    fines = Fine.objects.select_related('borrow_record', 'user', 'borrow_record__book').order_by('-id')
    return Response(FineSerializer(fines, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_pay_fine(request, pk):
    try:
        fine = Fine.objects.select_related('borrow_record', 'user').get(pk=pk)
    except Fine.DoesNotExist:
        return Response({'detail': 'Fine not found.'}, status=status.HTTP_404_NOT_FOUND)

    payment_method = request.data.get('paymentMethod', 'Credit Card')
    fine.status = 'paid'
    fine.is_paid = True
    fine.payment_date = timezone.now().date()
    fine.payment_method = payment_method
    fine.save()

    if fine.borrow_record:
        fine.borrow_record.fine_paid = True
        fine.borrow_record.save()

    user_name = fine.user.full_name if fine.user else (fine.borrow_record.user.full_name if fine.borrow_record else 'Patron')
    ActivityLog.objects.create(
        action_type='fine_paid',
        description=f'${fine.fine_amount:.2f} fine paid by {user_name} via {payment_method}',
        user='Cashier'
    )

    return Response(FineSerializer(fine).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_waive_fine(request, pk):
    try:
        fine = Fine.objects.select_related('borrow_record', 'user').get(pk=pk)
    except Fine.DoesNotExist:
        return Response({'detail': 'Fine not found.'}, status=status.HTTP_404_NOT_FOUND)

    reason = request.data.get('reason', 'Librarian Courtesy Discretion')
    fine.status = 'waived'
    fine.is_paid = True
    fine.waived_reason = reason
    fine.payment_date = timezone.now().date()
    fine.save()

    if fine.borrow_record:
        fine.borrow_record.fine_paid = True
        fine.borrow_record.save()

    user_name = fine.user.full_name if fine.user else (fine.borrow_record.user.full_name if fine.borrow_record else 'Patron')
    ActivityLog.objects.create(
        action_type='fine_waived',
        description=f'${fine.fine_amount:.2f} fine waived for {user_name}. Reason: {reason}',
        user='Head Librarian'
    )

    return Response(FineSerializer(fine).data)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_activity_logs(request):
    if request.method == 'GET':
        logs = ActivityLog.objects.all().order_by('-id')[:100]
        return Response(ActivityLogSerializer(logs, many=True).data)
    elif request.method == 'POST':
        action_type = request.data.get('type', 'system')
        description = request.data.get('description', '')
        user = request.data.get('user', 'System')
        log = ActivityLog.objects.create(action_type=action_type, description=description, user=user)
        return Response(ActivityLogSerializer(log).data, status=status.HTTP_201_CREATED)

