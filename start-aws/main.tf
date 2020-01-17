terraform {
  required_version = "~> 0.12"
}

provider "null" {
  version = "~> 2.1"
}

provider "aws" {
  version = "~> 2.8"
  region = var.region
  profile = var.profile
}
