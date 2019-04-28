function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

function jitterize (number, jitterRatio) {
  return number + (number * getRandomArbitrary(-jitterRatio, jitterRatio))
}

module.exports.jitterize = jitterize
