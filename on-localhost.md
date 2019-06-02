#

## If you run Indy pool on localhost
1. Setup Indy pool [locally](https://github.com/hyperledger/indy-sdk#1-starting-the-test-pool-on-localhost)  
2. Build images locally
`./build-all.sh`.
3. Find names of your pools
`ls -l ~/.indy_client/pool`
In my case, I've already got some pools there and the command prints
```
drwxr-xr-x  4 prague  staff  128 Feb 13 14:55 PRIVATE_POOL_127.0.0.1
drwxr-xr-x  4 prague  staff  128 Feb 13 22:06 SOVRIN_MAINNET
drwxr-xr-x  4 prague  staff  128 Feb 13 21:54 SOVRIN_TESTNET
```
4. Specify names of pools you want to scan (pool names separated by commas) 
`INDY_NETWORKS="SOVRIN_MAINNET,SOVRIN_TESTNET" docker-compose up`.
5. Browse the network at http://localhost:5050