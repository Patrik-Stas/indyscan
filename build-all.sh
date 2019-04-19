#!/bin/bash

./build-ubuntu-libindy.sh
./build-tool.sh "indyscan-daemon" "./daemon/Dockerfile"
./build-tool.sh "indyscan-webapp" "./app/Dockerfile"