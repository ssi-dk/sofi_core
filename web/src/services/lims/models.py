from dataclasses import dataclass
from typing import Dict


@dataclass
class Isolate:
    id: str
    approved: bool
    meta_data: Dict[str, str]
    data: Dict[str, str]


@dataclass
class Connection:
    user: str
    password: str
    database_id: str
