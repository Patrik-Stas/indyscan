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
