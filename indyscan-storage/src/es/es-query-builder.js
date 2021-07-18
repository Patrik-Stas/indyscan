const _ = require('lodash')

function esFilterByTxTypeNames (txNames) {
  return {
    terms: {
      'idata.expansion.idata.txn.typeName': txNames
    }
  }
}

function esFilterSubledgerName (subledgerName) {
  return {
    term: {
      'imeta.subledger': {
        value: subledgerName
      }
    }
  }
}

function esFilterBySeqNo (seqNo) {
  return {
    term: {
      'imeta.seqNo': {
        value: seqNo
      }
    }
  }
}

function esFilterContainsFormat (format) {
  return {
    exists: {
      field: `idata.${format}`
    }
  }
}

function esFilterHasTimestamp () {
  return {
    exists: {
      field: 'idata.expansion.idata.txnMetadata.txnTime'
    }
  }
}

function esFilterSeqNoGteLtRange (gte, lt) {
  return {
    range: {
      'imeta.seqNo': {
        gte,
        lt
      }
    }
  }
}

function esFilterSeqNoGte (seqNo) {
  return {
    range: {
      'imeta.seqNo': {
        gte: seqNo
      }
    }
  }
}

function esFilterSeqNoLt (seqNo) {
  return {
    range: {
      'imeta.seqNo': {
        lt: seqNo
      }
    }
  }
}

function esFilterTxnAfterTime (utime) {
  return {
    range: {
      'idata.expansion.idata.txnMetadata.txnTime': {
        gte: new Date(utime * 1000).toISOString()
      }
    }
  }
}

function esFilterTxnBeforeTime (utime) {
  return {
    range: {
      'idata.expansion.idata.txnMetadata.txnTime': {
        lt: new Date(utime * 1000).toISOString()
      }
    }
  }
}

function esFullTextsearch (text) {
  return {
    simple_query_string: {
      query: text,
      default_operator: 'and'
    }
  }
}

function esOrFilters (...filters) {
  const finalQueries = _.concat(...filters).filter(f => !!f)
  if (finalQueries.length === 0) {
    return {}
  }
  return { bool: { should: [...finalQueries] } }
}

function esAndFilters (...filters) {
  const finalQueries = _.concat(...filters).filter(f => !!f)
  if (finalQueries.length === 0) {
    return {}
  }
  return { bool: { filter: [...finalQueries] } }
}

module.exports.esFilterSubledgerName = esFilterSubledgerName
module.exports.esFilterByTxTypeNames = esFilterByTxTypeNames
module.exports.esFilterTxnAfterTime = esFilterTxnAfterTime
module.exports.esFilterTxnBeforeTime = esFilterTxnBeforeTime
module.exports.esFilterBySeqNo = esFilterBySeqNo
module.exports.esFilterHasTimestamp = esFilterHasTimestamp
module.exports.esFilterSeqNoGte = esFilterSeqNoGte
module.exports.esFilterSeqNoLt = esFilterSeqNoLt
module.exports.esFilterSeqNoGteLtRange = esFilterSeqNoGteLtRange
module.exports.esAndFilters = esAndFilters
module.exports.esOrFilters = esOrFilters
module.exports.esFullTextsearch = esFullTextsearch
module.exports.esFilterContainsFormat = esFilterContainsFormat
