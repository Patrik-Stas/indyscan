# IndyPool with IndyScan in cloud
 
## 1. Setup your environment.
- 0.1: Install terraform `0.12.9` https://releases.hashicorp.com/terraform/0.12.19/
- 0.2: Setup your AWS API Access token in `~/.aws/credentials`
- 0.3: Generate/download private part of AWS SSH Keypair. 

## 2. Clone repo and enter directory `start-aws`

`cd start-aws`

## 3. Init terraform by running

`terraform init`

## 4. Create file `terraform.tfvars`. In this file you need to specify required and you can optionally override default 
terraform configuration. This is how this file could look for you.
```
ubuntu_ami="ami-03ef731cc103c9f09"
region="eu-west-1"
availability_zone="eu-west-1a"
private_key_path="/Users/john/.ssh/my-private-key-FooBAR"
keypair_name="FooBAR"
hosted_zone_name="indypool.id"
dns_hostname="dev.indypool.id"
vpc_id="vpc-abcd1234"
```

Refer to `variables.tf` for documentation of particular variables. Things you definitely need to supply:
- `vpc_id`
- `private_key_path`
- `keypair_name`

You will likely want to override region, and hence you will have to override these:
- `region`
- `availability_zone`
- `ubuntu_ami` (Ubuntu 16 has different AMI across regions!)

Next you need to decide:
#### You want to access pool via public IP
- Omit specifying `hosted_zone_name` and `dns_hostname`. The place from which you will try to connect to the pool must
have access to the internet.
   
#### You want to access pool via custom DNS address
- Specify `hosted_zone_name` and `dns_hostname`. The value of `dns_hostanme` must be subdomain of `hosted_zone_name` value.
For example given `hosted_zone_name="indypool.id"` and `dns_hostname="dev.indypool.id"`, the EC2 running Indypool
and Indyscan will internally within your AWS VPC resolvable via address `dev.indypool.id`. So these machine do not 
need internet.
- The caveat is that the genesis file will be also using `dev.indypool.id` address, but that won't resolve from 
outside your AWS VPC. So you will have to add record to `/etc/hosts` (Linux, OSX) in order to connect to the pool
(it will still have exposed Indypol client ports on a public IP into the internet).

## 5. Run terraform
Run

`terraform apply`

Review resources to be created and confirm

## 6. Check out final output
Hopefully everything went right and you see something along these lines:
```
null_resource.print_info (local-exec): Indy Pool was provisioned locally by name: indyscan-aws
null_resource.print_info (local-exec): Use IndyScan to browse its transactions: http://52.212.45.120:3707
null_resource.print_info: Creation complete after 0s [id=381879146457820641]
```
If you navigate straight away to the presented Indyscan URL, you might get see an error - give it a minute
till all services get fully up and running. 

## Security Warning
Beware that by default 
- Indyscan UI (port 3707) and API (port 3708) are exposed to the internet
- Indy pool is exposed to the internet (ports 9701 - 9708)
- Indy pool is docker image provided by IndySDK - with all its publicly know DIDs and seeds.
You can tweak this easily in `security_groups.tf` though. 
