from ...generated.models import PersonalData
from ..repositories.gdpr import personal_data_from_identifier
from flask.json import dumps
from io import StringIO
import sys
from web.src.SAP.src.security.permission_check import assert_user_has

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
    # TODO: Is this the right claim?
    assert_user_has("export", token_info)
    document = personal_data_from_identifier(identifier_type, identifier)
    res = personal_data_to_text(document)
    #print(identifier, identifier_type, document, file=sys.stderr)
    return PersonalData(data=res)
