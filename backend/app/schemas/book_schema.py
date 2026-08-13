from marshmallow import Schema, fields, validate

class BookSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    isbn = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    author_id = fields.Int(required=True)
    category_id = fields.Int(required=True)
    total_copies = fields.Int(required=True, validate=validate.Range(min=1))