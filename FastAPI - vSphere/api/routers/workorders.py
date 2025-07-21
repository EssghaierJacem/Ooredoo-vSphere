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
        new_order = WorkOrder(
            name=workorder["general"]["name"],
            os=workorder["general"]["os"],
            host_version=workorder["general"]["hostVersion"],
            cpu=workorder["resources"]["cpu"],
            ram=workorder["resources"]["ram"],
            disk=workorder["resources"]["disk"],
            status="pending",
            created_at=created_at,
            host_id=workorder.get("host_id"),
            vm_id=workorder.get("vm_id"),
            datastore_id=workorder.get("datastore_id"),
            disks=workorder.get("disks"),
            nics=workorder.get("nics"),
            resource_pool_id=workorder.get("resource_pool_id"),
            ip_pool_id=workorder.get("ip_pool_id"),
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
        }
    except Exception as e:
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

    # Prepare variables for Terraform
    tfvars_content = f"""
    vm_name = \"{order.name}\"
    os = \"{order.os}\"
    cpu = {order.cpu}
    ram = {order.ram}
    disk = {order.disk}
    """
    log_lines = ["--- TFVARS CONTENT ---", tfvars_content]
    # Add disks and nics if present
    disks = order.disks or []
    for i, disk in enumerate(disks):
        if "label" not in disk:
            disk["label"] = f"disk{i+1}"
    if disks:
        tfvars_content += f'disks = {json.dumps(disks)}\n'
    if order.nics:
        tfvars_content += f'nics = {json.dumps(order.nics)}\n'
    if order.host_id:
        tfvars_content += f'host_system_id = "{order.host_id}"\n'
    if order.resource_pool_id:
        tfvars_content += f'resource_pool_id = "{order.resource_pool_id}"\n'
    if order.ip_pool_id:
        tfvars_content += f'ip_pool_id = "{order.ip_pool_id}"\n'
    log_lines.append("--- END TFVARS ---")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".tfvars", delete=False) as tfvars_file:
        tfvars_file.write(tfvars_content)
        tfvars_path = tfvars_file.name

    terraform_bin = os.environ.get('TERRAFORM_PATH') or shutil.which('terraform') or r'D:\terraform\terraform.exe'
    if not terraform_bin:
        raise HTTPException(status_code=500, detail="Terraform binary not found. Set TERRAFORM_PATH env variable or add terraform to PATH.")

    try:
        tf_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../Terraform - vSphere'))
        env = os.environ.copy()
        env["TF_VAR_vsphere_user"] = "XS"  
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