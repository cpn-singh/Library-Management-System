from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, bcrypt
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.utils.responses import error_response


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    @app.route('/')
    def home():
        return{
            'message' : 'Welcome to the Library Management System API',
            'success' : True
        }

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    @app.errorhandler(404)

    def not_found_error(error):
        return error_response("Resource not found", 404)
    @app.errorhandler(500)
    def internal_server_error(error):
        return error_response("Internal server error", 500)

    @app.errorhandler(400)
    def bad_request_error(error):
        return error_response("Bad request", 400)

    from app.routes.auth_routes import auth_bp
    from app.routes.author_routes import author_bp
    from app.routes.category_routes import category_bp
    from app.routes.book_routes import book_bp
    from app.routes.member_routes import member_bp
    from app.routes.loan_routes import loan_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(author_bp, url_prefix='/api/authors')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(book_bp, url_prefix='/api/books')
    app.register_blueprint(member_bp, url_prefix='/api/members')
    app.register_blueprint(loan_bp, url_prefix='/api/loans')

    return app
