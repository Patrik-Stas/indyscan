# State tracking
- NYM, ATTRIB txs processed only

For example, we could store following state record when ATTRIB tx modified verkey of DID
```json
{
  "previousSeqNo": "3214",
  "seqNo": "3214",
  "did": 1234,
  "state": {
      "parentDid": "999292929",
      "parentDidAlias": "Jack",
      "alias": "Johnie",
      "verkey": "abce",
      "agency": "http://foo.baer",
      "role": "TRUSTEE",
      "createdDids": [ 
         { "seqNo": 42,  "did": "fooooo", "verkey": "1111", "role": "NONE" },
         { "seqNo": 550, "did": "wwwwww", "verkey": "2222", "role": "TRUSTEE" } 
      ]
    },
  "action" : {
    "type": "MODIFIED",
    "delta": {
         "modifiedVerkey": "aaa"
      }
  }
}
```

This *current* state of a DID can be determined by simple fetching from storage didstate object for the `did` with
the highest `seqNo' value.

Note, sometimes one transaction can trigger 2 didstate changes - writing a new DID. That will:
- create new `didstate` record, tracking state of this new DID
- modify `didstate` of the transaction author DID - we need to append information about created did to `created_dids`

# Storage model #1 - index per network/subledger
- Option 1: have 1 index per network/subledger for all types of transaction formats. Any interpretation of transaction
would then be stored there. 
### Pros: 
- whenever we'd query transaction by any of its interpretations, whatever transaction set we'd receive, 
we'd also have optionally access to the other interpretations. 
### Cons:
- We will have to start doing updates instead of plain appends, so the data no longer will be strictly immutable, 
increasing risk of bugs. 

### Pros again:
-  The only allowed mutability to an existing document would be *adding a new format* - adding a new representation 
of given transaction. But we'd never mutate existing representations. The way we could manage index/processor 
modifications could then work by creating new format. Example:
- first version expansion format is called `expansion-v1.0` 
- we make change to the expansion, version it `expansion-v2.0`
- Old pipelines can keep running
- We can start new pipeline which will iterate `original` format, use new version of processor and do appends as
 `expansion-v2.0` format. Once we catch up with top of the ledger, we can switch to new expansion version and
 delete the old one. 
 
### State tracking
Here's example how storage model #1 can look like with state tracking format proposal.
```json
{
  "meta": {
     "seqNo": "5000",
     "subledger": "domain"
  },
  "original-v1.0.0": {},
  "expansion-v1.0.0": {
    "txTypeName": "NYM"
  },
  "didstate": {
     "meta": {
         "processTime": "2949512355"
     },
     "data" : [
      {
          "previousSeqNo": "4000",
          "did": "4u7h0r4u7h0r4u7h0r",
          "didState": {
              "parentDid": "g3n35154u7h0r",
              "parentDidAlias": "GenesisAuthor",
              "alias": "DidAuthorJohn",
              "verkey": "abcdefg",
              "agency": "http://john.agent",
              "role": "TRUSTEE",
              "createdDids": [ 
                 { "seqNo": 5000, "did": "n3wd1dn3wd1d", "verkey": "foofoo", "role": "MONITOR" } 
              ]
            },
          "action" : {
             "type": "DID-WRITE",
              "delta": [
                 { "createdDids": 
                    { "added": 
                      { "seqNo": 5000, "did": "n3wd1dn3wd1d", "verkey": "foofoo", "role": "MONITOR" } 
                    }
                }
             ]
          }
     },
     {
         "did": "n3wd1dn3wd1d",
         "didState": {
            "parentDid": "4u7h0r4u7h0r4u7h0r",
            "parentDidAlias": "DidAuthorJohn",
            "verkey": "foofoo",
            "role": "MONITOR",
            "createdDids": [ ]
          },
         "action" : {
            "type": "DID-CREATED"
         }
      }
    ]
  }
}
```
 

# Storage model #2 - index network/subledger/format
Second option would be store state in separate index with its own mapping. 

### Pros: 
No document udpates at all which is kind of nice property.

### Cons:
- Whenever we retrieve tx set within some format, we would have to make many queries to get transactions from
the other formats.

### Thoughs:
- How would we do processor updates? If we add new format, we would have to create a new index for it.



# Processor error handling
Another thing to consider is exceptions throw in processing stage. It's either:
1. bug in code and retrying to process given tx will always give the same err - if it's not critical part of 
code, it might sense to fake the processing as success but leaving error info inside the processed tx itself.
2. We need to weight mostly whether other indyscan processes might rely on consistency of this data. If the given
type of failure is unacceptable, we should keep blocking he pipeline 
3. temporary issues solvable by retry - like when we are doing backward lookups. here we always wanna keep trying

In case 1 we add err metadata to processed output
In case 2,3 we can throw Error and rely on retries of layer above.


# ES:
- `sovrin_network_didstate`
- will contain complete history - as many objects as there is nyn and attrib transactions
- when new attrib transaction occurs:
  - find latest state for this nym

