const sleep = require('sleep-promise')

function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

function jitterize (number, jitterRatio) {
  return number + (number * getRandomArbitrary(-jitterRatio, jitterRatio))
}

async function sleepWithJitter (logPrefix, seconds, jitterRatio) {
  const timeoutMs = jitterize(seconds * 1000, jitterRatio)
  await sleep(timeoutMs)
}

module.exports.jitterize = jitterize
module.exports.sleepWithJitter = sleepWithJitter
