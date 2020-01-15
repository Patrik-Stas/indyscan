variable "region" {
  default="us-west-2"
}

variable "availability-zone" {
  default = "us-west-2a"
}

variable "profile" {
  default = "default"
}

variable "keypair-name" {
  default = "how-you-marked-used-keypair-in-aws"
}

variable "private-key-path" {
  default = "./private-key"
}

variable "network-name" {
  default = "indyscan-awspool"
}

//variable "network-address" { // TODO: Add this as option (to specify DNS resolvable address)
//  default = ""
//}


variable "ubuntu-ami" {
  default = "ami-08692d171e3cf02d6" // Ubuntu Server 16.04 LTS (HVM), SSD Volume Type; TODO: Which datacentre?
}

variable "ec2size" {
  default = "t2.small"
}
