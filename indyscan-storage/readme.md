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
   
# Expansion format
1. Remove all tx fields, keep only `txn` and `txnMetadata`
2. Add field `txn.typeName` - transaction type code `txn.type` mapped to 
   human-readable value. [Mapping details](../indyscan-txtype/src/txdata.js)
3. Add field `txn.txnMetadata.txnTime` - field `txnMetadata.txnTime` expressed as ISO8601 
   format, such as `2021-07-24T11:47:36Z`.
4. In this step, individual processing occurs based on transaction type (`txn.typeName`).
5. If an unexpected error has occurred in step 4., add field `ierror`, `ierror.message`,
   `ierror.stack` with details.


# Expansion format specifics
As described above, details of step 4 processing depends on particular transaction type.

## `NYM` | `ATTRIB` processing
4.a. If does not contain field `tx.txn.data.dest`, create it and assign value of `tx.txn.metadata.from`.
4.b. If contains field `tx.txn.data.verkey`, create it and calculate value based on `tx.txn.data.dest` and `tx.txn.data.verkey`
4.c. If contains field `tx.txn.data.role`, create field `tx.txn.data.roleAction` as human readable code of how the role for `tx.txn.data.dest` changes.
4.d. If contains field `tx.txn.data.raw`, try to parse service endpoint set it as value to `tx.txn.data.endpoint`

## `NYM` | `ATTRIB` processing
Preparation: Read `tx.txn.data.ref` (reference to SCHEMA transaction by value SCHEMA's creation tx `seqNo`) and reverse-lookup
the schema transaction data on original ledger format. Let's refer to this tx as `schemaTx`.

4.a Delete all fields of `txn.data`
4.b Set value of `tx.txn.data.refSchemaTxnSeqno` as seqNo of the schema transaction.
4.c Set value of `tx.txn.data.refSchemaTxnTime` is ISO8601 timestamp of schema transaction creation.
4.d Set value of `tx.txn.data.refSchemaId` as id of the schema transactions.
4.e Set value of `tx.txn.data.refSchemaName` as name of the schema.
4.f Set value of `tx.txn.data.refSchemaVersion` as version of the schema.
4.g Set value of `tx.txn.data.refSchemaFrom` as DID which created the schema.
4.h Set value of `tx.txn.data.refSchemaAttributes` as array of attributes of the schema.






