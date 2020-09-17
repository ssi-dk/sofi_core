from marshmallow import Schema, fields

class CategorySchema(Schema):
    id = fields.Int()
    name = fields.Str(required=True)


class PetSchema(Schema):
    categories = fields.List(fields.Nested(CategorySchema))
    name = fields.Str()
