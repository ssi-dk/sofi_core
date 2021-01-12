# flake8: noqa

# import all models into this package
# if you have many models here with many references from one model to another this may
# raise a RecursionError
# to avoid this, import only the models that you directly need like:
# from from api_clients.tbr_client.model.pet import Pet
# or import this package, but before doing it, use:
# import sys
# sys.setrecursionlimit(n)

from api_clients.tbr_client.model.approval import Approval
from api_clients.tbr_client.model.field_approval import FieldApproval
from api_clients.tbr_client.model.isolate import Isolate
from api_clients.tbr_client.model.problem_details import ProblemDetails
