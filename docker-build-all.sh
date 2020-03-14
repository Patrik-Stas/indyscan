cd "$(dirname $0)" || exit
echo "Going to build base indysdk image"
(cd ubuntu-libindy && yes | ./dockerbuild.sh)
echo "Going to build docker for 'indyscan-api'"
(cd indyscan-api && yes | ./dockerbuild.sh)
echo "Going to build docker for 'indyscan-daemon'"
(cd indyscan-daemon && yes | ./dockerbuild.sh)
echo "Going to build docker for 'indyscan-daemon-ui'"
(cd indyscan-daemon-ui && yes | ./dockerbuild.sh)
echo "Going to build docker for 'indyscan-webapp'"
(cd indyscan-webapp && yes | ./dockerbuild.sh)
echo "Going to build docker for 'start/indypool'"
(cd start/indypool && yes | ./build-pool.sh)


