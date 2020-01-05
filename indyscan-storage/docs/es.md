Pipeline example
```js
   const pipelineId = `add-timestamp-for-${index}`
   const pipelineBody = {
     id: pipelineId,
     body: {
       'description': 'map txnMetadata.txnTime to @timestamp',
       'processors': [
         {
           'date_index_name': {
             'field': 'txnMetadata.txnTime',
             'index_name_prefix': index,
             'date_rounding': 'S',
             date_formats: ["UNIX"]
           }
         }
       ]
     }
   }
   await client.ingest.putPipeline(pipelineBody)
```
