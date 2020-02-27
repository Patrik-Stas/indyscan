# `transformer` interface
Performs certain data transformation on passed transaction. The transformer implementations specify what format
`txData` should be of.
```
async processTx(txData) -> {processedTx, format}}
```

#### `transformer` interface implementation: `transformer-original2expansion`
Expects to be passed transaction in `original` format. Returns copy of data received, but possibly with additional
fields added, depending on transaction type. 

Constructor requires following arguments:
```json
{
    "id": "transformer.expansion.{{{INDY_NETWORK}}}",
    "sourceLookups": "source.target.{{{INDY_NETWORK}}}"
}
```
The `sourceLookups` lookups must be id of a source containing transactions belonging to the same network as 
to where processed transaction belongs to. The reason for this is because some transformation are looking up
ledger transactions for additional information. For example, when processing CLAIM_DEF, the SCHEMA the CLAIM_DEF
refers to is looked up to find out name and version of the referred schema.
Should be up to careful consideration whether in case of error, an exception should be thrown, or whether 
processing should return result describing the error. In case it is likely the transformation data will 
be ever back-referenced by some daemon process, exception should be thrown instead of silently failing.
On the other hand, the data involved is not critical, we might be better of reporting the error as a part of 
the transformed data.


#### `transformer` interface implementation: `transformer-state`
Expects to be passed domain NYM or ATTRIB transaction in `original` format. Returns representation of DID state
after applying the transaction to previously known state of the DID. 

Constructor requires following arguments:
```json
{
    "id": "transformer.expansion.{{{INDY_NETWORK}}}",
    "sourceLookups": "source.target.{{{INDY_NETWORK}}}"
}
```
