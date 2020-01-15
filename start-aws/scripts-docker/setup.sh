#!/usr/bin/env bash
set -ex

INSTALL_DOCKER="docker-ce=5:18.09.6~3-0~ubuntu-xenial"

sudo apt-get update # necessary to initially update, calling single update after adding docker repo is not enough

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable"
sudo apt-get update

apt-cache policy docker-ce
sudo apt-get install -y "$INSTALL_DOCKER"
sudo usermod -aG docker ${USER}

sudo curl -L https://github.com/docker/compose/releases/download/1.24.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
