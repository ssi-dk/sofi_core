# Project structure
Reference the `docs/rough_overview.drawio` diagram to get a visual representation.

```
.
├── .certs/
├── app/
├── auth/
├── bifrost/
│   ├── bifrost_db/
│   ├── bifrost_listener/
│   └── bifrost_queue_broker/
├── docs/
├── management_scripts/
├── openapi_specs/
├── sap_tbr_integration/
├── web/
├── Makefile
├── 
└──
```

## App
NodeJS frontend app build using Chakra

## Auth

## Bifrost

Bifrost is the codename for the MongoDB, it holds the SOFI Queu, SOFI Metadata and SOFI analysis result.
The analysis result is rather big document, where only some columns will be synced with TBR and LIMS.

### Bifrost DB

The actual database

### Bifrost Listener
Bifrost Listener listen for new entries to the analysis results, these entries are aggregated to compose the document which is synced to TBR and LIMS.

### Bifrost Queue Broker

## Docs

## Management Scripts

## OpenAPI Specs

## SAP TBR integration

## Web
Python Flask backend built using OpenApi generator