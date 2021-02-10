from os.path import isfile
import sys
from pathlib import Path
from ...generated.models.base_metadata import BaseMetadata
from ..config.upload_config import upload_path
from ..repositories.metadata import upsert_manual_metadata


def upload_metadata_list(metadata_list):
    for m in metadata_list:
        upsert_manual_metadata(m)


def check_bulk_isolate_exists(path, sequence_names):
    """
    Returns a set of the files that are in common between directory and given list
    """
    p = Path(path).glob("*.gz")
    filenames = set([x.name for x in p if x.is_file()])
    print(sequence_names, file=sys.stderr)
    given_sequence_names = set([*sequence_names])
    return filenames.intersection(given_sequence_names), (
        given_sequence_names.difference(filenames)
    )


def upload_isolate(metadata: BaseMetadata, file):
    upload_sequence_file(file, metadata.institution)
    upsert_manual_metadata(metadata)


def upload_sequence_file(file, institution):
    path = upload_path(institution)
    Path(path).mkdir(parents=True, exist_ok=True)
    file_path = f"{path}/{file.filename}"
    if isfile(file_path):
        raise Exception(f"File {file.filename} already exists on server.")
    else:
        file.save(file_path)