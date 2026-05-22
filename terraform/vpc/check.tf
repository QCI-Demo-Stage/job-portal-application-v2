check "subnet_and_az_counts" {
  assert {
    condition = (
      length(var.public_subnet_cidrs) == length(var.availability_zones) &&
      length(var.private_subnet_cidrs) == length(var.availability_zones)
    )
    error_message = "public_subnet_cidrs, private_subnet_cidrs, and availability_zones must all have the same length."
  }
}
