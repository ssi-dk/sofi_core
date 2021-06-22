param (
    [Parameter(HelpMessage = "Hostname to give the csr (CN value)")] 
    [string] $hostname = "sofi_tbr_integration",

    [Parameter(HelpMessage = "Password for the client PFX", Mandatory = $true)] 
    [string] $password
)

$ca_dir = "$PSScriptRoot/root"
$client_dir = "$PSScriptRoot/client"

New-Item -ItemType Directory -Force -Path $ca_dir
New-Item -ItemType Directory -Force -Path $client_dir

$ca_key = "$ca_dir/SOFI_ROOT.key"
$ca_pem = "$ca_dir/SOFI_ROOT.pem"

$client_x509_key = "$client_dir/client_x509.key"
$client_csr = "$client_dir/client.csr"
$client_crt = "$client_dir/client.crt"
$client_ext = "$client_dir/client.ext"
$client_pfx = "$client_dir/client.pfx"
$client_pem = "$client_dir/client.pem"
$client_pkcs12_key = "$client_dir/client.key"
New-Item -Force -Path $client_ext
Set-Content $client_ext "authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment"


# Generate a key for the "client" to use
openssl genrsa -out $client_x509_key 2048

# Generate a Certificate Signing Request (csr)
openssl req -new -key $client_x509_key -out $client_csr -subj "/C=DK/ST=Copenhagen/L=Copenhagen/O=Delegate/CN=$hostname"

# Using the CA, create client cert based on the CSR
openssl x509 -passin pass:$password -req -in $client_csr -CA $ca_pem -CAkey $ca_key -CAcreateserial -out $client_crt -days 1024 -sha256 -extfile $client_ext

# Generate PFX used for IIS
openssl pkcs12 -passout pass:$password -export -out $client_pfx -inkey $client_x509_key -in $client_crt

# Generate pem for client
openssl pkcs12 -passin pass:$password -in $client_pfx -out $client_pem -clcerts -nodes

# Generate .key file for passwordless use of key
openssl pkcs12 -passin pass:$password -in client.pfx -nocerts -nodes -out $client_pkcs12_key

$cert_b64 = ((Get-Content $client_crt).replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----','').replace('`\r`\n', '').replace('`\n', ''))
$cert_b64 | Out-File -FilePath "$client_dir/client_pub_cert_base64.txt" -NoNewLine
Write-Host "Certificate to use for mTLS"
Write-Host $cert_b64