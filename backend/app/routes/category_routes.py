from flask import Blueprint, request

from app.extensions import db
from app.models import Category
from app.utils.decorators import role_required
from app.utils.responses import success_response, error_response


category_bp = Blueprint('categories', __name__)


# GET all categories
@category_bp.route('', methods=['GET'])
def get_categories():
    categories = Category.query.all()

    return success_response(
        [category.to_dict() for category in categories]
    )


# GET single category
@category_bp.route('/<int:id>', methods=['GET'])
def get_category(id):
    category = Category.query.get_or_404(id)

    return success_response(category.to_dict())


# CREATE category
@category_bp.route('', methods=['POST'])
@role_required('admin', 'librarian')
def create_category():
    data = request.get_json()

    if not data or not data.get('name'):
        return error_response("Category name is required", 400)

    if Category.query.filter_by(name=data['name']).first():
        return error_response(
            "A category with this name already exists",
            400
        )

    category = Category(
        name=data['name']
    )

    db.session.add(category)
    db.session.commit()

    return success_response(
        category.to_dict(),
        "Category created",
        201
    )


# UPDATE category
@category_bp.route('/<int:id>', methods=['PUT'])
@role_required('admin', 'librarian')
def update_category(id):
    category = Category.query.get_or_404(id)

    data = request.get_json()

    if not data or not data.get('name'):
        return error_response("Category name is required", 400)

    existing_category = Category.query.filter_by(
        name=data['name']
    ).first()

    if existing_category and existing_category.id != category.id:
        return error_response(
            "A category with this name already exists",
            400
        )

    category.name = data['name']

    db.session.commit()

    return success_response(
        category.to_dict(),
        "Category updated"
    )


# DELETE category
@category_bp.route('/<int:id>', methods=['DELETE'])
@role_required('admin')
def delete_category(id):
    category = Category.query.get_or_404(id)

    if category.books:
        return error_response(
            "Cannot delete a category that has books",
            400
        )

    db.session.delete(category)
    db.session.commit()

    return success_response(
        None,
        "Category deleted"
    )