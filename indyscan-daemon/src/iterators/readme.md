# `iterator` interface 
Defined as single function
```
async getNextTx(subledger, format=original) -> 
```
which returns some transaction of specified subledger. 

#### `iterator` interface implementation: `iterator-guided`
Constructor requires following arguments:
```json
{
    "id": "iterator.sovmain",
    "source": "source.sovmain",
    "sourceSeqNoGuidance": "source.target.sovmain"
}
```
Returns transaction data from specified subledger, in specified format from `source`, whereas the seqNo is
determined as `sourceSeqNoGuidance.getHighestSeqno(subledger) + 1`.


