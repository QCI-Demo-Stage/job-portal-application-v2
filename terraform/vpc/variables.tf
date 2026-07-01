variable "vpc_cidr_block" {
  type        = string
  description = "IPv4 CIDR block for the staging VPC."
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones in which to place subnets (order aligns with CIDR list indices)."
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets (one per AZ index)."
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private subnets (one per AZ index)."
}

variable "common_tags" {
  type        = map(string)
  description = "Tags applied to all supported resources (merged with resource-specific tags)."
  default     = {}
}

variable "name_prefix" {
  type        = string
  description = "Prefix for Name tags and resource naming (for example job-portal-staging)."
  default     = "staging"
}
