#!/bin/bash
set -e

echo "Initializing Terraform..."
terraform init

echo "Planning..."
terraform plan 