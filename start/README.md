# IndyPool + IndyScan on localhost
Before you run startup docker-compose, you will need to build special image of indy pool. Run 
```
./indypool/buildd-pool.sh
```
This will build image `indyscanpool:indypool.indyscan-v1.14.1`. This image is using genesis file where the nodes are
using address `indypool.indyscan`. Genesis file for this indy pool is to be found at 
`app-config-daemon/genesis/INDYPOOL_INDYSCAN.txn`. 

Now let's start Indyscan with Indypool. 
```
docker-compose up
```

This will start up
- indy pool
- indyscan services (scanner, api, ui, elasticsearch)
- by default also kibana, you can opt-out by commenting it out in the `docker-compose` file
 
# How to connect to the pool from localhost
Cool so now you have indypool with indyscan attached running in Docker, but how do you connect to this Indy ledger
from localhost? Run `./init-local.sh` which will add new network `INYPOOL_INDYSCAN` to list of known Indy networks
at `~/.indy_client/pool`. 

One last step before it all clicks. If you look at genesis file for this network, the nodes have are using address
`indypool.indyscan`. But in reality, we want to connect to the indy pool running in docker, available at on our host
at address `127.0.0.1`. To fix this:
- On OSX and Linux, add following record to `/etc/hosts`
      
       `127.0.0.1	indypool.indyscan`
       
- For windows (was not tested), make analogical modification following this 
  article https://support.rackspace.com/how-to/modify-your-hosts-file/         
 
