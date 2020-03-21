# Indyscan API
- Provides simple API to search and read transactions stored in ElasticSearch database. The transactions in 
ElasticSearch are expected to be in certain format. 
- The core structure of these documents is defined in `indyscan-storage` project. The specific details of various
transaction formats are encapsuled in `indyscan-daemon`.

# Configuration
First you have to supply some environment variables. Example of variables and values:
```
ES_URL=http://localhost:9200
LOG_LEVEL=info
PORT=3708
LOG_HTTP_REQUESTS=true
LOG_HTTP_RESPONSES=true
NETWORKS_CONFIG_PATH=./app-config/sovrin.json
```
Whereas 
- `ES_URL` - specifies ElasticSearch URL, the source of transactions
- `LOG_LEVEL` - logs verbosity (error/warn/debug/info/silly)
- `PORT` - port to run the API on
- `LOG_HTTP_REQUESTS` - true/false - should incoming http requests be logged
- `LOG_HTTP_RESPONSES` - true/false - should outgoing http responses be logged 
- `NETWORKS_CONFIG_PATH` - path to networks configuration file

# Network configuration file
This configuration file specifies what networks will be available via API and which ES index they should be sourced
from.
For each network, you can set up it's human-friendly display name, network description and priority. The priority
defines how will networks be ordered in API requests. The network with higher priority value will be first in the list.

See sample config file [here](./app-config/sovrin.json) 

# Development
1. Install dependencies `npm install`
2. Adjust environment variables as you like in `nodemon.json`
3. Run `npm run dev`

