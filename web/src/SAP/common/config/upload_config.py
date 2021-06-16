import os
import commentjson
import functools
from datetime import datetime


@functools.lru_cache(maxsize=1)
def base_path():
    return os.environ.get("SOFI_UPLOAD_DIR")


def upload_path(institution):
    year = datetime.now().year
    return f"{base_path()}/{institution}/{year}/"
