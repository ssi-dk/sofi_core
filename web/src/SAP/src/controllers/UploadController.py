import requests
import csv
from io import StringIO
from ...generated.models.base_metadata import BaseMetadata
from ...generated.models.upload_response import UploadResponse
from ..services.upload_service import upload_sequence_file, upload_isolate, check_bulk_isolate_exists, upload_metadata_list
import json
import sys
from flask import request

def bulk_metadata(user, token_info, metadata_tsv):
    errors = []
    metadata_list = validate_metadata_tsv(metadata_tsv)
    sequence_ids = [m["sequence_id"] for m in metadata_list]
    existing_sequences = check_bulk_isolate_exists(sequence_ids)
    if existing_sequences:
        try:
            metadata = [BaseMetadata.from_dict(m) for m in metadata_list]
            upload_metadata_list(metadata)
        except Exception as e:
            errors.append(f"Error: {str(e)}")

    return upload_response_helper(errors)


def multi_upload(user, token_info, metadata_tsv, files):
    # Files aren't properly routed from connexion, use these files instead:
    files = request.files.getlist('files')
    errors = []
    metadata = []
    try:
        metadata_list = validate_metadata_tsv(metadata_tsv)
        metadata_map = {item['sequence_filename']:item for item in metadata_list}

        for file in files:
            metadata = metadata_map.get(file.filename, None)
            try:
                if metadata:
                    base_metadata = BaseMetadata.from_dict(metadata)
                    current_errors = validate_metadata(base_metadata, file)
                    if not current_errors:
                        upload_isolate(base_metadata, file)
                    else:
                        errors.extend(current_errors)
                else:
                    errors.append(f"{file.filename} does not have a metadata entry")

            except Exception as e:
                errors.append(f"{file.filename} error: {str(e)}")
                continue
    except Exception as e:
        print(e, file=sys.stderr)

    

    return upload_response_helper(errors)


def single_upload(user, token_info, metadata, file):
    base_metadata: BaseMetadata = BaseMetadata.from_dict(json.loads(metadata.read()))
    try:
        upload_isolate(base_metadata, file)
        return upload_response_helper()
    except Exception as e:
        return upload_response_helper([base_metadata.isolate_id, e.args[0]])


def validate_metadata(metadata: BaseMetadata, file):
    errors = []
    if metadata.sequence_filename != file.filename:
        errors.push("Given filename does not match actual file")
    # TODO: Find out what sort of validation is required.
    return errors

def validate_metadata_tsv(metadata_tsv):
    raw = StringIO(metadata_tsv.read().decode())
    header, *metadata = list(csv.reader(raw, delimiter="\t", quotechar='"'))
    return [{h:r for h, r in zip(header, row)} for row in metadata]


def upload_response_helper(errors=None):
    return UploadResponse(errors=([] if None else errors))