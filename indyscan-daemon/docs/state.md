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

