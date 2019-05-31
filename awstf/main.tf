terraform {
  required_version = "~> 0.11.8"
}

provider "aws" {
  version = "~> 1.40.0"
  region = "${var.region}"
  profile = "${var.profile}"
}


resource "aws_instance" "indy-pool" {
  ami = "ami-08692d171e3cf02d6" // Ubuntu Server 16.04 LTS (HVM), SSD Volume Type
  instance_type = "t2.medium"
  key_name = "${var.keypair-name}"
  availability_zone = "${var.availability-zone}"

  connection {
    type = "ssh"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "file" {
    source      = "${path.module}/scripts"
    destination = "$HOME"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x $HOME/scripts/*.sh",
      "$HOME/scripts/setup.sh",
      "rm -r \"$HOME/scripts\"",
    ]
  }
}


resource "null_resource" "provision" {
  depends_on = ["aws_instance.indy-pool"]

  connection {
    type = "ssh"
    host = "${aws_instance.indy-pool.public_ip}"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "remote-exec" {
    inline = [
      "set -e",
      "curl https://raw.githubusercontent.com/hyperledger/indy-sdk/v1.8.3/ci/indy-pool.dockerfile > indy-pool.dockerfile",
      "docker build --build-arg pool_ip=${aws_instance.indy-pool.public_ip} -f indy-pool.dockerfile -t indy_pool .",
      "docker run --network host -itd --name indypool indy_pool",
      "docker exec indypool cat /var/lib/indy/sandbox/pool_transactions_genesis > genesis.txn"
    ]
  }

  provisioner "local-exec" {
    command = "scp -i ${var.private-key-path} ubuntu@${aws_instance.indy-pool.public_ip}:~/genesis.txn ./tmp"
  }
}

//resource "aws_instance" "indyscan-machine" {
//  ami = "ami-08692d171e3cf02d6"
//  // Ubuntu Server 16.04 LTS (HVM), SSD Volume Type
//  instance_type = "t2.medium"
//  key_name = "${var.private-key-path}"
//  availability_zone = "${var.availability-zone}"
//
//  connection {
//    type = "ssh"
//    user = "ubuntu"
//    private_key = "${file(var.private-key-path)}"
//  }
//
//  provisioner "file" {
//    source      = "${path.module}/scripts"
//    destination = "$HOME"
//  }
//
//  provisioner "remote-exec" {
//    inline = [
//      "chmod +x $HOME/scripts/*.sh",
//      "$HOME/scripts/setup.sh",
//      "rm -r \"$HOME/scripts\""
//    ]
//  }
//}

//resource "null_resource" "download-indyscan" {
//  # So we just choose the first in this case
//  connection {
//    host = "${element(aws_instance.indyscan-machine.*.public_ip, 0)}"
//    type = "ssh"
//    user = "ubuntu"
//    private_key = "${file(var.private-key-path)}"
//  }
//
//  provisioner "file" {
//    source = "${path.module}/server"
//    destination = "$HOME"
//  }
//
//  provisioner "remote-exec" {
//
//  }
//}
