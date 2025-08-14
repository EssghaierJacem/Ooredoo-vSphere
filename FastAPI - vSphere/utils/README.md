# Utils Directory

This directory contains utility scripts and tools for development, debugging, and maintenance of the vSphere monitoring project.

## Available Scripts

### `network_discovery.py`

Lists all networks in vCenter with their names, types, MOIDs, and VLAN information.

**Usage:**

```bash
cd "FastAPI - vSphere"
python utils/network_discovery.py
```

**Purpose:** Development tool to discover available networks for VM provisioning.

## Note

These scripts are development/debugging tools and are not part of the main application. They should not be deployed to production.
