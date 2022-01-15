import requests
import csv
from io import StringIO

from web.src.SAP.generated.models.upload_metadata_fields import UploadMetadataFields
from ...generated.models.base_metadata import BaseMetadata
from ...generated.models.upload_response import UploadResponse
from ..services.upload_service import (
    upload_sequence_file,
    upload_isolate,
    check_bulk_isolate_exists,
    upload_metadata_list,
)
import json
import sys
from flask import request
from web.src.SAP.src.security.permission_check import (
    assert_user_has,
    assert_authorized_to_edit,
    authorized_to_edit,
)


def bulk_metadata(user, token_info, path, metadata_tsv):
    assert_user_has("approve", token_info)
    metadata_list = validate_metadata_tsv(metadata_tsv)
    for m in metadata_list:
        assert_authorized_to_edit(token_info, m)
    errors = []
    sequence_names = []
    for m in metadata_list:
        sequence_names.extend(m["sequence_filename"].split())

    trimmed_path = path.read().decode("utf-8").strip('"').strip()
    existing_sequences, missing_sequences = check_bulk_isolate_exists(
        trimmed_path, sequence_names
    )
    if existing_sequences:
        try:
            metadata = [UploadMetadataFields.from_dict(m) for m in metadata_list]
            upload_metadata_list(metadata)
        except Exception as e:
            errors.append(f"Error: {str(e)}")

    errors.extend(
        [f"Missing {filename} in directory" for filename in missing_sequences]
    )
    return upload_response_helper(errors)


def multi_upload(user, token_info, metadata_tsv, _files):
    assert_user_has("approve", token_info)
    # Files aren't properly routed from connexion, use these files instead:
    files = request.files.getlist("files")
    errors = []
    metadata = []
    try:
        metadata_list = validate_metadata_tsv(metadata_tsv)
        metadata_map = {item["sequence_filename"]: item for item in metadata_list}
        filenames = [x.filename for x in files]

        for key, metadata in metadata_map.items():
            split_filenames = key.split()
            files_for_metadata = []
            if not all(f in filenames for f in split_filenames):
                errors.append(f"Could not find samples {key} in metadata TSV.")
                continue
            else:
                files_for_metadata = [f for f in files if f.filename in split_filenames]

            try:
                if metadata:
                    base_metadata = UploadMetadataFields.from_dict(metadata)
                    current_errors = validate_metadata(
                        base_metadata, files_for_metadata
                    )
                    if authorized_to_edit(token_info, base_metadata):
                        if not current_errors:
                            upload_isolate(
                                base_metadata,
                                files_for_metadata,
                                token_info["institution"],
                            )
                        else:
                            errors.extend(current_errors)
                    else:
                        errors.append(
                            f"You are not authorized to edit isolate -{base_metadata.isolate_id}-"
                        )

            except Exception as e:
                import traceback

                print(traceback.format_exc(), file=sys.stderr)
                errors.append(f"Error with files: {key}, {str(e)}")
                continue
    except Exception as e:
        print(e, file=sys.stderr)

    return upload_response_helper(errors)


def single_upload(user, token_info, metadata, _files):
    assert_user_has("approve", token_info)
    base_metadata: UploadMetadataFields = UploadMetadataFields.from_dict(
        json.loads(metadata.read())
    )
    print("single_upload:", file=sys.stderr)
    print(base_metadata, file=sys.stderr)
    assert_authorized_to_edit(token_info, base_metadata.to_dict())
    try:
        files = request.files.getlist("files")
        upload_isolate(base_metadata, files, token_info["institution"])
        return upload_response_helper()
    except Exception as e:
        return upload_response_helper([e.args[0]])


def validate_metadata(metadata: BaseMetadata, file):
    errors = []
    if metadata.isolate_id == "":
        errors.push("Missing isolate id")
    # TODO: Find out what sort of validation is required.
    return errors


def validate_metadata_tsv(metadata_tsv):
    raw = StringIO(metadata_tsv.read().decode())
    header, *metadata = list(csv.reader(raw, delimiter="\t", quotechar='"'))
    return [{h: r for h, r in zip(header, row)} for row in metadata]


def upload_response_helper(errors=None):
    if errors is None or errors == []:
        return UploadResponse(errors=[])
    else:
        # Ununsed error code because of redux-query error fetching is harder than doing this.
        # Time constraint made this the solution.
        return UploadResponse(errors=errors), 299
