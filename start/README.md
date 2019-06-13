# IndyPool+IndyScan quickstart
To startup Indy network (a pool of Indy nodes) on your localhost, run:
```
./start-local2local.sh
```
This will startup several containers
- Indy pool (the Indy network)
- IndyScan daemon (checks for new transactions on the network)
- Indyscan webapp (web application to browse network transactions)
- MongoDB (where all discovered transactions are stored for quick access)

The indy pool is registered on your machine under name `indypool-by-indyscan-x`, by placing its pool
genesis file on your host machine in `~/.indy_client/pool/indypool-by-indyscan-x/indypool-by-indyscan-x.txn`.


