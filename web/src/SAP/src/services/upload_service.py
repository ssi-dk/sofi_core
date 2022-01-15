from os.path import isfile
import csv
import sys
from pathlib import Path
from ...generated.models.upload_metadata_fields import UploadMetadataFields
from ...common.config.upload_config import upload_path
from ..repositories.metadata import (
    upsert_analysis_result_for_upload,
    upsert_manual_metadata,
)


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


def upload_isolate(metadata: UploadMetadataFields, files, institution):
    print("upload_isolate:", file=sys.stderr)
    filenames = []
    for file in files:
        filenames.append(file.filename)
        upload_sequence_file(file, institution)
    upload_metadata_file(metadata, filenames, institution)
    upsert_analysis_result_for_upload(metadata, filenames, institution)
    upsert_manual_metadata(metadata)


def upload_sequence_file(file, institution):
    path = upload_path(institution)
    Path(path).mkdir(parents=True, exist_ok=True)
    file_path = f"{path}/{file.filename}"
    if isfile(file_path):
        raise Exception(f"File {file.filename} already exists on server.")
    else:
        file.save(file_path)


def upload_metadata_file(metadata: UploadMetadataFields, filenames, institution):
    print("upload_metadata_file:", file=sys.stderr)
    path = upload_path(institution)
    headers = [
        "SampleID",
        "sofi_sequence_id",
        "sequence_run_date",
        "experiment_name",
        "group",
        "project_no",
        "project_title",
        "provided_species",
        "filenames" "institution",
    ]
    filename_str = "/".join(filenames)
    print("metadata:", file=sys.stderr)
    print(metadata, file=sys.stderr)
    print("filenames:", file=sys.stderr)
    print(filename_str, file=sys.stderr)
    line = "\t".join(
        [
            metadata.sample_id,
            metadata.sofi_sequence_id,
            metadata.sequence_run_date.isoformat(),
            metadata.experiment_name,
            metadata.group,
            metadata.project_no,
            metadata.project_title,
            metadata.provided_species,
            filename_str,
            institution,
        ]
    )
    print("line", file=sys.stderr)
    print(line, file=sys.stderr)
    Path(path).mkdir(parents=True, exist_ok=True)
    print("made dir", file=sys.stderr)
    with open(path + "/sofi_metadata.tsv", "w") as tsvfile:
        print("opened file", file=sys.stderr)
        tsvfile.write("\t".join(headers))
        tsvfile.write("\n")
        tsvfile.write(line)
        tsvfile.write("\n")
