resource "aws_instance" "indyscan" {
  ami = "ami-08692d171e3cf02d6" // Ubuntu Server 16.04 LTS (HVM), SSD Volume Type
  instance_type = "t2.small"
  key_name = "${var.keypair-name}"
  availability_zone = "${var.availability-zone}"

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

resource "null_resource" "provision-indypool" {

  connection {
    type = "ssh"
    host = "${aws_instance.indyscan.public_ip}"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "file" {
    source = "${path.module}/../start"
    destination = "$HOME"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod -R +x **/*.sh **/**/*.sh",
      "(cd ~/start/indypool; docker-compose down)",
      "~/start/indypool/start.sh --address ${aws_instance.indyscan.public_ip} --version v1.8.3 --name '${var.network-name}'",
      "(cd ~/start/indyscan-daemon; docker-compose down)",
      "(cd ~/start/indyscan-webapp; docker-compose down)",
      "~/start/indyscan-daemon/start.sh --mode download --url-mongo mongodb://localhost:27999 --indy-networks '${var.network-name}' -d",
      "~/start/indyscan-webapp/start.sh --mode download --url-mongo mongodb://mongo.indynet:27017 --indy-networks '${var.network-name}' -d"
    ]
  }
}


resource "null_resource" "provision-genesis-locally" {
  depends_on = ["null_resource.provision-indypool"]

  provisioner "local-exec" {
    command = "mkdir -p ${path.module}/tmp; rm ${path.module}/tmp/genesis.txn || :"
  }

  provisioner "local-exec" {
    command = "scp -o \"StrictHostKeyChecking no\" -i ${var.private-key-path} ubuntu@${aws_instance.indyscan.public_ip}:~/.indy_client/pool/${var.network-name}/${var.network-name}.txn ${path.module}/tmp/${var.network-name}.txn"
  }

  provisioner "local-exec" {
    command = "export PROVISION_POOL_DIR=\"$HOME\"/.indy_client/pool/${var.network-name}; mkdir -p \"$PROVISION_POOL_DIR\" || :; cp ${path.module}/tmp/${var.network-name}.txn \"$PROVISION_POOL_DIR\"/${var.network-name}.txn || :;"
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
    "null_resource.provision-indypool",
    "null_resource.provision-genesis-locally"]

  provisioner "local-exec" {
    command = "./print-info.sh ${var.network-name} http://${aws_instance.indyscan.public_ip}:5050"
  }
}