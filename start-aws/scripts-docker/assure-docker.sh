#!/usr/bin/env bash
set -ex

INSTALL_DOCKER="docker-ce=5:19.03.5~3-0~ubuntu-xenial"

sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
sudo apt-get update # necessary to initially update, calling single update after adding docker repo is not enough

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
echo "Adding docker apt repository"
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable" # was having some issues with this. Did not appear to really add the repo

echo "Apt sources.list after adding docker repository:"
cat /etc/apt/sources.list

sudo apt-get update

echo "Apt sources.list after apt update"
cat /etc/apt/sources.list

#sleep 20
#sudo apt-get update
#sleep 5

apt-cache policy docker-ce
#apt-cache policy docker-ce | grep 5:19.03
sudo apt-get install -y "$INSTALL_DOCKER"
sudo usermod -aG docker ${USER}

sudo curl -L https://github.com/docker/compose/releases/download/1.24.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
