# Indyscan
##### Hyperledger Indy Transaction explorer

--------

List and view transactions on Hyperledger Indy blockchain! Look at pretty graphs! *Yayy~*

![Indyscan](/docs/indyscan.png)


# How it works
The daemon is periodically looking for new transactions. When new transaction is found, it's
stored in MongoDB. The WebApp queries MongoDB and displays the data.

# Which networks?
The scanner and webapp can be easily configured to run against arbitrary Indy pool. As far as valid Indy pool 
genesis files are supplied, it should work!

# How difficult to run?
Very easy! Everything is dockerized! 
1. Build images locally
`./build-all.sh`.
2. Find names of your pools
`ls -l ~/.indy_client/pool`
In my case, I've already got some pools there and the command prints
```
drwxr-xr-x  4 prague  staff  128 Feb 13 14:55 PRIVATE_POOL_127.0.0.1
drwxr-xr-x  4 prague  staff  128 Feb 13 22:06 SOVRIN_MAINNET
drwxr-xr-x  4 prague  staff  128 Feb 13 21:54 SOVRIN_TESTNET
```
2. Specify names of pools you want to scan (pool names separated by commas) 
`INDY_NETWORKS="SOVRIN_MAINNET,SOVRIN_TESTNET" docker-compose up`.
3. Go to http://localhost:3000
3. Profit.

# Scanning
By default, the scanners fetches new transaction every 0.5sec. If none is available, it waits for few second or minutes. 
I am already running instance fo this at https://indyscan.io so be nice and let's not spam the network too much!

# Coming next
- Transaction filter
- Transaction description
- Prettier graphs with overlays
- Dynamic graphs: based on your timerange selection and transaction filter
- ... and probably much more 

# Dev
### Mongo
Startup your mongoDb instance. You can use Docker, and in such a case I recommend mount its data directory somewhere on your host, so you don't loose previously scanned transactions if you kill your mongo container.
`docker run --name local-indyscan-mongo -p 27017:27017 -v ~/indyscan/mainnet:/data/db -d mongo:3.4.18`

## Daemon
If you want to develop Webapp part of project, there's no point running Daemon locally. You'll be better of just starting it as docker container. 

### Run Daemon in docker container
```
build-daemon.sh
```
TODO: Add instructions how to start container and make sure it can talk to mongo container.

### Run Daemon locally
This is only handy if you want to develop code of daemon and you want to get fast feedback loop for your modifications.
First ou need to make sure you've have compiled libindy for your system. Follow instructions on https://github.com/hyperledger/indy-sdk to do this.
Startup transaction scanner daemon. In the `daemon` directory, run
```
npm install
```
Before you run daemon, the directory `~/.indy_client/pool` in your machine should contain pool configurations. For example, in my case it contains these:
```
> ls ~/.indy_client/pool
SOVRIN_MAINNET SOVRIN_TESTNET
```
And each of these 2 directories contains genesis transactions for given network. If you don't have any pool configurations, you can quickly generate configurations for sovrin testnet and mainnet by running
```
node genesis.js
```
When we start indyscan daemon, we need to asur that variable `INDY_NETWORKS` is exported. It's value should be list of pool names separated by comma, matching pool names in your `~/.indy_client/pool` directory. 
So for example, given content of my `~/.indy_client/pool` shown in example above, I would start running daemon against these pool like this: 
```
INDY_NETWORKS="SOVRIN_MAINNET,SOVRIN_TESTNET" npm run start
```
If everything falls in place, daemon will open connections to pools listed in `INDY_NETWORKS` environment variable based on their configuration inside `~/.indy_client/pool` directory and start polling transactions from the 1st until the last.
By default it fetches 2tx/per sec/per pool and slows down polling frequency once it discovers there's no more transactions left. Each transaction is saved to mongodb. 

# Webapp
Webapp reads tx data from mongo and presents it. You have to pass in the `INDY_NETWORKS` the same way like in case of the `daemon` so it knows which pools it should display. The first pool name specified in `INDY_NETWORKS` will be displayed on homepage
by default.
```
cd app;
npm install
INDY_NETWORKS="SOVRIN_MAINNET,SOVRIN_TESTNET" npm run dev
```



## Structure
```
- app                 - nextjs web app
- daemon              - process looking for new transactions
- indyscan-storage    - shared library for app and daemon
- infra               - indyscan.io deployment files
- libindy-docker      - dockerfile to build image with libindy
- libindy-node-docker - dockerfile with node and libindy
```



-----------

[## Released under GNU GPL V3 License](LICENSE.MD)

-----------

