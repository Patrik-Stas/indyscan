cd "$(dirname $0)" || exit
#echo "Unit testing indyscan-api"
#(cd ../indyscan-api && npm run test:unit)
#echo "Unit testing indyscan-daemon"
#(cd ../indyscan-daemon && npm run test:unit)
echo "Unit testing indyscan-storage"
(cd ../indyscan-storage && npm run test:integration)


