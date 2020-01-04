(cd indyscan-api && yes | ./dockerbuild.sh)
(cd indyscan-daemon && yes | ./dockerbuild.sh)
(cd indyscan-webapp && yes | ./dockerbuild.sh)
(cd start/indypool && yes | ./build-pool.sh)


