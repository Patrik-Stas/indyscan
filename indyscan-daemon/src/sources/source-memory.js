// https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
function checkNested (obj, level, ...rest) {
  if (obj === undefined) return false
  if (rest.length === 0 && obj.hasOwnProperty(level)) return true // eslint-disable-line
  return checkNested(obj[level], ...rest)
}

function createSourceMemory ({ id, dataspace }) {
  if (!dataspace.domain) {
    throw Error('Dataspace needs to have field \'domain\'')
  }

  if (!dataspace.config) {
    throw Error('Dataspace needs to have field \'config\'')
  }

  if (!dataspace.pool) {
    throw Error('Dataspace needs to have field \'pool\'')
  }

  function getTxData (subledger, seqNo, format) {
    subledger = subledger.toLowerCase()
    format = format.toLowerCase()
    if (!checkNested(dataspace, subledger, seqNo, format)) {
      return undefined
    }
    const txData = dataspace[subledger][seqNo][format]
    return txData
  }

  function getHighestSeqno (subledger, format = 'full') {
    const seqNos = Object.keys(dataspace[subledger])
    if (seqNos.length === 0) {
      return 0
    }
    if (format === 'full') {
      return Math.max(...seqNos)
    }
    seqNos.sort((a, b) => { if (a === b) { return 0 } else { return (a > b) ? -1 : 1 } })
    for (const seqNo of seqNos) {
      const txInTheFormat = dataspace[subledger][seqNo][format]
      if (txInTheFormat) {
        return parseInt(seqNo)
      }
    }
    return 0
  }

  function describe () {
    return 'Inmemory tx source.'
  }

  function getSourceInfo () {
    return {
      implementation: 'inmemory'
    }
  }

  return {
    getSourceInfo,
    describe,
    getTxData,
    getHighestSeqno
  }
}

module.exports.createSourceMemory = createSourceMemory
