resource "aws_security_group" "Indyscan_IndyPool_Client" {

  name = "Indyscan_IndyPool_Client"
  description = "Terraform Managed, IndyscanIndypool client"

  ingress {
    from_port = 9702
    to_port = 9702
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 1, Client"
  }

  ingress {
    from_port = 9704
    to_port = 9704
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 2, Client"
  }

  ingress {
    from_port = 9706
    to_port = 9706
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 3, Client"
  }

  ingress {
    from_port = 9708
    to_port = 9708
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 4, Client"
  }
}

resource "aws_security_group" "Indyscan_IndyPool_Node" {

  name = "Indyscan_IndyPool_Node"
  description = "Terraform Managed, IndyscanIndypool Node2Node"

  ingress {
    from_port = 9701
    to_port = 9701
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 1, Node2Node"
  }

  ingress {
    from_port = 9703
    to_port = 9703
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 2, Node2Node"
  }

  ingress {
    from_port = 9705
    to_port = 9705
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 3, Node2Node"
  }

  ingress {
    from_port = 9707
    to_port = 9707
    protocol = "TCP"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    description = "Indy Pool Node 4, Node2Node"
  }
}

resource "aws_security_group" "Indyscan_Services" {

  name = "Indyscan_Services"
  description = "Terraform Managed, Indyscan services"

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
// Enable if you want
//  ingress {
//    from_port = 9200
//    to_port = 9200
//    protocol = "TCP"
//    cidr_blocks = [
//      "0.0.0.0/0"
//    ]
//    description = "Indyscan Elasticsearch"
//  }
//
//  ingress {
//    from_port = 5601
//    to_port = 5601
//    protocol = "TCP"
//    cidr_blocks = [
//      "0.0.0.0/0"
//    ]
//    description = "Indyscan Kibana"
//  }
}

resource "aws_security_group" "Indyscan_General" {
  name = "Indyscan_General"
  description = "Terraform Managed, Indyscan general"

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  ingress {
    from_port = 22
    to_port = 22
    protocol = "TCP"
    cidr_blocks = [
      var.ssh_cidr_block
    ]
    description = "SSH Access"
  }
}

