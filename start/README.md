# IndyPool + IndyScan on localhost
Run: 
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

One last step before it all clicks. If you look at genesis file for this 
network (`~/.indy_client/pool/INYPOOL_INDYSCAN/INYPOOL_INDYSCAN.txn`), the nodes have are using address
`indypool.indyscan`. But in reality, we want to connect to the indy pool running in docker, available at 
on our host at address `127.0.0.1`. 

To fix this:
- On OSX and Linux, add following record to `/etc/hosts`
      
       `127.0.0.1	indypool.indyscan`
       
- For windows (was not tested), make analogical modification following this 
  article https://support.rackspace.com/how-to/modify-your-hosts-file/         
 
Now you can veify everything works be trying to connect to network `INYPOOL_INDYSCAN` using IndySDK or IndyCLI.
