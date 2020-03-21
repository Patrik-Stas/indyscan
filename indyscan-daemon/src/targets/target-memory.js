// https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
function checkNested (obj, level, ...rest) {
  if (obj === undefined) return false
  if (rest.length === 0 && obj.hasOwnProperty(level)) return true // eslint-disable-line
  return checkNested(obj[level], ...rest)
}

function createTargetMemory ({ id, dataspace }) {
  if (!dataspace.domain) {
    throw Error('Dataspace needs to have field \'domain\'')
  }

  if (!dataspace.config) {
    throw Error('Dataspace needs to have field \'config\'')
  }

  if (!dataspace.pool) {
    throw Error('Dataspace needs to have field \'pool\'')
  }

  function addTxData (subledger, seqNo, format, txData) {
    subledger = subledger.toLowerCase()
    format = format.toLowerCase()
    if (!checkNested(dataspace, subledger, seqNo)) {
      dataspace[subledger][seqNo] = {}
    }
    if (checkNested(dataspace, subledger, seqNo, format)) {
      throw Error(`Already contains ${subledger}/${seqNo}/${format}`)
    }
    if (!txData) {
      throw Error('Attempting to add transaction data which are null or undefined.')
    }
    dataspace[subledger][seqNo][format] = txData
  }

  async function setMappings (formatName, indexMappings) {}

  function getObjectId () {
    return id
  }

  return {
    getObjectId,
    addTxData,
    setMappings
  }
}

module.exports.createTargetMemory = createTargetMemory
