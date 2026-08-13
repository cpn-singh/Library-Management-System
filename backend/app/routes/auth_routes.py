from flask import Blueprint, request
from app.extensions import db, bcrypt
from app.models import StaffUser
from flask_jwt_extended import create_access_token
from app.utils.responses import success_response, error_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if StaffUser.query.filter_by(email=data.get('email')).first():
        return error_response("Email already registered", 400)

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = StaffUser(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_pw,
        role=data.get('role', 'librarian')
    )
    db.session.add(user)
    db.session.commit()
    return success_response(user.to_dict(), "Staff account created", 201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = StaffUser.query.filter_by(email=data.get('email')).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data.get('password', '')):
        return error_response("Invalid email or password", 401)

    token = create_access_token(identity=user.id)
    return success_response({"access_token": token, "user": user.to_dict()}, "Login successful")