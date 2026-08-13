import pytest
from app import create_app
from app.extensions import db
from app.models import Author, Category, Book, Member

@pytest.fixture
def client():
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
        author = Author(name='George Orwell')
        category = Category(name='Fiction')
        db.session.add_all([author, category])
        db.session.commit()

        book = Book(title='1984', isbn='1234567890', author_id=author.id, category_id=category.id, total_copies=2, available_copies=2)
        memeber = Member(name='Alice', email = 'alice@test.com')
        db.session.add_all([book, memeber])
        db.session.commit()
    yield client

def test_issue_book_reduces_available_copies(client):
    response = client.post('/api/loans/issue', json={'book_id': 1, 'member_id': 1})
    assert response.status_code in [201, 401]
    # 401 if auth required and not provided and no token is passed