 # IndyPool with IndyScan in cloud
1. Setup your environment.
- 0.1: Install terraform `0.11.8` https://releases.hashicorp.com/terraform/0.11.8/
- 0.2: Setup your AWS API Access token in `~/.aws/credentials`
- 0.3: Generate/download private part of AWS SSH Keypair. 

2. Clone repo and enter `awstf` directory

`cd awstf`

3. Init terraform by running

`terraform init`

4. Create Indy pool and IndyScan in AWS. You need to supply 2 terraform variables: `keypair-name` and `private-key-path`, for example:

`terraform keypair-name="indyscan-keypair" private-key-path="/Users/indyscan/.ssh/indyscan.pem" apply`

5. At the end of the Terraform's output you'll see information about your environment

```
null_resource.print-info: Provisioning with 'local-exec'...
null_resource.print-info (local-exec): Executing: ["/bin/sh" "-c" "./print-info.sh awsindyscan http://54.191.4.153:5050"]
null_resource.print-info (local-exec): Indy Pool was provisioned locally by name: scanned-awspool
null_resource.print-info (local-exec): Use IndyScan to browse its transactions: http://54.191.4.153:5050
null_resource.print-info: Creation complete after 0s (ID: 5641596176341745717)
```

## Warning
Beware this pool is running by default publicly in the internet using default genesis data.
