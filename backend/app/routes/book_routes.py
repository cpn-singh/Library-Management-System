from flask import Blueprint, request
from app.extensions import db
from app.models import Book, Author, Category
from app.utils.decorators import role_required
from app.utils.responses import success_response, error_response
from app.schemas.book_schema import BookSchema
from marshmallow import ValidationError

book_bp = Blueprint('books', __name__)

@book_bp.route('', methods=['GET'])
def get_books():
    # ----- Query params -----
    title = request.args.get('title')
    category_id = request.args.get('category_id')
    author_id = request.args.get('author_id')
    available_only = request.args.get('available_only')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = Book.query

    if title:
        query = query.filter(Book.title.ilike(f'%{title}%'))
    if category_id:
        query = query.filter_by(category_id=category_id)
    if author_id:
        query = query.filter_by(author_id=author_id)
    if available_only == 'true':
        query = query.filter(Book.available_copies > 0)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        "books": [b.to_dict() for b in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages
    })

@book_bp.route('', methods=['POST'])
@role_required('admin', 'librarian')
def create_book():
    schema = BookSchema()

    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return error_response(err.messages, 400)

    if not Author.query.get(data['author_id']):
        return error_response("Invalid author_id", 400)

    if not Category.query.get(data['category_id']):
        return error_response("Invalid category_id", 400)

    book = Book(
        title=data['title'],
        isbn=data['isbn'],
        author_id=data['author_id'],
        category_id=data['category_id'],
        total_copies=data['total_copies'],
        available_copies=data['total_copies']
    )

    db.session.add(book)
    db.session.commit()

    return success_response(
        book.to_dict(),
        "Book added",
        201
    )

@book_bp.route('/<int:id>', methods=['PUT'])
@role_required('admin', 'librarian')
def update_book(id):
    book = Book.query.get_or_404(id)
    data = request.get_json()
    book.title = data.get('title', book.title)
    book.isbn = data.get('isbn', book.isbn)
    if 'total_copies' in data:
        diff = data['total_copies'] - book.total_copies
        book.total_copies = data['total_copies']
        book.available_copies += diff  
    db.session.commit()
    return success_response(book.to_dict(), "Book updated")

@book_bp.route('/<int:id>', methods=['DELETE'])
@role_required('admin')
def delete_book(id):
    book = Book.query.get_or_404(id)
    if book.available_copies != book.total_copies:
        return error_response("Cannot delete a book with active loans", 400)
    db.session.delete(book)
    db.session.commit()
    return success_response(None, "Book deleted")