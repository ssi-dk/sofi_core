from abc import ABC, abstractmethod
from typing import Dict

from web.src.services.lims import Isolate, Connection


class Lims(ABC):
    """The ABC of the LIMS service"""

    @abstractmethod
    def get_isolate(self, isolate_id: str) -> Isolate:
        """Get isolate from id"""

    @abstractmethod
    def update_isolate(self, isolate_id: str, isolate_update: Dict[str, str]) -> bool:
        """Update data entries in isolate with id"""

    @abstractmethod
    def add_connection(self, connection: Connection) -> str:
        """Add DB connection. Returns connection id"""

    @abstractmethod
    def delete_connection(self, connection_id: str) -> bool:
        """Delete DB connection. Returns success"""

    @abstractmethod
    def refresh_connection(self, connection_id: str) -> bool:
        """Refresh DB connection. Returns success"""

    @abstractmethod
    def check_connection(self, connection_id: str) -> bool:
        """Check DB connection. Returns success"""
