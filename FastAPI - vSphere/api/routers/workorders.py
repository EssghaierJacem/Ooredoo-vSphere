from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from models.workorder import WorkOrder
from datetime import datetime
import os
import subprocess
import tempfile
import shutil
import json
from services.vsphere.cluster_info import get_resource_pools_info
from services.vsphere.connection import get_folders_info, get_datacenters_info

router = APIRouter(
    prefix="/workorders",
    tags=["WorkOrders"]
)

@router.post("/")
def create_workorder(
    workorder: dict,
    db: Session = Depends(get_db)
):
    print("Received workorder:", workorder)  
    try:
        requested_at = workorder.get("requested_at")
        if requested_at:
            try:
                created_at = datetime.fromisoformat(requested_at)
            except Exception:
                created_at = datetime.utcnow()
        else:
            created_at = datetime.utcnow()
        disk_value = workorder["resources"].get("disk") if "resources" in workorder else None
        disks_value = workorder.get("disks", None)
        if not disks_value and disk_value:
            disks_value = [{"size": disk_value, "provisioning": "thin"}]
        nics_value = workorder.get("nics", None)
        network_id_value = workorder.get("network_id", None)
        if not nics_value and network_id_value:
            nics_value = [{"network_id": network_id_value}]
        new_order = WorkOrder(
            name=workorder["general"]["name"],
            os=workorder["general"]["os"],
            host_version=workorder["general"]["hostVersion"],
            cpu=workorder["resources"]["cpu"],
            ram=workorder["resources"]["ram"],
            disk=disk_value,
            status="pending",
            created_at=created_at,
            host_id=workorder.get("host_id", None),
            vm_id=workorder.get("vm_id", None),
            datastore_id=workorder.get("datastore_id", None),
            disks=disks_value,
            nics=nics_value,
            resource_pool_id=workorder.get("resource_pool_id", None),
            ip_pool_id=workorder.get("ip_pool_id", None),
            template_id=workorder.get("template_id", None),
            hostname=workorder.get("hostname", None),
            ip=workorder.get("ip", None),
            netmask=workorder.get("netmask", None),
            gateway=workorder.get("gateway", None),
            domain=workorder.get("domain", None),
            hardware_version=workorder.get("hardware_version", None),
            scsi_controller_type=workorder.get("scsi_controller_type", None),
            folder_id=workorder.get("folder_id", None),
            network_id=workorder.get("network_id", None),
            datacenter_name=workorder.get("datacenter_name", "Ooredoo - Datacenter"),
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return {
            "id": new_order.id,
            "name": new_order.name,
            "os": new_order.os,
            "host_version": new_order.host_version,
            "cpu": new_order.cpu,
            "ram": new_order.ram,
            "disk": new_order.disk,
            "status": new_order.status,
            "created_at": new_order.created_at.isoformat(),
            "host_id": new_order.host_id,
            "vm_id": new_order.vm_id,
            "datastore_id": new_order.datastore_id,
            "disks": new_order.disks,
            "nics": new_order.nics,
            "resource_pool_id": new_order.resource_pool_id,
            "ip_pool_id": new_order.ip_pool_id,
            "datacenter_name": new_order.datacenter_name,
        }
    except Exception as e:
        import traceback
        print('CREATE WORKORDER ERROR:', e)
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_workorders(db: Session = Depends(get_db), limit: int = 5):
    try:
        orders = db.query(WorkOrder).order_by(WorkOrder.created_at.desc()).limit(limit).all()
        return [
            {
                "id": o.id,
                "name": o.name,
                "os": o.os,
                "host_version": o.host_version,
                "cpu": o.cpu,
                "ram": o.ram,
                "disk": o.disk,
                "status": o.status,
                "created_at": o.created_at.isoformat(),
                "host_id": o.host_id,
                "vm_id": o.vm_id,
                "datastore_id": o.datastore_id,
                "disks": o.disks,
                "nics": o.nics,
                "resource_pool_id": o.resource_pool_id,
                "ip_pool_id": o.ip_pool_id,
                "template_id": o.template_id,
                "hostname": o.hostname,
                "ip": o.ip,
                "netmask": o.netmask,
                "gateway": o.gateway,
                "domain": o.domain,
                "hardware_version": o.hardware_version,
                "scsi_controller_type": o.scsi_controller_type,
                "folder_id": o.folder_id,
                "network_id": o.network_id,
                "datacenter_name": o.datacenter_name,
            }
            for o in orders
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{workorder_id}")
def update_workorder(
    workorder_id: int,
    workorder_update: dict,
    db: Session = Depends(get_db)
):
    order = db.query(WorkOrder).filter(WorkOrder.id == workorder_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    # Update all fields, including new ones
    for key, value in workorder_update.items():
        if hasattr(order, key):
            setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return {
        "id": order.id,
        "name": order.name,
        "os": order.os,
        "host_version": order.host_version,
        "cpu": order.cpu,
        "ram": order.ram,
        "disk": order.disk,
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "host_id": order.host_id,
        "vm_id": order.vm_id,
        "datastore_id": order.datastore_id,
        "disks": order.disks,
        "nics": order.nics,
        "resource_pool_id": order.resource_pool_id,
        "ip_pool_id": order.ip_pool_id,
        "template_id": order.template_id,
        "hostname": order.hostname,
        "ip": order.ip,
        "netmask": order.netmask,
        "gateway": order.gateway,
        "domain": order.domain,
        "hardware_version": order.hardware_version,
        "scsi_controller_type": order.scsi_controller_type,
        "folder_id": order.folder_id,
        "network_id": order.network_id,
        "last_execution_log": order.last_execution_log,
        "datacenter_name": order.datacenter_name,
    }

@router.post("/{workorder_id}/approve")
def approve_workorder(
    workorder_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(WorkOrder).filter(WorkOrder.id == workorder_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    order.status = "approved"
    db.commit()
    db.refresh(order)
    return {"message": "WorkOrder approved", "id": order.id, "status": order.status}

@router.post("/{workorder_id}/execute")
def execute_workorder(
    workorder_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(WorkOrder).filter(WorkOrder.id == workorder_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    if not order.status or order.status.lower() != "approved":
        raise HTTPException(status_code=400, detail="WorkOrder must be approved before execution")

    nics_value = order.nics
    if not nics_value and order.network_name:
        nics_value = [{"network_name": order.network_name, "ip": getattr(order, "ip", "")}]
    if not nics_value:
        nics_value = [{"network_name": "VM Network", "ip": getattr(order, "ip", "")}]

    tfvars_content = f"""
    vm_name = \"{order.name}\"\n"""
    datacenter_name = (getattr(order, 'datacenter_name', None) or 'Datacenter').strip()
    tfvars_content += f'datacenter_name = "{datacenter_name}"\n'
    if order.template_id:
        tfvars_content += f'template_id = "{order.template_id}"\n'
    else:
        tfvars_content += f'os = "{order.os}"\n'
        if order.hardware_version:
            tfvars_content += f'hardware_version = "{order.hardware_version}"\n'
        if order.scsi_controller_type:
            tfvars_content += f'scsi_controller_type = "{order.scsi_controller_type}"\n'
        if nics_value:
            tfvars_content += f'nics = {json.dumps(nics_value)}\n'
    tfvars_content += f'cpu = {order.cpu}\n'
    tfvars_content += f'ram = {order.ram}\n'
    if order.host_id:
        tfvars_content += f'host_system_id = "{order.host_id}"\n'
    if order.resource_pool_id:
        tfvars_content += f'resource_pool_id = "{order.resource_pool_id}"\n'
    if order.ip_pool_id:
        tfvars_content += f'ip_pool_id = "{order.ip_pool_id}"\n'
    if order.folder_id:
        tfvars_content += f'folder = "{order.folder_id}"\n'
    if order.datastore_id:
        tfvars_content += f'datastore_id = "{order.datastore_id}"\n'
    if order.hostname:
        tfvars_content += f'hostname = "{order.hostname}"\n'
    if order.ip:
        tfvars_content += f'ip = "{order.ip}"\n'
    if order.netmask:
        tfvars_content += f'netmask = "{order.netmask}"\n'
    if order.gateway:
        tfvars_content += f'gateway = "{order.gateway}"\n'
    if order.domain:
        tfvars_content += f'domain = "{order.domain}"\n'
    log_lines = ["--- TFVARS CONTENT ---", tfvars_content]

    with tempfile.NamedTemporaryFile(mode="w", suffix=".tfvars", delete=False) as tfvars_file:
        tfvars_file.write(tfvars_content)
        tfvars_path = tfvars_file.name

    terraform_bin = os.environ.get('TERRAFORM_PATH') or shutil.which('terraform') or r'D:\terraform\terraform.exe'
    if not terraform_bin:
        raise HTTPException(status_code=500, detail="Terraform binary not found. Set TERRAFORM_PATH env variable or add terraform to PATH.")

    try:
        tf_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../Terraform - vSphere'))
        env = os.environ.copy()
        env["TF_VAR_vsphere_user"] = "X"  
        env["TF_VAR_vsphere_password"] = "X"     
        env["TF_VAR_vsphere_server"] = "X"        
        result_init = subprocess.run([
            terraform_bin, "init"
        ], cwd=tf_dir, capture_output=True, text=True, env=env)
        log_lines.append("--- TERRAFORM INIT STDOUT ---")
        log_lines.append(result_init.stdout)
        log_lines.append("--- TERRAFORM INIT STDERR ---")
        log_lines.append(result_init.stderr)
        if result_init.returncode != 0:
            order.status = "failed"
            order.last_execution_log = "\n".join(log_lines)
            db.commit()
            db.refresh(order)
            raise Exception(f"Terraform init failed: {result_init.stderr}")
        result_apply = subprocess.run([
            terraform_bin, "apply", "-auto-approve", f"-var-file={tfvars_path}"
        ], cwd=tf_dir, capture_output=True, text=True, env=env)
        log_lines.append("--- TERRAFORM APPLY STDOUT ---")
        log_lines.append(result_apply.stdout)
        log_lines.append("--- TERRAFORM APPLY STDERR ---")
        log_lines.append(result_apply.stderr)
        if result_apply.returncode != 0:
            order.status = "failed"
            order.last_execution_log = "\n".join(log_lines)
            db.commit()
            db.refresh(order)
            raise Exception(f"Terraform apply failed: {result_apply.stderr}")
        order.status = "executed"
        order.last_execution_log = "\n".join(log_lines)
        db.commit()
        db.refresh(order)
        return {"message": "WorkOrder executed and VM provisioned", "output": result_apply.stdout, "id": order.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(tfvars_path)

@router.delete("/{workorder_id}")
def delete_workorder(
    workorder_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(WorkOrder).filter(WorkOrder.id == workorder_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    db.delete(order)
    db.commit()
    return {"message": "WorkOrder deleted", "id": workorder_id}

@router.get("/{workorder_id}/log")
def get_workorder_log(workorder_id: int, db: Session = Depends(get_db)):
    order = db.query(WorkOrder).filter(WorkOrder.id == workorder_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    return {"log": order.last_execution_log or ""}

@router.get("/{workorder_id}/status")
def get_workorder_status(workorder_id: int, db: Session = Depends(get_db)):
    order = db.query(WorkOrder).filter(WorkOrder.id == workorder_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    return {"status": order.status} 

@router.get("/resource-pools")
def list_resource_pools():
    return get_resource_pools_info()

@router.get("/ip-pools")
def list_ip_pools():
    return [
        {"id": "ippool-1", "name": "Office LAN", "description": "192.168.1.0/24"},
        {"id": "ippool-2", "name": "DMZ", "description": "10.0.0.0/24"},
    ] 

@router.get("/folders")
def list_folders():
    return get_folders_info() 

@router.get("/datacenters")
def list_datacenters():
    try:
        return get_datacenters_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 