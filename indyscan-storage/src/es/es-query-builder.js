// const txTypeUtils = require('indyscan-txtype')
//
// function esFilterByTxTypeNames (txNames) {
//   return {
//     'terms': {
//       'idata.indyscan.txn.type': txTypeUtils.txNamesToTypes(txNames)
//     }
//   }
// }
const _ = require('lodash')

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
  let finalQueries = _.concat(...filters).filter(f => !!f)
  if (finalQueries.length === 0) {
    return {}
  }
  return { 'bool': { 'should': [...finalQueries] } }
}

function esAndFilters (...filters) {
  let finalQueries = _.concat(...filters).filter(f => !!f)
  if (finalQueries.length === 0) {
    return {}
  }
  return { 'bool': { 'filter': [...finalQueries] } }
}

//
// function _toArrayOfQueries(query) {
//   if (query === undefined || query === null) {
//     return []
//   }
//   if (Array.isArray(query)) {
//     return query
//   }
//   if (typeof query === 'object') {
//     return [query]
//   }
//   throw Error(`Can't processes query ${JSON.stringify(query, null, 2)}.`)
// }
//
// function toArrayOfQueries(...queries) {
//   let final = queries.reduce((previous, current) => {
//     console.log(`previous = ${JSON.stringify(previous)}`)
//     console.log(`current = ${JSON.stringify(current)}`)
//     if (current) {
//       console.log('pushing current to previous')
//       previous.push(_toArrayOfQueries(current))
//     }
//     console.log(`returning previous = ${JSON.stringify(previous)}`)
//     return previous
//   }, [])
//   console.log(`FINAL`)
//   console.log(JSON.stringify(final))
//   return final.flat()
// }

module.exports.esFilterSubledgerName = esFilterSubledgerName
// module.exports.esFilterByTxTypeNames = esFilterByTxTypeNames
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
// module.exports.toArrayOfQueries = toArrayOfQueries
