These two scripts are used to create the mututal certificates for TBR.

The Root CA will most likely not change, so that script should not be executed for almost all cases.

The client creation script assumes Root CA in the Root folder. A key (Root CA private key) as well as a pem. This could probably be reduced to only the pem.

The IIS setup requires the base64 encoded certificate of the client, in order to refresh the SOFI TBR broker certifiate. The last command in the 
make_client file strips this out, alternatively the command `sed '/CERTIFICATE-----/d' client/client.crt | tr -d '\n'` in shell to accomplish the same.


To convert these certs into client.key and client.pem for use with curl/python client lib, use 
`openssl pkcs12 -in client.pfx -out client.pem -clcerts -nodes`
and
`openssl pkcs12 -in client.pfx -nocerts -nodes -out client.key`

and type in the password for each.

List of files needed for Finn to apply the full thing:
Client:
- client_pub_cert_base64.txt
- clienf.pfx
- (password in a file)
Root:
- SOFI_ROOT.crt
- SOFI_ROOT.pem
- SOFI_ROOT.pfx

Make sure that the root certificate is added to server. For CentOS the .crt should be placed in 
`/etc/pki/ca-trust/source/anchors/` and updated with `update-ca-trust extract`
Dynamic CA config might need to be enabled with `update-ca-trust force-enable`