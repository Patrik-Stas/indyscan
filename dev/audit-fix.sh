cd "$(dirname $0)" || exit
echo "Audit fix for indyscan-api"
(cd ../indyscan-api && npm audit fix)
echo "Audit fix for indyscan-api-client"
(cd ../indyscan-api-client && npm audit fix)
echo "Audit fix for indyscan-daemon"
(cd ../indyscan-daemon && npm audit fix)
echo "Audit fix for indyscan-storage"
(cd ../indyscan-storage && npm audit fix)
echo "Audit fix for indyscan-txtype"
(cd ../indyscan-txtype && npm audit fix)
echo "Audit fix for indyscan-webapp"
(cd ../indyscan-webapp && npm audit fix)


