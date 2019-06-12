# Run indyscan locally
You can run indyscan locally against an arbitrary Indy network. Whether it's Indy pool running in docker
on your localhost, your private Indy network running in cloud or public networks such as Sovrin.

# Test network connectivity
Before you try to run Indyscan, you should verify that you are able to connect to Indy network you wish to 
browse in your Indyscan instance. Basically, all input information you need in order to connect to 
an Indy network is genesis file of the network. For public network, this file is publicly available.
For your own indy networks, you need to know where to find it. We'll take a look at that now.

## Indy-cli
Let's first use command line utility `indy-cli` to check whether a pool is reachable from your machine.
Clone `https://github.com/hyperledger/indy-sdk/tree/master` repo, enter `cli` directory and run `cargo build`.

The produces executable artifact `indy-cli` in `target/debug` subdirectory. Run it and type `help` to
get list of available commands.

Inside `indy-cli` run `pool list` which will list of "registered" Indy networks. In order to "register"
a indy network on your machine, you'll need to create following structure:
```~/.indy_client/pool/<NETWORK_NAME>/<NETWORK_NAME>.txn```
whereas `<NETWORK_NAME>` is placeholder and it's up to you how you name it. This file needs to 
contain genesis pool transactions. These contains keys of the founding Indy nodes of the network.

If you are running Indy pool in docker, this is how you can get genesis file for your network:
```bash
 docker exec <container_id> cat /var/lib/indy/sandbox/pool_transactions_genesis
```
whereas `<container_id>` is ID of docker container running your Indy pool. It should look somewhat
like this 
```
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"127.0.0.1","client_port":9702,"node_ip":"127.0.0.1","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"127.0.0.1","client_port":9704,"node_ip":"127.0.0.1","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"127.0.0.1","client_port":9706,"node_ip":"127.0.0.1","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"127.0.0.1","client_port":9708,"node_ip":"127.0.0.1","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}
```
Now we'll test whether we can connect, but I can tell you in advance that that depends on whether your machine can 
reach the address specified by `client_ip` field.

So open up `indy-cli` again and this time around, you should see `<NETWORK_NAME>` when you enter `pool list`.
For definitive test run `indy-cli connect <NETWORK_NAME>`. If you are connected, you are ready
to scan this network with `indyscan`.

    
# Scan any Indy network
If you know you can reach a network via Indy-cli, you can be sure Indyscan will be able to see transactions
on that network too. Few steps only:
   
1. Clone the repo and build images locally by running
`./build-all.sh`.

2. Check names of pools known to your machine
`ls -l ~/.indy_client/pool`

In my case, I got there few directories of different indy pools
```
drwxr-xr-x  4 prague  staff  128 Feb 13 14:55 MY_POOL_IN_DOCKER
drwxr-xr-x  4 prague  staff  128 Feb 13 22:06 SOVRIN_MAINNET
drwxr-xr-x  4 prague  staff  128 Feb 13 21:54 SOVRIN_TESTNET
```

4. Specify names of pools you want to scan (pool names separated by commas). I'll go for 
the Testnet and my local pool running in docker: 
`INDY_NETWORKS="SOVRIN_TESTNET,MY_POOL_IN_DOCKER" docker-compose up`.

5. You should now be able to start browsing your pools at http://localhost:5050