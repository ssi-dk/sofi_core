import os, sys
import datetime
from dateutil import parser

def recursive_replace(data, replacement_fn, filter_list=None, filtered_parent=False):
    # If no filter_list is provided, then assume all leaf nodes in tree must be replaced
    do_filter = not filter_list or filtered_parent    
    if isinstance(data, (dict, list)):
        for k, v in data.items() if isinstance(data, dict) else enumerate(data):
            # If a key in the filter_list is seen at any node in the tree, leaf values
            # underneath that node must be replaced
            if k in filter_list:
                do_filter = True
            else:
                do_filter = False   
            if  (not (isinstance(v, (dict, list)))) and do_filter:
                try:                      
                    replacement_text = replacement_fn(v)
                    data[k] = replacement_text
                except:
                    pass
            else:                    
                data[k] = recursive_replace(v, replacement_fn, filter_list, do_filter)
    return data

def coerce_date(dayfirst):
    def parse_value(v):
        try:
            if isinstance(v, datetime.datetime):
                return v.isoformat()                    
            return parser.parse(v, dayfirst=dayfirst).isoformat() if v else None
        except:
            return None
    return parse_value

def coerce_dates(val, dayfirst=None):
    filter_list = list(filter(lambda k: k.startswith("date_"), val.keys()))
    print (filter_list)
    return recursive_replace(
        val,
        coerce_date(dayfirst),
        filter_list,
    )

data = {
    'date_sample': datetime.datetime(2024, 5, 19, 2, 56),
    'date_received': '2024-02-19',
    'cpr_nr': '2301232629',
    'name': 'KNUDSEN, ROSA',
    'primary_isolate': False,
    'date_received_kma': None,
    'kma': None,
    'gender': 'K',
    'age': 1,
    'travel': 'Nej',
    'travel_country': None,
    'region': 'MIDTJYLLAND'
}

print(coerce_dates(data))