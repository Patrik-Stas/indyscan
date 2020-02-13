variable vpc_id {
  description = "VPC where you want to build resources."
}

variable "region" {
  default="eu-west-1"
  description = "AWS datacentre region. The default one is Ireland."
}

variable "availability_zone" {
  default = "eu-west-1a"
  description = "Availability zone within the selected region."
}

variable "profile" {
  default = "default"
  description = "If you are using multiple accounts on your machine. You can specify some of the profiles you have defined in ~/.aws/credentials"
}

variable "private_key_path" {
  description = "Path to private key used for connecting to created EC2 resources."
}

variable "keypair_name" {
  description = "Name of keypair in AWS, this will be used to secure created EC2 instances."
}

variable "local_network_name" {
  default = "indyscan-aws"
  description = "Name given to the created ledger when connecting from your host. By default will created network ~/.indy-client/pools/indyscan-aws"
}

variable "ubuntu_ami" {
  default = "ami-03ef731cc103c9f09" // Ubuntu Server 16.04 LTS (HVM) in Ireland region
  description = "Base image, expected to be Ubuntu Server 16.04 LTS. Beware if you change region, you have to update AMI because they differ across regions."
}

variable "ec2_size" {
  default = "t3a.medium"
  description = "Size of created EC2 instance. t3a.medium will cost you $25/month if you keep it running 24/7."
}

variable "ec2_tag" {
  default = "IndyscanIndypool"
  description = "Given name for the created EC2 instance."
}

variable "hosted_zone_name" {
  default = ""
  description = "(Optional) Only if you want to specify 'dns_hostname'. If you specify dns_hostname as 'dev.indypool.id', then this should be the postfix; ie. 'indypool.id'."
}

variable "dns_hostname" {
  default = ""
  description = "(Optional) Example: 'dev.indypool.id'. VPC-wide Indyscan DNS A record. This URL will be also used in genesis file for this IndyPool. If not specified, pool will be Internet-public, accesible via public IP. "
}

variable "trigger_reset_environment" {
  default = "1"
}

variable "ssh_cidr_block" {
  default = "0.0.0.0/0"
}

variable "custom_security_group_ids" {
  type    = list(string)
  default = []
}
