from flask import Blueprint, request
from app.services import loan_service
from app.utils.decorators import role_required
from app.utils.responses import success_response, error_response

loan_bp = Blueprint('loans', __name__)

@loan_bp.route('/issue', methods=['POST'])
@role_required('admin', 'librarian')
def issue():
    data = request.get_json()
    try:
        loan = loan_service.issue_book(data['book_id'], data['member_id'])
        return success_response(loan.to_dict(), "Book issued successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)

@loan_bp.route('/<int:id>/return', methods=['POST'])
@role_required('admin', 'librarian')
def return_loan(id):
    try:
        loan = loan_service.return_book(id)
        message = "Book returned"
        if loan.fine_amount > 0:
            message += f" — fine of {loan.fine_amount} applies (returned late)"
        return success_response(loan.to_dict(), message)
    except ValueError as e:
        return error_response(str(e), 400)

@loan_bp.route('/overdue', methods=['GET'])
@role_required('admin', 'librarian')
def overdue():
    loans = loan_service.get_overdue_loans()
    return success_response([l.to_dict() for l in loans])

@loan_bp.route('/member/<int:member_id>', methods=['GET'])
@role_required('admin', 'librarian')
def member_loans(member_id):
    from app.models import Loan
    loans = Loan.query.filter_by(member_id=member_id).all()
    return success_response([l.to_dict() for l in loans])