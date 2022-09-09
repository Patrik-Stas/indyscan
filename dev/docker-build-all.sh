cd "$(dirname $0)" || exit
echo "Docker publish for indyscan-api"
(cd ../indyscan-api && ./dockerbuild.sh)
echo "Docker build for indyscan-daemon"
(cd ../indyscan-daemon && ./dockerbuild.sh)
echo "Docker build for indyscan-daemon-ui"
(cd ../indyscan-daemon-ui && ./dockerbuild.sh)
echo "Docker build for indyscan-webapp"
(cd ../indyscan-webapp && ./dockerbuild.sh)
echo "Docker build for indyscan-webapp"
(cd ../start/indypool && ./dockerbuild.sh)


