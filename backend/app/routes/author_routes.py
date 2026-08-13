from flask import Blueprint,request
from app.extensions import db
from app.models import Author
from app.utils.decorators import role_required
from app.utils.responses import success_response, error_response

author_bp = Blueprint('authors', __name__)

@author_bp.route('/', methods=['GET'])
def get_authors():
    authors = Author.query.all()
    return success_response([a.to.dict() for a in authors])

@author_bp.route('', methods=['POST'])
@role_required('admin', 'librarian')
def create_author():
    data = request.get_json()
    if not data.get('name'):
        return error_response("Author name is required", 400)
    author = Author(name=data['name'], bio=data.get('bio'))
    db.session.add(author)
    db.session.commit()
    return success_response(author.to_dict(), "Author created", 201)

@author_bp.route('/<int:id>', methods=['PUT'])
@role_required('admin', 'librarian')
def update_author(id):
    author = Author.query.get_or_404(id)
    data = request.get_json()
    author.name = data.get('name', author.name)
    author.bio = data.get('bio', author.bio)
    db.session.commit()
    return success_response(author.to_dict(), "Author updated")

@author_bp.route('/<int:id>', methods=['DELETE'])
@role_required('admin')
def delete_author(id):
    author = Author.query.get_or_404(id)
    db.session.delete(author)
    db.session.commit()
    return success_response(None, "Author deleted")