$ca_dir = "$PSScriptRoot/root"
New-Item -ItemType Directory -Force -Path $ca_dir

$ca_key = "$ca_dir/SOFI_ROOT.key"
$ca_pem = "$ca_dir/SOFI_ROOT.pem"
$ca_crt = "$ca_dir/SOFI_ROOT.crt"
$ca_pfx = "$ca_dir/SOFI_ROOT.pfx"

# Generate a key
openssl genrsa -aes256 -passout pass:test -out $ca_key 2048

# Generate root certificate
openssl req -x509 -passin pass:test -new -nodes -key $ca_key -sha256 -days 10240 -out $ca_pem -subj "/C=DK/ST=Copenhagen/L=Copenhagen/O=Delegate/CN=Delegate Sofi"

# Create a .crt file so it can be installed on yucky windows (can *probably* just out in this format from the step above, but i don't know much about openssl)
openssl x509 -outform der -in $ca_pem -out $ca_crt

# Generate PFX used for IIS
openssl pkcs12 -passin pass:test -passout pass:test -inkey $ca_key -in $ca_pem -export -out $ca_pfx
