# api-clients.lims-client
LIMS web service

The `api_clients.lims_client` package is automatically generated by the [OpenAPI Generator](https://openapi-generator.tech) project:

- API version: 1.0
- Package version: 1.0.0
- Build package: org.openapitools.codegen.languages.PythonClientCodegen

## Requirements.

Python >= 3.6

## Installation & Usage

This python library package is generated without supporting files like setup.py or requirements files

To be able to use it, you will need these dependencies in your own package that uses this library:

* urllib3 >= 1.25.3
* python-dateutil

## Getting Started

In your own code, to use this library to connect and interact with api-clients.lims-client,
you can run the following:

```python

import time
import api_clients.lims_client
from pprint import pprint
from api_clients.lims_client.api import connections_api
from api_clients.lims_client.model.connection_create_request import ConnectionCreateRequest
from api_clients.lims_client.model.connection_create_response import ConnectionCreateResponse
from api_clients.lims_client.model.message_response import MessageResponse
# Defining the host is optional and defaults to http://localhost:4010/lims
# See configuration.py for a list of all supported configuration parameters.
configuration = api_clients.lims_client.Configuration(
    host = "http://localhost:4010/lims"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: cookieAuth
configuration.api_key['cookieAuth'] = 'YOUR_API_KEY'

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['cookieAuth'] = 'Bearer'


# Enter a context with an instance of the API client
with api_clients.lims_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = connections_api.ConnectionsApi(api_client)
    connection_id = "fvstlims|admin719456522586" # str | 

    try:
        # Delete connection
        api_response = api_instance.delete_connections(connection_id)
        pprint(api_response)
    except api_clients.lims_client.ApiException as e:
        print("Exception when calling ConnectionsApi->delete_connections: %s\n" % e)
```

## Documentation for API Endpoints

All URIs are relative to *http://localhost:4010/lims*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*ConnectionsApi* | [**delete_connections**](api_clients/lims_client/docs/ConnectionsApi.md#delete_connections) | **DELETE** /connections/{connectionId} | Delete connection
*ConnectionsApi* | [**get_connections**](api_clients/lims_client/docs/ConnectionsApi.md#get_connections) | **GET** /connections/{connectionId} | Check connection
*ConnectionsApi* | [**post_connections**](api_clients/lims_client/docs/ConnectionsApi.md#post_connections) | **POST** /connections | 
*ConnectionsApi* | [**put_connections**](api_clients/lims_client/docs/ConnectionsApi.md#put_connections) | **PUT** /connections/{connectionId} | 
*IsolateApi* | [**post_actions_get_isolate**](api_clients/lims_client/docs/IsolateApi.md#post_actions_get_isolate) | **POST** /actions/GetIsolate | Get isolate
*IsolateApi* | [**post_actions_update_isolate**](api_clients/lims_client/docs/IsolateApi.md#post_actions_update_isolate) | **POST** /actions/UpdateIsolate | Update isolate


## Documentation For Models

 - [ConnectionCreateRequest](api_clients/lims_client/docs/ConnectionCreateRequest.md)
 - [ConnectionCreateResponse](api_clients/lims_client/docs/ConnectionCreateResponse.md)
 - [ConnectionCreateResponseConnections](api_clients/lims_client/docs/ConnectionCreateResponseConnections.md)
 - [DataEntry](api_clients/lims_client/docs/DataEntry.md)
 - [DataFieldName](api_clients/lims_client/docs/DataFieldName.md)
 - [FieldStatus](api_clients/lims_client/docs/FieldStatus.md)
 - [IsolateGetRequest](api_clients/lims_client/docs/IsolateGetRequest.md)
 - [IsolateGetResponse](api_clients/lims_client/docs/IsolateGetResponse.md)
 - [IsolateGetResponseOutput](api_clients/lims_client/docs/IsolateGetResponseOutput.md)
 - [IsolateGetResponseOutputSapresponse](api_clients/lims_client/docs/IsolateGetResponseOutputSapresponse.md)
 - [IsolateUpdateRequest](api_clients/lims_client/docs/IsolateUpdateRequest.md)
 - [IsolateUpdateResponse](api_clients/lims_client/docs/IsolateUpdateResponse.md)
 - [IsolateUpdateResponseOutput](api_clients/lims_client/docs/IsolateUpdateResponseOutput.md)
 - [IsolateUpdateResponseOutputSapresponse](api_clients/lims_client/docs/IsolateUpdateResponseOutputSapresponse.md)
 - [MessageResponse](api_clients/lims_client/docs/MessageResponse.md)
 - [MetaDataEntry](api_clients/lims_client/docs/MetaDataEntry.md)
 - [MetadataFieldName](api_clients/lims_client/docs/MetadataFieldName.md)


## Documentation For Authorization


## cookieAuth

- **Type**: API key
- **API key parameter name**: connectionid
- **Location**: 


## Author




## Notes for Large OpenAPI documents
If the OpenAPI document is large, imports in api_clients.lims_client.apis and api_clients.lims_client.models may fail with a
RecursionError indicating the maximum recursion limit has been exceeded. In that case, there are a couple of solutions:

Solution 1:
Use specific imports for apis and models like:
- `from api_clients.lims_client.api.default_api import DefaultApi`
- `from api_clients.lims_client.model.pet import Pet`

Solution 1:
Before importing the package, adjust the maximum recursion limit as shown below:
```
import sys
sys.setrecursionlimit(1500)
import api_clients.lims_client
from api_clients.lims_client.apis import *
from api_clients.lims_client.models import *
```

