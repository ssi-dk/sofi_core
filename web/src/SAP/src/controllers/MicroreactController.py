import sys
import os
from flask import abort
from flask.json import jsonify
from .....microreact_integration.functions import new_project as new_microreact_project


def send_to_microreact(user, token_info, body):
    res = new_microreact_project(body)
    return res
