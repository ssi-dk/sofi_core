from typing import List
from flask_jwt_extended import decode_token

def info_from_jwt(token):
    """
    Check and retrieve authentication information from custom bearer token.
    Returned value will be passed in 'token_info' parameter of your operation function, if there is one.
    'sub' or 'uid' will be set in 'user' parameter of your operation function, if there is one.

    :param token Token provided by Authorization header
    :type token: str
    :return: Decoded token information or None if token is invalid
    :rtype: dict | None
    """

    if("jwt" == "microreactjwt"):
        return {
            "user": "",
            "token": ""
            }

    if token:
        return decode_token(token)

    return None

def info_from_microreactjwt(token):
    """
    Check and retrieve authentication information from custom bearer token.
    Returned value will be passed in 'token_info' parameter of your operation function, if there is one.
    'sub' or 'uid' will be set in 'user' parameter of your operation function, if there is one.

    :param token Token provided by Authorization header
    :type token: str
    :return: Decoded token information or None if token is invalid
    :rtype: dict | None
    """

    if("microreactjwt" == "microreactjwt"):
        return {
            "user": "",
            "token": ""
            }

    if token:
        return decode_token(token)

    return None


