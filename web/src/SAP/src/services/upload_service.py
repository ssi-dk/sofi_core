from os.path import isfile
import sys
from pathlib import Path
from ..config.upload_config import upload_path

def upload_sequence_file(file, institution):
    path = upload_path(institution)
    Path(path).mkdir(parents=True, exist_ok=True)
    file_path = f"{path}/{file.filename}"
    if isfile(file_path):
        raise Exception(f"File {file.filename} already exists on server.")
    else:
        file.save(file_path)