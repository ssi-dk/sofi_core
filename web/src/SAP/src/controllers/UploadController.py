import requests
from flask import request

 

def bulk_metadata(user, token_info, metadata_tsv):
  pass

def multi_upload(user, token_info, metadata_tsv, files):
  pass

def single_upload(user, token_info, metadata, file):
  # TODO: configure endpoint as an env var
  # requests.post("", data={"contents": file}, headers={'Content-Type': 'application/octet-stream'})
  file.save("/tmp/test.fastq.gz")
