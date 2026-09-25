from django.db import models

# Create your models here.
class Author(models.Model):
    name = models.CharField(max_length=150)
    bio = models.TextField(blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name

class Books(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, related_name='books_by_author', on_delete=models.SET_NULL, null=True, blank=True)
    author_name = models.CharField(max_length=150, blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='books_by_category')
    category_name = models.CharField(max_length=100, blank=True, default='General')
    description = models.TextField(blank=True, null=True)
    isbn = models.CharField(max_length=50, unique=True, null=True, blank=True)
    publisher = models.CharField(max_length=200, blank=True, default='')
    published_year = models.IntegerField(null=True, blank=True)
    shelf_location = models.CharField(max_length=100, blank=True, default='Main Stacks')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_copies = models.PositiveIntegerField(default=0)
    available_copies = models.PositiveIntegerField(default=0)
    cover_image = models.ImageField(upload_to='book_covers/', null=True, blank=True)
    cover_url = models.URLField(max_length=2000, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.author and not self.author_name:
            self.author_name = self.author.name
        if self.category and not self.category_name:
            self.category_name = self.category.name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class BookCopy(models.Model):
    book = models.ForeignKey(Books, related_name='copies', on_delete=models.CASCADE)
    copy_id = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=50, unique=True)
    condition = models.CharField(max_length=50, default='Mint')
    status = models.CharField(max_length=50, default='available')
    shelf_location = models.CharField(max_length=100, blank=True, default='Main Stacks')
    acquired_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.book.title} - Copy {self.copy_id} ({self.barcode})"

    