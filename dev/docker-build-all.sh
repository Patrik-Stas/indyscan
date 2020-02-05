cd "$(dirname $0)" || exit
echo "Docker buid for indyscan-api"
(cd ../indyscan-api && yes | ./dockerbuild.sh)
echo "Docker buid for indyscan-daemon"
(cd ../indyscan-daemon && yes | ./dockerbuild.sh)
echo "Docker buid for indyscan-webapp"
(cd ../indyscan-webapp && yes | ./dockerbuild.sh)


