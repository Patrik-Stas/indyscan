# `worker` interface
The worker is a top level object typically consuming other, previously described interface. Pipelines generally
iterate over transactions, perform some transformation on retrieved data and send results to some target.

The implement interface:
```
start()
stop()
info()
```
which is fairly self explanatory - `start` and `stop` starts or stops the worker. `info` returns diagnostic
information about current or historical state of the worker run.

### `worker` interface implementation: `worker-rtw`
RTW stands for `read-transform-write` - this worker is the basic core worker implementation which reads transactions
off some source, transforms them and the result is written to some destination.

Constructor requires following arguments:
```json
{
    "id": "worker-rtw.{{{INDY_NETWORK}}}.pool",
    "subledger": "pool",
    "iterator": "iterator.{{{INDY_NETWORK}}}",
    "iteratorTxFormat": "original",
    "transformer": "transformer.expansion.{{{INDY_NETWORK}}}",
    "target": "target.{{{INDY_NETWORK}}}",
    "timing": {
      "timeoutOnSuccess": 1000,
      "timeoutOnTxIngestionError": 5000,
      "timeoutOnTxProcessingError": 5000,
      "timeoutOnLedgerResolutionError": 4000,
      "timeoutOnTxNoFound": 0.4
    }
}
```

Whereas 
- `subledger` - specifies the subledger this worker is processing
- `timing` - specifies timeouts between individual worker runs, depending on various events. You can either set up
  timeout values yourself or use preset by supplying one of following strings as value: `SLOW`, `MEDIUM`, `FAST`, 
  `TURBO`.
- `iterator` - is ID of object implementing `iterator` interface. First stage of the worker begins here. 
  If iterator returns `undefined`, ie. no transaction is yet available, the worker will retry again after 
  `timeoutOnTxNoFound`ms. If an error occurs, the run is aborted and next worker run will run after 
  `timeoutOnLedgerResolutionError`ms. If transaction was received, it's send to a transformer.
- `transformer` - is ID of object implementing `transformer` interface. Transaction from iterator is processed.
  The output of transformation is sent to `target`. If exception is thrown during processing, worker is aborted
  and reruns after `timeoutOnTxProcessingError` ms. 
- `target` - is ID of object implementing `target` interface. The transaction is stored. If an exception is thrown,
  worker run is aborted and reruns after `timeoutOnTxIngestionError`ms. 
