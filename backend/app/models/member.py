from app.extensions import db
from datetime import datetime

class Member(db.Model):
    __tablename__ = 'members'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    joined_on = db.Column(db.DateTime, default=datetime.utcnow)

    loans = db.relationship('Loan', backref='member', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "email": self.email,
            "phone": self.phone, "joined_on": self.joined_on.isoformat()
        }