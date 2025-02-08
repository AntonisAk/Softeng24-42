#!/bin/bash
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out cert.csr -subj "/CN=localhost"
openssl x509 -req -in cert.csr -signkey key.pem -out cert.pem
echo "Self-signed certificate generated (key.pem and cert.pem)"