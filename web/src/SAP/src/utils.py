from flask import abort
from bson.objectid import ObjectId
 
def validate_sample_ids(samples):
    invalid_samples = [id for id in samples if not ObjectId.is_valid(id)]
    if invalid_samples:
        abort(400, description=f"Invalid sample IDs: {', '.join(invalid_samples)}")