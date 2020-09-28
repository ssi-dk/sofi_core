$MyInvocation.MyCommand.Path | Split-Path | Push-Location

openapi-generator generate -i openapi-specs/SAP/SAP.yaml -o web/SAP -g python-flask -t openapi-specs/SAP/templates -c openapi-specs/SAP/SAP-config.yaml
Remove-Item -Path web/SAP/generated -Recurse
Move-Item -Path web/SAP/web/SAP/generated -Destination web/SAP/generated