const io = require("socket.io-client")
const ioClient = io.connect("http://localhost:3709")

ioClient.on("tx-processed", (msg) => console.info(msg))
