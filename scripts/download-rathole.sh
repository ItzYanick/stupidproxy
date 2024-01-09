#!/bin/bash

# check if file exists
if [ -f _bin/rathole ]; then
    echo "rathole already downloaded"
    exit 0
fi

# Download the dataset
mkdir -p _bin
wget https://github.com/rapiz1/rathole/releases/download/v0.5.0/rathole-x86_64-unknown-linux-gnu.zip -O _bin/rathole.zip
wget https://raw.githubusercontent.com/rapiz1/rathole/main/LICENSE -O _bin/LICENSE-rathole.txt
unzip _bin/rathole.zip -d _bin
rm _bin/rathole.zip