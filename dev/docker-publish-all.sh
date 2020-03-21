cd "$(dirname $0)" || exit
echo "Docker publish for indyscan-api"
(cd ../indyscan-api && yes | ./dockerpublish.sh)
echo "Docker publish for indyscan-daemon"
(cd ../indyscan-daemon && yes | ./dockerpublish.sh)
echo "Docker publish for indyscan-daemon-ui"
(cd ../indyscan-daemon-ui && yes | ./dockerpublish.sh)
echo "Docker publish for indyscan-webapp"
(cd ../indyscan-webapp && yes | ./dockerpublish.sh)
echo "Docker publish for indyscan-webapp"
(cd ../start/indypool && yes | ./dockerpublish.sh)


