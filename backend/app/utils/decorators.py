from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import StaffUser
from app.utils.responses import error_response

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = StaffUser.query.get(user_id)
            if not user or user.role not in roles:
                return error_response("You do not have permission for this action", 403)
            return f(*args, **kwargs)
        return wrapper
    return decorator
