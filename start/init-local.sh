set -e
SOURE_GENESIS="$(dirname "$0")/app-config-daemon/genesis/INDYPOOL_INDYSCAN.txn"

mkdir -p ~/.indy_client/pool/INDYPOOL_INDYSCAN
cp "$SOURE_GENESIS" ~/.indy_client/pool/INDYPOOL_INDYSCAN/INDYPOOL_INDYSCAN.txn

echo "Added new Indy network INDYPOOL_INDYSCAN. See its genesis file running 'cat ~/.indy_client/pool/INDYPOOL_INDYSCAN/INDYPOOL_INDYSCAN.txn' "
