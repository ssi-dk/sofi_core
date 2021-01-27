import requests
from flask import request

def isolate_upload(user, token_info, metadata, file):
  # TODO: configure endpoint as an env var
  # requests.post("", data={"contents": file}, headers={'Content-Type': 'application/octet-stream'})
  file.save("./test.fastq.gz")
  