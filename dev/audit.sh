cd "$(dirname $0)" || exit
echo "Auditing indyscan-api"
(cd ../indyscan-api && npm audit)
echo "Auditing indyscan-api-client"
(cd ../indyscan-api-client && npm audit)
echo "Auditing indyscan-daemon"
(cd ../indyscan-daemon && npm audit)
echo "Auditing indyscan-storage"
(cd ../indyscan-storage && npm audit)
echo "Auditing indyscan-txtype"
(cd ../indyscan-txtype && npm audit)
echo "Auditing indyscan-webapp"
(cd ../indyscan-webapp && npm audit)


