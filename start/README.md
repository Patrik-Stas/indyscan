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
from localhost? Run `./init-local.sh` which will add new network `INDYSCANPOOL` to list of known Indy networks
at `~/.indy_client/pool`. 

One last step before it all clicks. If you look at genesis file for this 
network (`~/.indy_client/pool/INDYSCANPOOL/INDYSCANPOOL.txn`), the nodes have are using address
`indyscan-indypool.indyscan`. But in reality, we want to connect to the indy pool running in docker, available at 
on our host at address `127.0.0.1`. 

To fix this:
- On OSX and Linux, add following record to `/etc/hosts`
      
       `127.0.0.1	indyscanpool`
       
- For windows (was not tested), make analogical modification following this 
  article https://support.rackspace.com/how-to/modify-your-hosts-file/         
 
You can now verify network connectivity: 
1. Navigate to `indypool-client` [project](../indypool-client) in this repo.
2. Install project `npm run install`
3. Test connectivity: `npm run verify-indyscan-local`
