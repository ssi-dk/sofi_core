$ca_dir = "$PSScriptRoot/root"
$client_dir = "$PSScriptRoot/client"

New-Item -ItemType Directory -Force -Path $ca_dir
New-Item -ItemType Directory -Force -Path $client_dir

$ca_key = "$ca_dir/SOFI_ROOT.key"
$ca_pem = "$ca_dir/SOFI_ROOT.pem"

$client_key = "$client_dir/client.key"
$client_csr = "$client_dir/client.csr"
$client_crt = "$client_dir/client.crt"
$client_ext = "$client_dir/client.ext"
$client_pfx = "$client_dir/client.pfx"

New-Item -Force -Path $client_ext
Set-Content $client_ext "authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment"


# Generate a key for the "client" to use
openssl genrsa -out $client_key 2048

# Generate a Certificate Signing Request (csr)
openssl req -new -key $client_key -out $client_csr -subj "/C=DK/ST=Copenhagen/L=Copenhagen/O=Delegate/CN=sofi_tbr_integration_dev"

# Using the CA, create client cert based on the CSR
openssl x509 -passin pass:test -req -in $client_csr -CA $ca_pem -CAkey $ca_key -CAcreateserial -out $client_crt -days 1024 -sha256 -extfile $client_ext

# Generate PFX used for IIS
openssl pkcs12 -passout pass:test -export -out $client_pfx -inkey $client_key -in $client_crt

Write-Host "Certificate to use for mTLS"
Write-Host ((Get-Content $client_crt).replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----','').replace('`\r`\n', '').replace('`\n', ''))
