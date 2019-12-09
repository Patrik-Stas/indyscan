const txTypeUtils = require('indyscan-txtype')

function esFilterByTxTypeNames (txNames) {
  return {
    'terms': {
      'indyscan.txn.type': txTypeUtils.txNamesToTypes(txNames)
    }
  }
}

function esFilterSubledgerName (subledgerName) {
  return {
    'term': {
      'indyscan.subledger.name': subledgerName
    }
  }
}

function esFilterHasTimestamp () {
  return {
    'exists': {
      'field': 'indyscan.txnMetadata.txnTime'
    }
  }
}

function esFilterBySeqNo (seqNo) {
  return {
    'term': {
      'indyscan.txnMetadata.seqNo': {
        'value': seqNo
      }
    }
  }
}

function esFilterAboveSeqNo (seqNo) {
  return {
    'range': {
      'indyscan.txnMetadata.seqNo': {
        'gte': seqNo
      }
    }
  }
}

function esFilterBelowSeqNo (seqNo) {
  return {
    'range': {
      'indyscan.txnMetadata.seqNo': {
        'lt': seqNo
      }
    }
  }
}

function esFilterTxnAfterTime (utime) {
  return {
    'range': {
      'indyscan.txnMetadata.txnTime': {
        'gte': new Date(utime * 1000).toISOString()
      }
    }
  }
}

function esFilterTxnBeforeTime (utime) {
  return {
    'range': {
      'indyscan.txnMetadata.txnTime': {
        'lt': new Date(utime * 1000).toISOString()
      }
    }
  }
}

function esOrFilters (...filters) {
  return { 'bool': { 'should': [...filters] } }
}

function esAndFilters (...filters) {
  return { 'bool': { 'must': [...filters] } }
}

module.exports.esFilterSubledgerName = esFilterSubledgerName
module.exports.esFilterByTxTypeNames = esFilterByTxTypeNames
module.exports.esFilterTxnAfterTime = esFilterTxnAfterTime
module.exports.esFilterTxnBeforeTime = esFilterTxnBeforeTime
module.exports.esFilterBySeqNo = esFilterBySeqNo
module.exports.esFilterHasTimestamp = esFilterHasTimestamp
module.exports.esFilterAboveSeqNo = esFilterAboveSeqNo
module.exports.esFilterBelowSeqNo = esFilterBelowSeqNo
module.exports.esAndFilters = esAndFilters
module.exports.esOrFilters = esOrFilters