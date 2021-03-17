import os
from common.queue import ProcessingStatus
from common.database import yield_chunks


class BrokerError(Exception):
    """Thrown when a broker encounters an error."""

    pass
