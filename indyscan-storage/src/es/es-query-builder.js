const txTypeUtils = require('indyscan-txtype')

function esFilterByTxTypeNames (txNames) {
  return {
    'terms': {
      'txn.type': txTypeUtils.txNamesToTypes(txNames)
    }
  }
}

function esFilterHasTimestamp () {
  return {
    'exists': {
      'field': 'txnMetadata.txnTime'
    }
  }
}

function esFilterBySeqNo (seqNo) {
  return {
    'term': {
      'txnMetadata.seqNo': {
        'value': seqNo
      }
    }
  }
}

function esFilterAboveSeqNo (seqNo) {
  return {
    'range': {
      'txnMetadata.seqNo': {
        'gte': seqNo
      }
    }
  }
}

function esFilterBelowSeqNo (seqNo) {
  return {
    'range': {
      'txnMetadata.seqNo': {
        'lt': seqNo
      }
    }
  }
}

function esFilterTxnAfterTime (utime) {
  return {
    'range': {
      'txnMetadata.txnTime': {
        'gte': utime
      }
    }
  }
}

function esFilterTxnBeforeTime (utime) {
  return {
    'range': {
      'txnMetadata.txnTime': {
        'lt': utime
      }
    }
  }
}

function esOrFilters (...filters) {
  return {'bool': {'should': [...filters]}}
}

function esAndFilters (...filters) {
  return {'bool': {'must': [...filters]}}
}

module.exports.esFilterByTxTypeNames = esFilterByTxTypeNames
module.exports.esFilterTxnAfterTime = esFilterTxnAfterTime
module.exports.esFilterTxnBeforeTime = esFilterTxnBeforeTime
module.exports.esFilterBySeqNo = esFilterBySeqNo
module.exports.esFilterHasTimestamp = esFilterHasTimestamp
module.exports.esFilterAboveSeqNo = esFilterAboveSeqNo
module.exports.esFilterBelowSeqNo = esFilterBelowSeqNo
module.exports.esAndFilters = esAndFilters
module.exports.esOrFilters = esOrFilters
