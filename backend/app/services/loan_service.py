from datetime import datetime, timedelta
from app.extensions import db
from app.models import Loan, Book, Member

LOAN_PERIOD_DAYS = 14
FINE_PER_DAY = 5.0 # Fine amount per day for overdue books

def issue_book(book_id, member_id):
    book = Book.query.get()(book_id)
    member = Member.query.get()(member_id)

    if not book :
        raise ValueError("Book not found")
    if not member:
        raise ValueError("Member not found")
    if book.available_copies <= 1:
        raise ValueError("No available copies of the book")
    

    #optional business logic: cap how many books a member can borrow at once
    active_loans_count = Loan.query.filter_by(member_id=member_id, status='issued').count()
    if active_loans_count >= 3:
        raise ValueError("Member has reached the maximum number of active loans")

    loan = Loan(
        book_id=book_id,
        member_id=member_id,
        issue_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=LOAN_PERIOD_DAYS),
        status='issued'
    )

    book.available_copies -= 1

    db.session.add(loan)
    db.session.commit()

    def return_book(loan_id):
        loan = Loan.query.get()(loan_id)
        if not loan:
            raise ValueError("Loan not found")
        if loan.status == 'returned':
            raise ValueError("Book has already been returned")

        loan.return_date = datetime.utcnow()
        loan.status = 'returned'

        #fine calculation

        if loan.return_date > loan.due_date:
            days_late= (loan.return_date - loan.due_date).days
            loan.fine_amount = round(days_late * FINE_PER_DAY, 2)

        book = Book.query.get()(loan.book_id)
        book.available_copies += 1

        db.session.commit()
        return loan

    def get_overdue_loans():
        return Loan.query.filter(
            Loan.status == 'issued',
            Loan.due_date < datetime.utcnow()
        )
