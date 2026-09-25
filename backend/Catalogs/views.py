from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Books, BookCopy, Author, Category
from .serializers import BookSerializer, BookCopySerializer

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_books_list(request):
    if request.method == 'GET':
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '').strip()

        books = Books.objects.all().prefetch_related('copies').order_by('-id')

        if query:
            books = books.filter(
                Q(title__icontains=query) |
                Q(author_name__icontains=query) |
                Q(isbn__icontains=query) |
                Q(description__icontains=query)
            )

        if category and category.lower() != 'all':
            books = books.filter(category_name__iexact=category)

        # Update available copies count dynamically
        for b in books:
            b.total_copies = b.copies.count()
            b.available_copies = b.copies.filter(status='available').count()

        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            book = serializer.save()
            return Response(BookSerializer(book).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def api_book_detail(request, pk):
    try:
        book = Books.objects.prefetch_related('copies').get(pk=pk)
    except Books.DoesNotExist:
        return Response({'detail': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(BookSerializer(book).data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = BookSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            updated_book = serializer.save()
            return Response(BookSerializer(updated_book).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Check if any copy is borrowed
        from Transactions.models import BorrowRecords
        active_loans = BorrowRecords.objects.filter(book=book, is_returned=False)
        if active_loans.exists():
            return Response(
                {'detail': 'Cannot delete book because one or more copies are currently borrowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        book.delete()
        return Response({'detail': 'Book deleted successfully.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_add_book_copy(request, pk):
    try:
        book = Books.objects.get(pk=pk)
    except Books.DoesNotExist:
        return Response({'detail': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    copy_index = book.copies.count() + 1
    copy_id = data.get('copyId') or f"CP-BK{book.id}-{copy_index:02d}"
    barcode = data.get('barcode') or f"BAR-{(book.isbn or '0000000000').replace('-', '')}-{copy_index:02d}"
    condition = data.get('condition', 'Mint')
    shelf_location = data.get('shelfLocation', book.shelf_location or 'Main Stacks')

    copy = BookCopy.objects.create(
        book=book,
        copy_id=copy_id,
        barcode=barcode,
        condition=condition,
        status='available',
        shelf_location=shelf_location
    )

    book.total_copies = book.copies.count()
    book.available_copies = book.copies.filter(status='available').count()
    book.save()

    return Response(BookCopySerializer(copy).data, status=status.HTTP_201_CREATED)

@api_view(['PATCH', 'DELETE'])
@permission_classes([AllowAny])
def api_manage_copy(request, pk):
    try:
        copy = BookCopy.objects.get(pk=pk)
    except BookCopy.DoesNotExist:
        # Fallback by copy_id string
        try:
            copy = BookCopy.objects.get(copy_id=pk)
        except (BookCopy.DoesNotExist, ValueError):
            return Response({'detail': 'Copy not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        condition = request.data.get('condition')
        copy_status = request.data.get('status')
        shelf_location = request.data.get('shelfLocation') or request.data.get('shelf_location')

        if condition:
            copy.condition = condition
        if copy_status:
            copy.status = copy_status
        if shelf_location:
            copy.shelf_location = shelf_location
        copy.save()

        # Update book counts
        book = copy.book
        book.available_copies = book.copies.filter(status='available').count()
        book.save()

        return Response(BookCopySerializer(copy).data)

    elif request.method == 'DELETE':
        from Transactions.models import BorrowRecords
        if BorrowRecords.objects.filter(copy=copy, is_returned=False).exists():
            return Response({'detail': 'Cannot delete a copy that is currently borrowed.'}, status=status.HTTP_400_BAD_REQUEST)

        book = copy.book
        if book.copies.count() <= 1:
            return Response({'detail': 'Cannot delete the only copy of a book. Delete the book instead.'}, status=status.HTTP_400_BAD_REQUEST)

        copy.delete()
        book.total_copies = book.copies.count()
        book.available_copies = book.copies.filter(status='available').count()
        book.save()

        return Response({'detail': 'Copy removed successfully.'}, status=status.HTTP_200_OK)

    