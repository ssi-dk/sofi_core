import pymongo

def get_connection():
    global CONNECTION
    if CONNECTION is not None:
        return CONNECTION
    else:
        if os.getenv("BIFROST_DB_KEY", None) is not None:
            CONNECTION = pymongo.MongoClient(os.getenv("BIFROST_DB_KEY"))  # Note none here apparently will use defaults which means localhost:27017
            return CONNECTION
        else:
            raise ValueError("BIFROST_DB_KEY not set")