SOURE_GENESIS="$(dirname "$0")/daemon-app-config/genesis/INDYSCAN_INDYPOOL.txn"

mkdir -p ~/.indy_client/pool/INDYSCAN_INDYPOOL
cp "$SOURE_GENESIS" ~/.indy_client/pool/INDYSCAN_INDYPOOL/INDYSCAN_INDYPOOL.txn
