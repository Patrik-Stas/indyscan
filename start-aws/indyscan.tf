resource "aws_security_group" "indyscan" {

  name = "IndyscanIndypool"
  description = "Traffic for IndyPool and IndyScan"

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "SSH Access"
  }

  ingress {
    from_port = 9701
    to_port = 9708
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool in"
  }

  ingress {
    from_port = 3707
    to_port = 3707
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indyscan UI"
  }

  ingress {
    from_port = 3708
    to_port = 3708
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indyscan API"
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }
}

resource "aws_instance" "indyscan" {
  ami = "${var.ubuntu-ami}"
  instance_type = "${var.ec2size}"
  availability_zone = "${var.availability-zone}"
  key_name = "${var.keypair-name}"
  security_groups = [
    "${aws_security_group.indyscan.name}"
  ]

  root_block_device {
    volume_size = "20"
  }

  tags {
    Name = "indyscan-services"
  }

  connection {
    type = "ssh"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "file" {
    source = "${path.module}/scripts-docker"
    destination = "$HOME"
  }

  provisioner "remote-exec" {
    inline = [
      "set -x",
      "chmod +x $HOME/scripts-docker/*.sh",
      "$HOME/scripts-docker/setup.sh",
      "rm -r \"$HOME/scripts-docker\"",
    ]
  }
}

resource "null_resource" "provision-indyscan-scripts" {

  connection {
    type = "ssh"
    host = "${aws_instance.indyscan.public_ip}"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  triggers {
    key = "${uuid()}"
  }

  provisioner "file" {
    source = "${path.module}/../start"
    destination = "$HOME/indyscan"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod -R +x **/*.sh **/**/*.sh */**/**/*.sh",
    ]
  }
}

resource "null_resource" "build-indypool-image" {

  depends_on = [
    "null_resource.provision-indyscan-scripts"
  ]

  connection {
    type = "ssh"
    host = "${aws_instance.indyscan.public_ip}"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "remote-exec" {
    inline = [
      "set -x",
      "export POOL_ADDRESS='${aws_instance.indyscan.public_ip}'",
      "export INDYPOOL_IMAGE_TAG='indypool-${aws_instance.indyscan.public_ip}:latest'",
      "yes | ~/indyscan/start/indypool/build-pool.sh",
      "rm -r ~/.indy_client/pool/INDYPOOL_INDYSCAN ||:",
      "docker run \"$INDYPOOL_IMAGE_TAG\" cat /var/lib/indy/sandbox/pool_transactions_genesis > ~/indyscan/start/app-config-daemon/genesis/INDYPOOL_INDYSCAN.txn"
    ]
  }
}

resource "null_resource" "restart" {

  depends_on = [
    "null_resource.build-indypool-image"
  ]

  connection {
    type = "ssh"
    host = "${aws_instance.indyscan.public_ip}"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "remote-exec" {

    inline = [
      "cd ~/indyscan/start/indypool; docker-compose up -d",
      "echo 'Started Indyscan docker-compose. Will watch its logs for 10 seconds.'",
      "cd ~/indyscan/start/indypool; timeout 10s docker-compose logs -f"
    ]
  }
}

//resource "null_resource" "reset-pool" {
//  inline = [
//    "echo 'Completely turning around Indyscan!'",
//    "cd ~/indyscan/start/indypool; docker-compose down",
//    "alias kill-all-docker-containers='docker rm -f $(docker ps -qa)'",
//    "docker volume --prune --force",
//  ]
//}


resource "null_resource" "provision-genesis-locally" {

  depends_on = [
    "null_resource.build-indypool-image"
  ]

  provisioner "local-exec" {
    command = "mkdir -p ${path.module}/tmp; rm ${path.module}/tmp/genesis.txn || :"
  }

  provisioner "local-exec" {
    command = "scp -o \"StrictHostKeyChecking no\" -i ${var.private-key-path} ubuntu@${aws_instance.indyscan.public_ip}:~/indyscan/start/app-config-daemon/genesis/INDYPOOL_INDYSCAN.txn ${path.module}/tmp/${var.network-name}.txn"
  }

  provisioner "local-exec" {
    command = "export PROVISION_POOL_DIR=\"$HOME/.indy_client/pool/${var.network-name}\"; mkdir -p \"$PROVISION_POOL_DIR\" || :; cp ${path.module}/tmp/${var.network-name}.txn \"$PROVISION_POOL_DIR/${var.network-name}.txn\" || :;"
  }

  provisioner "local-exec" {
    command = "ls -lah \"$HOME\"/.indy_client/pool/${var.network-name}/${var.network-name}.txn"
  }
}

resource "null_resource" "print-info" {

  triggers {
    key = "${uuid()}"
  }

  depends_on = [
    "null_resource.build-indypool-image",
    "null_resource.restart",
    "null_resource.provision-genesis-locally"
  ]

  provisioner "local-exec" {
    command = "./print-info.sh ${var.network-name} http://${aws_instance.indyscan.public_ip}:3707"
  }
}
