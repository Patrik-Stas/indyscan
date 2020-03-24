const io = require("socket.io-client")
const ioClient = io.connect("http://localhost:3709/socket.io/txs-sovmain")

ioClient.on("tx-processed", (data) => console.info(JSON.stringify(data))) // make rooms work!
