import os
from common.queue import ProcessingStatus

class BrokerError(Exception):
    """Thrown when a broker encounters an error."""
    pass

def yield_chunks(cursor, chunk_size):
    """
    Generator to yield chunks from cursor
    :param cursor:
    :param chunk_size:
    """
    chunk = []
    for i, row in enumerate(cursor):
        if i % chunk_size == 0 and i > 0:
            yield chunk
            del chunk[:]
        chunk.append(row)
    yield chunk

# TODO: perhaps combine this with column configs to extract "gdpr: true" values instead of having this one-off list..
PII_FIELDS = ["CHR-nr.", "Aut. Nummer", "CVR nr.", "cpr_nr", "name", "gender", "age"]