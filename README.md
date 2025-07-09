# 📊 vSphere Infrastructure Monitoring – Internship Project (Ooredoo)

This project provides a modular and scriptable monitoring tool for a VMware vSphere infrastructure (vCenter + ESXi hosts). It is part of an internship focused on automating infrastructure data collection and resource tracking.

---

## 🔧 Features

✅ Connects to vCenter Server using `pyVmomi`  
✅ Retrieves information on:

- Clusters (CPU/RAM/storage usage, status)
- Hosts (CPU/RAM usage, power & connection state)
- Datastores (total capacity and free space)

✅ Aggregates metrics by cluster  
✅ CLI output ready for dashboards and alerts  
✅ Modular Python design for extension into:

- PostgreSQL export
- Streamlit dashboards
- Work Order integration

---

## 📁 Project Structure

vsphere-monitoring/
├── main.py # Entry point
├── .env # Environment configuration (not committed)
├── requirements.txt # Python dependencies
├── vsphere_client/
│ ├── init.py
│ ├── connection.py # Handles vCenter connection
│ ├── cluster_info.py # Gathers cluster-level data
│ ├── host_info.py # Gathers host-level CPU/RAM usage
│ └── datastore_info.py # Gathers datastore capacity

---

## ⚙️ Requirements

- Python 3.8+
- Access to a running vCenter Server (vSphere 6.7+)
- Python packages:
  - `pyvmomi`
  - `python-dotenv`
  - `requests`

Install dependencies:

pip install -r requirements.txt
