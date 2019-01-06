#!/bin/bash

sh -x

cd /tmp
curl https://download.libsodium.org/libsodium/releases/libsodium-1.0.16.tar.gz | tar -xz
cd /tmp/libsodium-1.0.16
./configure --disable-shared
make
make install
rm -rf /tmp/libsodium-1.0.16

