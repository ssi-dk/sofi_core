These two scripts are used to create the mututal certificates for TBR.

The Root CA will most likely not change, so that script should not be executed for almost all cases.

The client creation script assumes Root CA in the Root folder. A key (Root CA private key) as well as a pem. This could probably be reduced to only the pem.

The IIS setup requires the base64 encoded certificate of the client, in order to refresh the SOFI TBR broker certifiate. The last command in the 
make_client file strips this out, alternatively the command `sed '/CERTIFICATE-----/d' client/client.crt | tr -d '\n'` in shell to accomplish the same.