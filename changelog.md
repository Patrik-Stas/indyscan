# Yet to come next
- Websocket integration between daemon and webapp
- New TX representation `state` - will provide history of all states DID has ever was at.  
- Graphs, histograms in webapp 

# 4.0.0
- Big `indyscan-daemon` rewrite - it's more flexible and capable supporting range of workloads.
- New `indyscan-daemon` file configuration format
- The `indyscan-daemon` can be now run with HTTP server enabled. The exposed API enables management of workers. 
- Redesigned ElasticSearch storage model. Transaction can now have arbitrary number of format representations. 
- New transaction storage model. Each transaction has exactly 1 document in ElasticSearch, however this document
can contain many representations of the same transaction.
- Small UX fixes in webapp (clickable IndyScan header in to left, switching networks without being redirected to homepage)
- Improved documentation 
- Added project `indyscan-daemon-ui` to manage `indyscan-daemon` running workers. 

# 3.1.3
- Update to IndySDK 1.14.2

# 3.1.2
- Fix bug waiting incorrect amount of time (too long) when no new transactions are available.

## 3.1.1
- Display "Genesis Tx" instead of "Invalid date" in UI if timestamp is not present on tx.
- Fix UI error when reverse order is enabled together with TX type filter
- Adjust ES mapping to be more tolerant toward "scheduleTime" format in POOL_UPGRADE transaction
- Prettier UI
- Display transaction count given currently selected filter/search in UI
- Cap pagination to max 500 pages given default page size of 50

## 3.0.0
- Using `Elasticsearch` instead of `Mongo` for storage
- `indyscan-daemon` is reading configuration file defining what and how to scan, instead of passing configuration
  in environment variables.
- `indysccan-daemon` main scanning loop simplified 
- `indyscan-api` extracted out of `indyscan-webapp`
- Before transactions are stored in storage, various expansions on this documents take place, depending on 
  type of transaction. For example for `CLAIM_DEF` transactions, details about schema it is based on is added.
- `indyscan-webapp` - the transaction view now does not only display raw ledger data, but alo easy to read
  highlights about the transaction, depending on transactions type.
- `indyscan-webapp` - the transactions list view contains fulltext search feature
- `indyscan-webapp` - the transactions list view displays selection of important information about transaction 
  instead of `roothash` 
- `indyscan-webapp` - removed `stats` view. Can be expected to be added again in following 3.x.x versions.
- updated from `Node 8` to `Node 12`
- updated IndySDK to `1.14.1`
- decreased `inyscan-webapp` docker image size from `869` to `290` mb
- decreased `indyscan-daemon` docker image size from `3GB` to `1.3GB` (still terrible, help appreciated).
 
## 2.0.0
##### Daemon
- Use refactored storage module
- Complete rewrite into modular architecture of transaction resolvers, transaction emitter and 
transaction consumer.

##### Explorer webapp
- Fix failing to render tx list page if there's unknown transaction type
- Add support for new transaction types `REVOC_REG_DEF`, `REVOC_REG_ENTRY`, `AUTH_RULE`, 
`AUTH_RULES`, `TXN_AUTHOR_AGREEMENT`, `TXN_AUTHOR_AGREEMENT_AML`
- Use refactored storage module
- Display timeseries graphs on separate page
- Display latest transactions on homepage
- Adjust layout of network / menu links
- Display pretty error if tx page for particular transaction can't be displayed
- Display current version of webapp at footer of homepage

## 1.x.x
- First official release
- Improved color-coded logging using Winston library. Better use of info/debug levels. 
- Error handling improvements 
- Initial delay before scanning begins is configurable via `INITIAL_SCAN_DELAY_MS` environment variable.
