# Terraform - vSphere

This folder contains Infrastructure as Code (IaC) automation for VMware vSphere/ESXi environments using Terraform.

## Purpose

- Automate provisioning of VMs, networks, datastores, and more.
- Integrate with the FastAPI backend for on-demand infrastructure requests.
- Enable end-to-end automation from the frontend (Dashboard - vSphere) through the backend to the infrastructure layer.

## Structure

- `modules/` — Reusable Terraform modules for VMs, networks, etc.
- `environments/` — Environment-specific configurations (dev, prod).
- `scripts/` — Helper scripts for automation and CI/CD.
- `main.tf`, `variables.tf`, `outputs.tf` — Root Terraform configuration files.

## Integration

- The FastAPI backend will trigger Terraform runs for provisioning requests.
- The frontend will interact with the backend to submit and track infrastructure requests.

---

> **Note:**
> Ensure you have access to the vSphere API and the necessary credentials to use these modules.
