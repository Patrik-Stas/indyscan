const io = require("socket.io-client")
const ioClient = io.connect("http://localhost:3709/SOVRIN_MAINNET")

// ioClient.on("tx-processed", (data) => {
//   console.log(`New TX processed! ${JSON.stringify(data, null, 2)}.`)
//   console.info()
// })

ioClient.on("rescan-scheduled", (data) => {
  console.log(`Scheduled new scan ${JSON.stringify(data, null, 2)}.`)
  console.info()
})


