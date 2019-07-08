const isArray = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

// Credit for recursiveJSONKeyTransform goes to Ben Wiley
// Taken from https://github.com/benwiley4000/recursive-json-key-transform#readme
const recursiveJSONKeyTransform = (transformer) => {
  const recursiveTransform = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }
    if (isArray(obj)) {
      return obj.map(o => recursiveTransform(o))
    }
    return Object.keys(obj).reduce((prev, curr) => {
      prev[transformer(curr)] = recursiveTransform(obj[curr])
      return prev
    }, {})
  }
  return recursiveTransform
}

function createReplacementFunction (target, replacement) {
  return (str) => {
    return str.replace(target, replacement)
  }
}

module.exports.recursiveJSONKeyTransform = recursiveJSONKeyTransform
module.exports.createReplacementFunction = createReplacementFunction
