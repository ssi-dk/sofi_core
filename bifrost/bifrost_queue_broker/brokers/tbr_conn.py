import os
import api_clients.tbr_client
import functools
import requests.packages.urllib3

requests.packages.urllib3.disable_warnings()

tbr_api_url = os.environ.get("TBR_API_URL")
DISABLE_CERT = os.getenv("DISABLE_CERT", "False").lower() in ["true", "1"]


@functools.lru_cache(maxsize=1)
def get_tbr_configuration():
    certs_path = os.getcwd() + "/.certs/"
    client_key = certs_path + "client.key"
    client_cert = certs_path + "client.pem"
    root_ca = certs_path + "SOFI_ROOT.pem"
    tbr_configuration = api_clients.tbr_client.Configuration(host=tbr_api_url)
    if not DISABLE_CERT:
        tbr_configuration.ssl_ca_cert = root_ca
        tbr_configuration.cert_file = client_cert
        tbr_configuration.key_file = client_key

    return tbr_configuration
