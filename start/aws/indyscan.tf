resource "aws_instance" "indyscan" {
  ami = "ami-08692d171e3cf02d6" // Ubuntu Server 16.04 LTS (HVM), SSD Volume Type
  instance_type = "t2.micro"
  key_name = "${var.keypair-name}"
  availability_zone = "${var.availability-zone}"

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

  provisioner "file" {
    source = "${path.module}/scripts-indyscan"
    destination = "$HOME"
  }

  provisioner "remote-exec" {
    inline = [
      "set -x",
      "chmod +x $HOME/scripts-docker/*.sh",
      "$HOME/scripts-docker/setup.sh",
      "rm -r \"$HOME/scripts-docker\""
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

  provisioner "remote-exec" {
    inline = [
      "set -e",
      "curl https://raw.githubusercontent.com/hyperledger/indy-sdk/v1.8.3/ci/indy-pool.dockerfile > indy-pool.dockerfile",
      "docker build --build-arg pool_ip=${aws_instance.indyscan.public_ip} -f indy-pool.dockerfile -t indy_pool .",
      "docker kill $(docker ps -q) || :",
      "docker rm $(docker ps -a -q) || :",
      "docker run --network host -itd --name indypool indy_pool",
      "docker exec indypool cat /var/lib/indy/sandbox/pool_transactions_genesis > ~/genesis.txn"
    ]
  }
}


resource "null_resource" "provision-genesis-locally" {
  depends_on = ["null_resource.indypool-provision"]

  provisioner "local-exec" {
    command = "rm ${path.module}/tmp/genesis.txn || :"
  }

  provisioner "local-exec" {
    command = "scp -o \"StrictHostKeyChecking no\" -i ${var.private-key-path} ubuntu@${aws_instance.indyscan.public_ip}:~/genesis.txn ${path.module}/tmp/genesis.txn"
  }

  provisioner "local-exec" {
    command = "export PROVISION_POOL_DIR=\"$HOME\"/.indy_client/pool/${var.local-pool-name}; mkdir -p \"$PROVISION_POOL_DIR\" || :; cp ${path.module}/tmp/genesis.txn \"$PROVISION_POOL_DIR\"/${var.local-pool-name}.txn || :;"
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