// We could also probably use this and refer to its ID in aws_route53_zone.indypool
// resource "aws_default_vpc" "default" {}
// https://www.terraform.io/docs/providers/aws/r/default_vpc.html
// Seems to risky to touch someone's VPC at all though. Wont' do this.
// You guys will have to supply the VPC ID manually via the variable

resource "aws_route53_zone" "indypool" {
  count = (var.hosted_zone_name != "" && var.dns_hostname != "") ? 1 : 0
  name = var.hosted_zone_name

  vpc {
    vpc_id = var.vpc_id
  }
}

resource "aws_route53_record" "www" {
  count = (var.hosted_zone_name != "" && var.dns_hostname != "") ? 1 : 0

  zone_id = aws_route53_zone.indypool.0.zone_id
  name    = var.dns_hostname
  type    = "A"
  ttl     = "300"
  records = [aws_instance.indyscan.private_ip]
}
