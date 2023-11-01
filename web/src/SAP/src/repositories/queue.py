import pymongo
import logging
import time
import json
from ...common.database import get_connection, DB_NAME, QUEUE_COL_NAME
from ...common.queue import (
    create_fetch_request,
    create_approve_request,
    ProcessingStatus,
)
import sys


def refresh_metadata(isolate_id, institution):
    conn = get_connection()
    mydb = conn[DB_NAME]
    queue = mydb[QUEUE_COL_NAME]
    request = create_fetch_request(isolate_id, institution)
    return queue.insert_one(request).inserted_id


def approve_data(isolate_id, sequence_id, fields, institution):
    conn = get_connection()
    mydb = conn[DB_NAME]
    queue = mydb[QUEUE_COL_NAME]
    request = create_approve_request(isolate_id, sequence_id, fields, institution)
    return queue.insert_one(request).inserted_id


def await_update_loop(object_id):
    max_tries = 20
    conn = get_connection()
    mydb = conn[DB_NAME]
    queue = mydb[QUEUE_COL_NAME]
    result = {"status": ProcessingStatus.WAITING}
    waiting_statuses = [ProcessingStatus.WAITING, ProcessingStatus.PROCESSING]
    while max_tries != 0 or result and (result["status"] in waiting_statuses):
        result = queue.find_one({"_id": object_id})
        time.sleep(0.4)
        max_tries -= 1

    return result["status"]
