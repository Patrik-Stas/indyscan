const txTypeUtils = require('indyscan-txtype')

function esFilterByTxTypeNames (txNames) {
  return {
    'terms': {
      'idata.indyscan.txn.type': txTypeUtils.txNamesToTypes(txNames)
    }
  }
}

function esFilterSubledgerName (subledgerName) {
  return {
    'term': {
      'imeta.subledger': {
        'value': subledgerName
      }
    }
  }
}

function esFilterBySeqNo (seqNo) {
  return {
    'term': {
      'imeta.seqNo': {
        'value': seqNo
      }
    }
  }
}

function esFilterContainsFormat (format) {
  return {
    'exists': {
      'field': `idata.${format}`
    }
  }
}

function esFilterHasTimestamp () {
  return {
    'exists': {
      'field': 'idata.indyscan.txnMetadata.txnTime'
    }
  }
}

function esFilterSeqNoGte (seqNo) {
  return {
    'range': {
      'imeta.seqNo': {
        'gte': seqNo
      }
    }
  }
}

function esFilterSeqNoLt (seqNo) {
  return {
    'range': {
      'imeta.seqNo': {
        'lt': seqNo
      }
    }
  }
}

function esFilterTxnAfterTime (utime) {
  return {
    'range': {
      'idata.indyscan.txnMetadata.txnTime': {
        'gte': new Date(utime * 1000).toISOString()
      }
    }
  }
}

function esFilterTxnBeforeTime (utime) {
  return {
    'range': {
      'idata.indyscan.txnMetadata.txnTime': {
        'lt': new Date(utime * 1000).toISOString()
      }
    }
  }
}

function esFullTextsearch (text) {
  return {
    'simple_query_string': {
      'query': text,
      'default_operator': 'and'
    }
  }
}

function esOrFilters (...filters) {
  let nonNullFilters = filters.filter(f => !!f)
  return { 'bool': { 'should': [...nonNullFilters] } }
}

function esAndFilters (...filters) {
  let nonNullFilters = filters.filter(f => !!f)
  return { 'bool': { 'filter': [...nonNullFilters] } }
}

module.exports.esFilterSubledgerName = esFilterSubledgerName
module.exports.esFilterByTxTypeNames = esFilterByTxTypeNames
module.exports.esFilterTxnAfterTime = esFilterTxnAfterTime
module.exports.esFilterTxnBeforeTime = esFilterTxnBeforeTime
module.exports.esFilterBySeqNo = esFilterBySeqNo
module.exports.esFilterHasTimestamp = esFilterHasTimestamp
module.exports.esFilterSeqNoGte = esFilterSeqNoGte
module.exports.esFilterSeqNoLt = esFilterSeqNoLt
module.exports.esAndFilters = esAndFilters
module.exports.esOrFilters = esOrFilters
module.exports.esFullTextsearch = esFullTextsearch
module.exports.esFilterContainsFormat = esFilterContainsFormat
