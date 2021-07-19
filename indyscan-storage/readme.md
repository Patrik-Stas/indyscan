# Storage format

- Each subledger (domain/pool/config) is stored in separate transaction ES index. 
- Each transaction is stored in 1 ES document. 

At high level, each transaction document (omitting ES native fields such as `_id`, `_version`, ...) has following structure:
```
{
    "imeta": {
      "subledger": "pool",
      "seqNo": 162
    },
    "idata": {
      "<format_name_AAA>": {
        "imeta": {
          "subledger": domain|pool|config,
          "seqNo": <uint>
        },
        "idata": {
          <transaction_data_AAA_formated>
        }
      },
      "<format_name_BBB>": {
        "imeta": {
          "subledger": domain|pool|config,
          "seqNo": <uint>
        },
        "idata": {
          <transaction_data_BBB_formated>
        }
      },
    }
}
```
As you can see, the example above is fairly generic. That's because on storage layer, we don't 
dictate what the transaction data should actually look like. The DB layer allows for various
formats / representation of the same transaction.

As of right now, we have recognize 2 different formats:
1. `serialized` - Stringified JSON of the transaction data as was received from ledger. 
2. `expansion` - JSON document but with some fields added, reformatted or removed. For
example, CLAIM_DEF transaction contains link to ID of schema it links to. However, in 
   the `expansion` format it additionally contains field `refSchemaName`, which is name
   of the schema it links to. This format generally contains data of "human nature" and
   removes low-level technical data (like `auditPath`).





