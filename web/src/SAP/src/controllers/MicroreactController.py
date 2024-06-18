import sys
import os
from flask import abort
from flask.json import jsonify
from .....microreact_integration.functions import new_project as new_microreact_project
from ..repositories.workspaces import get_workspace as get_workspace_db


def send_to_microreact(user, token_info, body):
    # body.workspace_id = "6669a3df0756fc3a806f4f88"
    # body.mr_access_token = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..84N2NkMJw-VKkPFi.qNZautvnN-5oWKtiFJi2IAW7tVha3bkLr1xDEDx8G4TZ0K9JsjlITdq6FOksam_4OGa1xodO0JIiyTpEN0WnZERQbxbV-rUszMM_O1RXqx7fmRPeit8ZmN_27kZQNJc7jDptnDUv-fsrJqGA4vRu-g._YQISfnBuplmJR0JvLc4-A"
    
    ws_id = "6669a3df0756fc3a806f4f88"

    ws = get_workspace_db(user, ws_id)
    
    mr_project = {
        project_name: ws.name,
        tree_calcs: [],
        metadata_keys: [],
        metadata_values: [],
        mr_access_token: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..84N2NkMJw-VKkPFi.qNZautvnN-5oWKtiFJi2IAW7tVha3bkLr1xDEDx8G4TZ0K9JsjlITdq6FOksam_4OGa1xodO0JIiyTpEN0WnZERQbxbV-rUszMM_O1RXqx7fmRPeit8ZmN_27kZQNJc7jDptnDUv-fsrJqGA4vRu-g._YQISfnBuplmJR0JvLc4-A",
        mr_base_url: "https://dev2.sofi-platform.dk/"
    }
        
    res = new_microreact_project(mr_project)
    return res
