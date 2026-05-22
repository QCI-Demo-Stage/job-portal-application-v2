output "vpc_id" {
  description = "ID of the staging VPC."
  value       = aws_vpc.this.id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway attached to the VPC."
  value       = aws_internet_gateway.this.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs (use for ECS load balancers, bastions, or NAT placement)."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (use for ECS task networking / services without public IPs)."
  value       = aws_subnet.private[*].id
}

output "public_route_table_id" {
  description = "Route table ID for public subnets."
  value       = aws_route_table.public.id
}

output "private_route_table_id" {
  description = "Route table ID for private subnets."
  value       = aws_route_table.private.id
}
