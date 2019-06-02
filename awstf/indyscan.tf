
variable "indyscan_webapp_cidr" {
  description = "Indyscan CIDR"
  default = "0.0.0.0/0"
}

resource "aws_security_group" "indyscan" {
  name = "indyscan-tf"
  description = "Access to indyscan-webapp"
}

resource "aws_security_group_rule" "indyscan-outbound" {
  type = "egress"
  from_port = 0
  to_port = 0
  protocol = "-1"
  cidr_blocks = [
    "0.0.0.0/0"
  ]
  ipv6_cidr_blocks = [
    "::/0"
  ]
  security_group_id = "${aws_security_group.indyscan.id}"
}

resource "aws_security_group_rule" "indyscan-ssh" {
  type = "ingress"
  from_port = 22
  to_port = 22
  protocol = "tcp"
  cidr_blocks = [
    "0.0.0.0/0"
  ]
  ipv6_cidr_blocks = [
    "::/0"
  ]
  security_group_id = "${aws_security_group.indyscan.id}"
}

resource "aws_security_group_rule" "indyscan-webapp" {
  type = "ingress"
  from_port = 5050
  to_port = 5050
  protocol = "tcp"
  cidr_blocks = [
    "${var.indyscan_webapp_cidr}"
  ]
  security_group_id = "${aws_security_group.indyscan.id}"
}

resource "aws_instance" "indyscan" {
  ami = "ami-08692d171e3cf02d6" // Ubuntu Server 16.04 LTS (HVM), SSD Volume Type
  instance_type = "t2.small"
  key_name = "${var.keypair-name}"
  availability_zone = "${var.availability-zone}"

  vpc_security_group_ids = [
    "${aws_security_group.indyscan.id}",
  ]

  connection {
    type = "ssh"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "file" {
    source = "${path.module}/scripts-docker"
    destination = "$HOME"
  }

  provisioner "file" {
    source = "${path.module}/scripts-indyscan"
    destination = "$HOME"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x $HOME/scripts-docker/*.sh",
      "$HOME/scripts-docker/setup.sh",
      "rm -r \"$HOME/scripts-docker\"",
    ]
  }
}

resource "null_resource" "indyscan-provision-genesis-file" {

  depends_on = ["null_resource.indypool-provision"]
  connection {
    host = "${aws_instance.indyscan.public_ip}"
    type = "ssh"
    user = "ubuntu"
  }

  provisioner "remote-exec" {
    inline = [
      "mkdir -p $HOME/.indy_client/pool/AWS_POOL"
    ]
  }

  provisioner "file" {
    source = "${path.module}/tmp/genesis.txn"
    destination = "$HOME/.indy_client/pool/AWS_POOL/AWS_POOL.txn"
  }
}

resource "null_resource" "indyscan-provision-containers" {

  depends_on = ["null_resource.indyscan-provision-genesis-file"]

  connection {
    host = "${aws_instance.indyscan.public_ip}"
    type = "ssh"
    user = "ubuntu"
  }

  provisioner "remote-exec" {
    inline = [
      "cd \"$HOME/scripts-indyscan\"",
      "export INDY_NETWORKS=AWS_POOL",
      "export SCAN_MODE=FAST",
      "docker-compose down",
      "docker-compose up -d"
    ]
  }
}


resource "null_resource" "print-info" {

  triggers {
    key = "${uuid()}"
  }

  depends_on = [
    "null_resource.indyscan-provision-containers",
    "null_resource.indyscan-provision-genesis-file",
    "null_resource.provision-genesis-locally"]

  provisioner "local-exec" {
    command = "./print-info.sh ${var.local-pool-name} http://${aws_instance.indyscan.public_ip}:5050"
  }

}