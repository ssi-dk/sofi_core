from os.path import isfile
import sys
from pathlib import Path
from ...generated.models.base_metadata import BaseMetadata
from ..config.upload_config import upload_path
from ..repositories.metadata import insert_manual_metadata

def upload_metadata_list(metadata_list):
    pass

def check_bulk_isolate_exists(sequence_names):
    pass

def upload_isolate(metadata: BaseMetadata, file):
    upload_sequence_file(file, metadata.institution)
    insert_manual_metadata(metadata)

def upload_sequence_file(file, institution):
    path = upload_path(institution)
    Path(path).mkdir(parents=True, exist_ok=True)
    file_path = f"{path}/{file.filename}"
    if isfile(file_path):
        raise Exception(f"File {file.filename} already exists on server.")
    else:
        file.save(file_path)