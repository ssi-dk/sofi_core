import sys
import pandas as pd
import numpy as np
from bson import SON
from pymongo import MongoClient


def create_dataframe():
    db = MongoClient("mongo", 27017)["dev"]
    cursor = db["calls"].find({}, {"_id": False}, limit=200)

    df = pd.DataFrame(list(cursor))

    df["created"] = pd.to_datetime(df["created"])
    df["created"] = df["created"].dt.date
    df.drop(columns=["incident_zip"], inplace=True)
    num_complaints = df["complaint_type"].value_counts()
    to_remove = num_complaints[num_complaints <= 30].index
    df.replace(to_remove, np.nan, inplace=True)

    return df
