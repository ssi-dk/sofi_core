import requests
import csv
from ...generated.models.base_metadata import BaseMetadata
from ...generated.models.upload_response import UploadResponse
from ..services.upload_service import upload_sequence_file
import json
import sys
from flask import request

def bulk_metadata(user, token_info, metadata_tsv):
    pass

def multi_upload(user, token_info, metadata_tsv, files):
    errors = []
    try:
        validate_metadata_tsv(metadata_tsv, files)
    except:
        pass
    metadata_map = {item['sequence_filename']:item for item in metadata_tsv}

    for file in files:
        metadata = metadata_map.get(file.filename, None)
        if metadata:
            current_errors = validate_metadata(metadata, file)
            if not current_errors:
                upload_isolate(metadata, file)
        else:
            errors.append(f"{file.filename} does not have a metadata entry")

    return errors


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

def validate_metadata_tsv(metadata_tsv, files):
    all_metadata = list(csv.reader(metadata_tsv, delimiter="\t", quotechar='"'))
    if len(all_metadata) != len(files):
        raise Exception("Number of metadata fields does not match number of files uploaded.")

def upload_isolate(metadata, file):
    upload_sequence_file(file, metadata.institution)

def upload_response_helper(errors=None):
    return UploadResponse([] if None else errors)