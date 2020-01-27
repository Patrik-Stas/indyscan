// https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
function checkNested(obj, level,  ...rest) {
  if (obj === undefined) return false
  if (rest.length == 0 && obj.hasOwnProperty(level)) return true
  return checkNested(obj[level], ...rest)
}

function createSourceMemory ({id}) {

  let data = {
    domain: {},
    config: {},
    pool: {}
  }

  function addTx(subledger, seqNo, format, txData) {
    subledger = subledger.toLowerCase()
    format = format.toLowerCase()
    if (!checkNested(data, subledger, seqNo)) {
      data[subledger][seqNo] = {}
    }
    if (checkNested(data, subledger, seqNo, format)) {
      throw Error(`Already contains ${subledger}/${seqNo}/${format}`)
    }
    if (!txData) {
      throw Error("Attempting to add transaction data which are null or undefined.")
    }
    data[subledger][seqNo][format] = txData
  }

  function getTx (subledger, seqNo, format = 'original') {
    subledger = subledger.toLowerCase()
    format = format.toLowerCase()
    if (!checkNested(data, subledger, seqNo, format)) {
      return undefined
    }
    return data[subledger][seqNo][format]
  }

  function getHighestSeqno() {
    throw Error('Function getHighestSeqno is not implemented for ledger source. Not expected to be used.')
  }

  function getObjectId() {
    return id
  }

  return {
    getObjectId,
    getTx,
    getHighestSeqno,
    addTx
  }
}

module.exports.createSourceMemory = createSourceMemory
