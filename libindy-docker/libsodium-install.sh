#!/bin/bash

sh -x

cd /tmp
curl https://download.libsodium.org/libsodium/releases/old/libsodium-1.0.14.tar.gz | tar -xz
cd /tmp/libsodium-1.0.14
./configure --disable-shared
make
make install
rm -rf /tmp/libsodium-1.0.14

