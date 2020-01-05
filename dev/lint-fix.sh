cd "$(dirname $0)" || exit
echo "Linting indyscan-api"
(cd ../indyscan-api && npm run lint:fix)
echo "Linting indyscan-ap-client"
(cd ../indyscan-api-client && npm run lint:fix)
echo "Linting indyscan-daemon"
(cd ../indyscan-daemon && npm run lint:fix)
echo "Linting indyscan-storage"
(cd ../indyscan-storage && npm run lint:fix)
echo "Linting indyscan-txtype"
(cd ../indyscan-txtype && npm run lint:fix)
echo "Linting indyscan-webapp"
(cd ../indyscan-webapp && npm run lint:fix)


