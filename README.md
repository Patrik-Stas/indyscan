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
`./build-local.sh`.
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
By default, the scanners fetches new transaction every 300ms. If none is available, it waits for few second or minutes. 
I am already running instance fo this at https://indyscan.io so be nice and let's not spam the network too much!

# Coming next
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




MIT License
-----------

Copyright (c) 2019 Patrik Staš (https://indyscan.io)
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
		
