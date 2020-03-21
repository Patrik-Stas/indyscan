set -e
SOURE_GENESIS="$(dirname "$0")/app-configs-daemon/genesis/INDYSCANPOOL.txn"

mkdir -p ~/.indy_client/pool/INDYSCANPOOL
cp "$SOURE_GENESIS" ~/.indy_client/pool/INDYSCANPOOL/INDYSCANPOOL.txn

echo "Added new Indy network INDYSCANPOOL. See its genesis file running 'cat ~/.indy_client/pool/INDYSCANPOOL/INDYSCANPOOL.txn' "
