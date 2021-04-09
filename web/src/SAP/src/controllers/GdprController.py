from ...generated.models import PersonalData
from ..repositories.gdpr import personal_data_from_identifier, forget_user_data
from typing import Dict, List
from flask.json import dumps
from flask import current_app as app
from io import StringIO
import sys
from flask import current_app as app
from web.src.SAP.src.security.permission_check import assert_user_has


def audit_gdpr_forget(token_info: Dict[str, str], isolates: List[str]):
    if len(isolates) > 0:
        email = token_info["email"]
        app.logger.info(
            f"[GDPR Audit]: User -{email}- forgot a user, matching isolate ids: {isolates}"
        )


def forget_pii(user, token_info, identifier_type, identifier):
    assert_user_has("gdpr.manage", token_info)
    res, ids = forget_user_data(identifier_type, identifier)
    audit_gdpr_forget(token_info, ids)
    return res


def json_line_generator(json_input, seperator=""):
    if isinstance(json_input, dict):
        first_iteration = True
        for k, v in json_input.items():
            if isinstance(v, list) or isinstance(v, dict):
                yield from json_line_generator(v)
            else:
                if first_iteration:
                    first_iteration = False
                else:
                    seperator = ""
                if v:
                    yield (seperator + k), str(v)

    elif isinstance(json_input, list):
        for item in json_input:
            yield from json_line_generator(item, "\n\n----------\n")


def personal_data_to_text(data):
    string = StringIO()
    for key, value in json_line_generator(data):
        print(key, file=sys.stderr)
        string.write(f"{key}: {value}\n")

    return string.getvalue()


def extract_data_from_pi(user, token_info, identifier_type=None, identifier=None):
    assert_user_has("gdpr.manage", token_info)
    document = personal_data_from_identifier(identifier_type, identifier)
    res = personal_data_to_text(document)
    mail = token_info["email"]
    # TODO: should we log the identifier here? would be PII itself
    app.logger.info(
        f"[GDPR Audit]: User -{mail}- extracted personally identifiable information via {identifier_type} {identifier}"
    )
    return PersonalData(data=res)
