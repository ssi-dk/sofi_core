"""Routes for parent Flask app."""
from flask import render_template
from flask import current_app as app
import json
from flask import Blueprint


myblueprint = Blueprint('routes', __name__)

@myblueprint.route("/random")
def random_pet():
    """A cute furry animal endpoint.
    ---
    get:
    description: Get a random pet
    security:
        - ApiKeyAuth: []
    responses:
        200:
        description: Return a pet
        content:
            application/json:
            schema: PetSchema
    """
    # Hardcoded example data
    pet_data = {
        "name": "sample_pet_" + str(uuid.uuid1()),
        "categories": [{"id": 1, "name": "sample_category"}],
    }
    return PetSchema().dump(pet_data)
