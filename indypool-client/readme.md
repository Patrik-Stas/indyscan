# Indy test client
This is simple tool to test your connectivity to a Indy network. 

# Install dependencies
`npm run install`

# How to test your network
Assuming you have created network genesis file for network `FOO` 
at `~/.indy_client/FOO/FOO.txn` you run `NETWORK_NAME=FOO npm run verify`. 

If you see `[info]: FINISHED SUCCESS!` congrats, the network is live and you have connectivity. 
