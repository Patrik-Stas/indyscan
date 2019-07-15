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

## 1.x.x
- First official release
- Improved color-coded logging using Winston library. Better use of info/debug levels. 
- Error handling improvements 
- Initial delay before scanning begins is configurable via `INITIAL_SCAN_DELAY_MS` environment variable.
