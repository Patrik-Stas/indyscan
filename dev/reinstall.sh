cd "$(dirname $0)" || exit
echo "Unit testing indyscan-api"
(cd ../indyscan-api && npm install)
echo "Unit testing indyscan-api-client"
(cd ../indyscan-api-client && npm install)
echo "Unit testing indyscan-daemon"
(cd ../indyscan-daemon && npm install)
echo "Unit testing indyscan-storage"
(cd ../indyscan-storage && npm install)
echo "Unit testing indyscan-txtype"
(cd ../indyscan-txtype && npm install)
echo "Unit testing indyscan-webapp"
(cd ../indyscan-webapp && npm install)
