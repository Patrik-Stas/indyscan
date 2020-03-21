Proposal for object representing group of workers

```json
{
  "interface": "Worker",
  "impl": "worker-rtw",
  "params": {
    "id": "worker.{{{INDY_NETWORK}}}.domain",
    "iterator": "iterator.{{{INDY_NETWORK}}}",
    "transformer": "transformer.expansion.{{{INDY_NETWORK}}}",
    "target": "target.{{{INDY_NETWORK}}}",
    "subledgers": {
      "domain": "enabled",
      "config": "enabled",
      "pool": "enabled"
    },
    "timing": {
      "timeoutOnSuccess": 1000,
      "timeoutOnIteratorError": 5000,
      "timeoutOnTxNotAvailable": 4000,
      "jitterRatio": 0.4
    }
  }
}
```
