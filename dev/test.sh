cd "$(dirname $0)" || exit
echo "Unit testing indyscan-api"
(cd ../indyscan-api && npm run test:unit)
echo "Unit testing indyscan-api-client"
(cd ../indyscan-api-client && npm run test:unit)
echo "Unit testing indyscan-daemon"
(cd ../indyscan-daemon && npm run test:unit)
echo "Unit testing indyscan-storage"
(cd ../indyscan-storage && npm run test:unit)
echo "Unit testing indyscan-txtype"
(cd ../indyscan-txtype && npm run test:unit)
echo "Unit testing indyscan-webapp"
(cd ../indyscan-webapp && npm run test:unit)


