# Indyscan
##### Hyperledger Indy Transaction explorer

--------

List and view transactions on Hyperledger Indy blockchain! Look at pretty graphs! Yayy! 

![Indyscan](/docs/indyscan.png)

# Indy networks
Right now the application is hardcoded to display transactions on Sovrin TestNet and Sovrin MainNet.
Fully dockerized, configurable version of this app whichh you could run locally against your own Indy network is 
coming soon. 

# How it works
The daemon is periodically looking for new transactions. When new transaction is found, it's
stored in MongoDB. The WebApp queries MongoDB and presents the data.

# Coming next
- Configurable networks
- Transaction filter
- Transaction description
- Prettier graphs with overlays
- Dynamic graphs: based on your timerange selection and transaction filter
- ... and probably much more 

# Dev
- Stack: Node, NextJS, Express 

## Structure
```
- app                 - nextjs web app
- daemon              - process looking for new transactions
- indyscan-storage    - shared library for app and daemon
- infra               - indyscan.io deployment files
- libindy-docker      - dockerfile to build image with libindy
- libindy-node-docker - dockerfile with node and libindy
```

