function assignBucket (min, bucketSize, value) {
  return Math.floor((value - min) / bucketSize)
}

function createHistogram (values, bucketSize) {
  const min = values[0]
  const max = values[values.length - 1]
  createHistogramInTimeInterval(values, bucketSize, min, max)
}

function createHistogramInTimeInterval (values, bucketSize, from, to) {
  const min = values[0]
  const max = values[values.length - 1]
  const maxBucket = assignBucket(min, bucketSize, max)
  let histogram = []
  let idx = 0
  for (let b = 0; b <= maxBucket; b++) {
    const bucketMin = min + b * bucketSize
    const bucketMax = bucketMin + bucketSize
    let histBucket = [bucketMin, 0]
    histogram.push(histBucket)
    while (values[idx] < bucketMax) {
      histBucket[1]++
      idx++
    }
  }
  return histogram
}

module.exports.createHistogram = createHistogram
module.exports.createHistogramInTimeInterval = createHistogramInTimeInterval
