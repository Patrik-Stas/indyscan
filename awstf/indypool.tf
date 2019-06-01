resource "aws_instance" "indypool" {
  ami = "ami-08692d171e3cf02d6"
  // Ubuntu Server 16.04 LTS (HVM), SSD Volume Type
  instance_type = "t2.medium"
  key_name = "${var.keypair-name}"
  availability_zone = "${var.availability-zone}"

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
      "chmod +x $HOME/scripts-docker/*.sh",
      "$HOME/scripts-docker/setup.sh",
      "rm -r \"$HOME/scripts-docker\"",
    ]
  }
}


resource "null_resource" "indypool-provision-pool" {

  connection {
    type = "ssh"
    host = "${aws_instance.indypool.public_ip}"
    user = "ubuntu"
    private_key = "${file(var.private-key-path)}"
  }

  provisioner "remote-exec" {
    inline = [
      "set -e",
      "curl https://raw.githubusercontent.com/hyperledger/indy-sdk/v1.8.3/ci/indy-pool.dockerfile > indy-pool.dockerfile",
      "docker build --build-arg pool_ip=${aws_instance.indypool.public_ip} -f indy-pool.dockerfile -t indy_pool .",
      "docker run --network host -itd --name indypool indy_pool",
      "docker exec indypool cat /var/lib/indy/sandbox/pool_transactions_genesis > genesis.txn"
    ]
  }

  provisioner "local-exec" {
    command = "scp -o \"StrictHostKeyChecking no\" -i ${var.private-key-path} ${path.module}/tmp/genesis.txn ubuntu@${aws_instance.indypool.public_ip}:~/genesis.txn"
  }
}