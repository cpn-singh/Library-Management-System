from rest_framework import serializers
from .models import Books, BookCopy, Author, Category

class BookCopySerializer(serializers.ModelSerializer):
    copyId = serializers.CharField(source='copy_id')
    shelfLocation = serializers.CharField(source='shelf_location', required=False, allow_blank=True)
    acquiredDate = serializers.DateField(source='acquired_date', required=False, read_only=True)

    class Meta:
        model = BookCopy
        fields = [
            'id', 'copyId', 'copy_id', 'barcode', 'condition',
            'status', 'shelfLocation', 'shelf_location', 'acquiredDate'
        ]

class BookSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author_name')
    category = serializers.CharField(source='category_name', required=False, default='General')
    publishedYear = serializers.IntegerField(source='published_year', required=False, allow_null=True)
    shelfLocation = serializers.CharField(source='shelf_location', required=False, allow_blank=True)
    coverImage = serializers.CharField(source='cover_url', required=False, allow_blank=True)
    copies = BookCopySerializer(many=True, read_only=True)
    initialCopiesCount = serializers.IntegerField(write_only=True, required=False, default=1)

    class Meta:
        model = Books
        fields = [
            'id', 'title', 'author', 'author_name', 'category', 'category_name',
            'isbn', 'publisher', 'publishedYear', 'published_year',
            'shelfLocation', 'shelf_location', 'description',
            'coverImage', 'cover_url', 'price', 'total_copies', 'available_copies',
            'copies', 'initialCopiesCount'
        ]

    def create(self, validated_data):
        initial_copies_count = validated_data.pop('initialCopiesCount', 1)
        author_name = validated_data.get('author_name', '')
        category_name = validated_data.get('category_name', 'General')

        author_obj, _ = Author.objects.get_or_create(
            name=author_name,
            defaults={'bio': '', 'date_of_birth': None}
        ) if author_name else (None, False)

        category_obj, _ = Category.objects.get_or_create(
            name=category_name,
            defaults={'description': ''}
        ) if category_name else (None, False)

        validated_data['author'] = author_obj
        validated_data['category'] = category_obj
        validated_data['total_copies'] = initial_copies_count
        validated_data['available_copies'] = initial_copies_count

        book = Books.objects.create(**validated_data)

        # Generate copies
        isbn_clean = (book.isbn or '0000000000').replace('-', '').replace(' ', '')
        for i in range(1, initial_copies_count + 1):
            copy_num = str(i).padStart(2, '0') if hasattr(str(i), 'padStart') else f"{i:02d}"
            BookCopy.objects.create(
                book=book,
                copy_id=f"CP-BK{book.id}-{copy_num}",
                barcode=f"BAR-BK{book.id}-{copy_num}",
                condition='Mint',
                status='available',
                shelf_location=book.shelf_location or 'Main Stacks'
            )

        return book

    def update(self, instance, validated_data):
        validated_data.pop('initialCopiesCount', None)
        author_name = validated_data.get('author_name', instance.author_name)
        category_name = validated_data.get('category_name', instance.category_name)

        if author_name and author_name != instance.author_name:
            author_obj, _ = Author.objects.get_or_create(name=author_name)
            instance.author = author_obj
            instance.author_name = author_name

        if category_name and category_name != instance.category_name:
            category_obj, _ = Category.objects.get_or_create(name=category_name)
            instance.category = category_obj
            instance.category_name = category_name

        for attr, value in validated_data.items():
            if attr not in ['author_name', 'category_name']:
                setattr(instance, attr, value)

        instance.save()
        return instance
