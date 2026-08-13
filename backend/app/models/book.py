from app.extensions import db

class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    isbn = db.Column(db.String(20), unique=True, nullable=False)
    total_copies = db.Column(db.Integer, default=1, nullable=False)
    available_copies = db.Column(db.Integer, default=1, nullable=False)

    #author
    author_id = db.Column(db.Integer, db.ForeignKey('authors.id'), nullable=False)

    #category
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    #loans
    loans = db.relationship('Loan', backref='book', lazy=True)

    def to_dict(self):
        return {
            'id' : self.id,
            'title' : self.title,
            'isbn' : self.isbn,
            'total_copies' : self.total_copies,
            'available_copies' : self.available_copies,
            'author' : self.author.to_dict() if self.author else None,
            'category' : self.category.to_dict() if self.category else None
        }