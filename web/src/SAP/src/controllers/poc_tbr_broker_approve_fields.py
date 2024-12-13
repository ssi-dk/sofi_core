import logging
import os
import sys
import threading
from typing import Dict

# Mocking everything for POC. Just trying to actually get an error.
reverse_column_mapping = {
    "field1": "mapped_field1",
    "field2": "mapped_field2",
}

class ApiClient:
    def __init__(self, configuration):
        self.configuration = configuration

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

class IsolateApi:
    def __init__(self, api_client):
        self.api_client = api_client

    def api_isolate_put(self, isolate_update, _return_http_data_only=False):
        return {"status": "success", "data": isolate_update}

def get_tbr_configuration():
    return {"host": "mock_tbr_api_url"}

class BrokerError(Exception):
    pass

def approve_fields(request):
    isolate_id = request["isolate_id"]

    if body := request["body"]:
        fields = body.copy()
        logging.debug(f"Passed fields from approval: {fields}")

        mapped_request = {
            reverse_column_mapping.get(k, k): v
            for k, v in fields.items()
        }
        mapped_request["isolate_id"] = isolate_id
        # if st is present, it needs to be converted to an integer
        st = mapped_request.get("st")
        if st and st.strip():
            mapped_request["st"] = int(st)
        logging.debug(f"Reverse-mapped request: {mapped_request}")

        with ApiClient(get_tbr_configuration()) as api_client:
            api_instance = IsolateApi(api_client)
            try:
                logging.debug(f"Sending to TBR: {mapped_request}")
                api_response = api_instance.api_isolate_put(
                    isolate_update=mapped_request, _return_http_data_only=False
                )
                logging.debug(f"Api responded with: {api_response}")
            except Exception as e:
                logging.info(
                    f"Exception on isolate {isolate_id} when calling IsolateApi->api_isolate_put: {e}\n"
                )
                raise BrokerError