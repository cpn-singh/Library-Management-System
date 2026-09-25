from rest_framework import serializers
from .models import BorrowRecords, Fine, ActivityLog

class BorrowRecordSerializer(serializers.ModelSerializer):
    bookId = serializers.IntegerField(source='book.id', read_only=True)
    bookTitle = serializers.CharField(source='book.title', read_only=True)
    bookAuthor = serializers.CharField(source='book.author_name', read_only=True)
    bookCover = serializers.CharField(source='book.cover_url', read_only=True)
    copyId = serializers.SerializerMethodField()
    copyBarcode = serializers.SerializerMethodField()
    userId = serializers.IntegerField(source='user.id', read_only=True)
    userName = serializers.CharField(source='user.full_name', read_only=True)
    userEmail = serializers.CharField(source='user.email', read_only=True)
    borrowDate = serializers.DateField(source='borrow_date', read_only=True)
    dueDate = serializers.DateField(source='due_date', read_only=True)
    returnDate = serializers.DateField(source='return_date', read_only=True)
    fineAmount = serializers.DecimalField(source='fine_amount', max_digits=10, decimal_places=2, read_only=True)
    finePaid = serializers.BooleanField(source='fine_paid', read_only=True)
    renewalsLeft = serializers.IntegerField(source='renewals_left', read_only=True)

    class Meta:
        model = BorrowRecords
        fields = [
            'id', 'bookId', 'bookTitle', 'bookAuthor', 'bookCover',
            'copyId', 'copyBarcode', 'userId', 'userName', 'userEmail',
            'borrowDate', 'dueDate', 'returnDate', 'status', 'is_returned',
            'fineAmount', 'finePaid', 'renewalsLeft', 'notes'
        ]

    def get_copyId(self, obj):
        return obj.copy.copy_id if obj.copy else 'N/A'

    def get_copyBarcode(self, obj):
        return obj.copy.barcode if obj.copy else 'N/A'

class FineSerializer(serializers.ModelSerializer):
    loanId = serializers.IntegerField(source='borrow_record.id', read_only=True, allow_null=True)
    userId = serializers.SerializerMethodField()
    userName = serializers.SerializerMethodField()
    userEmail = serializers.SerializerMethodField()
    bookTitle = serializers.SerializerMethodField()
    amount = serializers.DecimalField(source='fine_amount', max_digits=10, decimal_places=2)
    daysOverdue = serializers.IntegerField(source='days_overdue')
    ratePerDay = serializers.DecimalField(source='rate_per_day', max_digits=5, decimal_places=2)
    dateIssued = serializers.DateField(source='fine_date', read_only=True)
    datePaid = serializers.DateField(source='payment_date', read_only=True)
    paymentMethod = serializers.CharField(source='payment_method', read_only=True)
    waivedReason = serializers.CharField(source='waived_reason', read_only=True)

    class Meta:
        model = Fine
        fields = [
            'id', 'loanId', 'userId', 'userName', 'userEmail',
            'bookTitle', 'amount', 'daysOverdue', 'ratePerDay',
            'status', 'is_paid', 'dateIssued', 'datePaid',
            'paymentMethod', 'reason', 'waivedReason'
        ]

    def get_userId(self, obj):
        if obj.user:
            return obj.user.id
        if obj.borrow_record and obj.borrow_record.user:
            return obj.borrow_record.user.id
        return None

    def get_userName(self, obj):
        if obj.user:
            return obj.user.full_name
        if obj.borrow_record and obj.borrow_record.user:
            return obj.borrow_record.user.full_name
        return 'Unknown'

    def get_userEmail(self, obj):
        if obj.user:
            return obj.user.email
        if obj.borrow_record and obj.borrow_record.user:
            return obj.borrow_record.user.email
        return ''

    def get_bookTitle(self, obj):
        if obj.borrow_record and obj.borrow_record.book:
            return obj.borrow_record.book.title
        return 'Library Fine'

class ActivityLogSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='action_type')

    class Meta:
        model = ActivityLog
        fields = ['id', 'timestamp', 'type', 'description', 'user']
