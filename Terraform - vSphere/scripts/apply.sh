#!/bin/bash
set -e

echo "Initializing Terraform..."
terraform init

echo "Planning..."
terraform plan -out=tfplan

echo "Applying..."
terraform apply -auto-approve tfplan 