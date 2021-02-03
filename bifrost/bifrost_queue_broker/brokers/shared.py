from enum import Enum


class ProcessingStatus(Enum):
    WAITING = 1
    PROCESSING = 2
    DONE = 3
    ERROR = 4


class BrokerError(Exception):
    """Thrown when a broker encounters an error."""

    pass
