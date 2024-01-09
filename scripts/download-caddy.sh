#!/bin/bash

# check if file exists
if [ -f _bin/caddy ]; then
    echo "caddy already downloaded"
    exit 0
fi

# Download the dataset
mkdir -p _bin
wget https://caddyserver.com/api/download?os=linux\&arch=amd64 -O _bin/caddy
wget https://raw.githubusercontent.com/caddyserver/caddy/master/LICENSE -O _bin/LICENSE-caddy.txt
chmod +x _bin/caddy