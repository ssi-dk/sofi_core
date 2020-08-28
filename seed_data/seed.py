import os
import pandas as pd
from bson import SON
from pymongo import MongoClient
from werkzeug.security import generate_password_hash


def script_runs_within_container():
    with open('/proc/1/cgroup', 'r') as cgroup_file:
        return 'docker' in cgroup_file.read()

host = 'mongo' if script_runs_within_container() else 'localhost'
client = MongoClient(host, 27017)

database = client['dev']
collection = database['calls']

def csv_to_json(filename):
    data = pd.read_csv(filename)
    data_dict = data.to_dict('records')
    print(len(data_dict))
    return data_dict

dirname = os.path.dirname(__file__)
filename = os.path.join(dirname, '311-calls.csv')
collection.insert_many(csv_to_json(filename))

password = generate_password_hash('test', 'pbkdf2:sha512')
database['user'].insert_one({'_cls' : 'User', 'username': 'test', 'email': 'test@test.test', 'password': password, 'admin': True})

