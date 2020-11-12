$MyInvocation.MyCommand.Path | Split-Path | Push-Location

openapi-generator generate -i openapi-specs/SAP/SAP.yaml -o web/src/SAP -g python-flask -t openapi-specs/SAP/templates -c openapi-specs/SAP/SAP-config.yaml
Remove-Item -Path web/src/SAP/generated -Recurse
Move-Item -Path web/src/SAP/web/SAP/generated -Destination web/src/SAP/generated