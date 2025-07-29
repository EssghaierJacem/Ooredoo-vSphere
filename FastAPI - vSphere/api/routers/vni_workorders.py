from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from models.vni_workorder import VNIWorkOrder
from services.vsphere.vni_operations import VNIOperations
from datetime import datetime
import json

router = APIRouter(
    prefix="/vni-workorders",
    tags=["VNI WorkOrders"]
)

@router.post("/")
def create_vni_workorder(
    vni_workorder: dict,
    db: Session = Depends(get_db)
):
    """Create a new VNI workorder"""
    print("Received VNI workorder:", vni_workorder)
    try:
        # Parse dates
        requested_date = vni_workorder.get("requested_date")
        if requested_date:
            try:
                requested_date = datetime.fromisoformat(requested_date)
            except Exception:
                requested_date = datetime.utcnow()
        else:
            requested_date = datetime.utcnow()
            
        deadline = vni_workorder.get("deadline")
        if deadline:
            try:
                deadline = datetime.fromisoformat(deadline)
            except Exception:
                deadline = datetime.utcnow()
        else:
            deadline = datetime.utcnow()
        
        new_vni_order = VNIWorkOrder(
            owner=vni_workorder["owner"],
            requested_date=requested_date,
            requested_by=vni_workorder["requested_by"],
            virtual_machines=vni_workorder.get("virtual_machines", []),
            deadline=deadline,
            project=vni_workorder["project"],
            t0_gw=vni_workorder["t0_gw"],
            t1_gw=vni_workorder["t1_gw"],
            description=vni_workorder["description"],
            vni_name=vni_workorder["vni_name"],
            cidr=vni_workorder["cidr"],
            subnet_mask=vni_workorder["subnet_mask"],
            gateway=vni_workorder["gateway"],
            first_ip=vni_workorder["first_ip"],
            last_ip=vni_workorder["last_ip"],
            number_of_ips=vni_workorder["number_of_ips"],
            status="pending",
            notes=vni_workorder.get("notes"),
            priority=vni_workorder.get("priority", "normal"),
            assigned_to=vni_workorder.get("assigned_to")
        )
        
        db.add(new_vni_order)
        db.commit()
        db.refresh(new_vni_order)
        
        return {
            "id": new_vni_order.id,
            "owner": new_vni_order.owner,
            "requested_date": new_vni_order.requested_date.isoformat(),
            "requested_by": new_vni_order.requested_by,
            "virtual_machines": new_vni_order.virtual_machines,
            "deadline": new_vni_order.deadline.isoformat(),
            "project": new_vni_order.project,
            "t0_gw": new_vni_order.t0_gw,
            "t1_gw": new_vni_order.t1_gw,
            "description": new_vni_order.description,
            "vni_name": new_vni_order.vni_name,
            "cidr": new_vni_order.cidr,
            "subnet_mask": new_vni_order.subnet_mask,
            "gateway": new_vni_order.gateway,
            "first_ip": new_vni_order.first_ip,
            "last_ip": new_vni_order.last_ip,
            "number_of_ips": new_vni_order.number_of_ips,
            "status": new_vni_order.status,
            "created_at": new_vni_order.created_at.isoformat(),
            "notes": new_vni_order.notes,
            "priority": new_vni_order.priority,
            "assigned_to": new_vni_order.assigned_to
        }
    except Exception as e:
        import traceback
        print('CREATE VNI WORKORDER ERROR:', e)
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_vni_workorders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all VNI workorders with optional filtering"""
    try:
        query = db.query(VNIWorkOrder)
        
        if status:
            query = query.filter(VNIWorkOrder.status == status)
            
        vni_workorders = query.offset(skip).limit(limit).all()
        
        return [
            {
                "id": wo.id,
                "owner": wo.owner,
                "requested_date": wo.requested_date.isoformat(),
                "requested_by": wo.requested_by,
                "virtual_machines": wo.virtual_machines,
                "deadline": wo.deadline.isoformat(),
                "project": wo.project,
                "t0_gw": wo.t0_gw,
                "t1_gw": wo.t1_gw,
                "description": wo.description,
                "vni_name": wo.vni_name,
                "cidr": wo.cidr,
                "subnet_mask": wo.subnet_mask,
                "gateway": wo.gateway,
                "first_ip": wo.first_ip,
                "last_ip": wo.last_ip,
                "number_of_ips": wo.number_of_ips,
                "status": wo.status,
                "created_at": wo.created_at.isoformat(),
                "updated_at": wo.updated_at.isoformat(),
                "notes": wo.notes,
                "priority": wo.priority,
                "assigned_to": wo.assigned_to
            }
            for wo in vni_workorders
        ]
    except Exception as e:
        print('GET VNI WORKORDERS ERROR:', e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{vni_workorder_id}")
def get_vni_workorder(
    vni_workorder_id: int = Path(..., description="The ID of the VNI workorder"),
    db: Session = Depends(get_db)
):
    """Get a specific VNI workorder by ID"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
            
        return {
            "id": vni_workorder.id,
            "owner": vni_workorder.owner,
            "requested_date": vni_workorder.requested_date.isoformat(),
            "requested_by": vni_workorder.requested_by,
            "virtual_machines": vni_workorder.virtual_machines,
            "deadline": vni_workorder.deadline.isoformat(),
            "project": vni_workorder.project,
            "t0_gw": vni_workorder.t0_gw,
            "t1_gw": vni_workorder.t1_gw,
            "description": vni_workorder.description,
            "vni_name": vni_workorder.vni_name,
            "cidr": vni_workorder.cidr,
            "subnet_mask": vni_workorder.subnet_mask,
            "gateway": vni_workorder.gateway,
            "first_ip": vni_workorder.first_ip,
            "last_ip": vni_workorder.last_ip,
            "number_of_ips": vni_workorder.number_of_ips,
            "status": vni_workorder.status,
            "created_at": vni_workorder.created_at.isoformat(),
            "updated_at": vni_workorder.updated_at.isoformat(),
            "last_execution_log": vni_workorder.last_execution_log,
            "notes": vni_workorder.notes,
            "priority": vni_workorder.priority,
            "assigned_to": vni_workorder.assigned_to
        }
    except HTTPException:
        raise
    except Exception as e:
        print('GET VNI WORKORDER ERROR:', e)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{vni_workorder_id}")
def update_vni_workorder(
    vni_workorder_id: int,
    vni_workorder_update: dict,
    db: Session = Depends(get_db)
):
    """Update a VNI workorder"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        # Update fields
        for field, value in vni_workorder_update.items():
            if hasattr(vni_workorder, field):
                if field in ["requested_date", "deadline"] and value:
                    try:
                        value = datetime.fromisoformat(value)
                    except Exception:
                        value = datetime.utcnow()
                setattr(vni_workorder, field, value)
        
        vni_workorder.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(vni_workorder)
        
        return {
            "id": vni_workorder.id,
            "owner": vni_workorder.owner,
            "requested_date": vni_workorder.requested_date.isoformat(),
            "requested_by": vni_workorder.requested_by,
            "virtual_machines": vni_workorder.virtual_machines,
            "deadline": vni_workorder.deadline.isoformat(),
            "project": vni_workorder.project,
            "t0_gw": vni_workorder.t0_gw,
            "t1_gw": vni_workorder.t1_gw,
            "description": vni_workorder.description,
            "vni_name": vni_workorder.vni_name,
            "cidr": vni_workorder.cidr,
            "subnet_mask": vni_workorder.subnet_mask,
            "gateway": vni_workorder.gateway,
            "first_ip": vni_workorder.first_ip,
            "last_ip": vni_workorder.last_ip,
            "number_of_ips": vni_workorder.number_of_ips,
            "status": vni_workorder.status,
            "created_at": vni_workorder.created_at.isoformat(),
            "updated_at": vni_workorder.updated_at.isoformat(),
            "notes": vni_workorder.notes,
            "priority": vni_workorder.priority,
            "assigned_to": vni_workorder.assigned_to
        }
    except HTTPException:
        raise
    except Exception as e:
        print('UPDATE VNI WORKORDER ERROR:', e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{vni_workorder_id}/approve")
def approve_vni_workorder(
    vni_workorder_id: int,
    db: Session = Depends(get_db)
):
    """Approve a VNI workorder"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        vni_workorder.status = "approved"
        vni_workorder.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": "VNI workorder approved successfully", "status": "approved"}
    except HTTPException:
        raise
    except Exception as e:
        print('APPROVE VNI WORKORDER ERROR:', e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{vni_workorder_id}/reject")
def reject_vni_workorder(
    vni_workorder_id: int,
    db: Session = Depends(get_db)
):
    """Reject a VNI workorder"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        vni_workorder.status = "rejected"
        vni_workorder.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": "VNI workorder rejected successfully", "status": "rejected"}
    except HTTPException:
        raise
    except Exception as e:
        print('REJECT VNI WORKORDER ERROR:', e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{vni_workorder_id}/status")
def update_vni_workorder_status(
    vni_workorder_id: int,
    status_update: dict,
    db: Session = Depends(get_db)
):
    """Update VNI workorder status"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        new_status = status_update.get("status")
        valid_statuses = ["pending", "approved", "rejected", "draft", "executing", "completed", "failed"]
        
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        vni_workorder.status = new_status
        vni_workorder.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": f"VNI workorder status updated to {new_status}", "status": new_status}
    except HTTPException:
        raise
    except Exception as e:
        print('UPDATE VNI WORKORDER STATUS ERROR:', e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{vni_workorder_id}/execute")
def execute_vni_workorder(
    vni_workorder_id: int,
    db: Session = Depends(get_db)
):
    """Execute a VNI workorder using the VNI operations service"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        if vni_workorder.status != "approved":
            raise HTTPException(status_code=400, detail="VNI workorder must be approved before execution")
        
        # Update status to executing
        vni_workorder.status = "executing"
        vni_workorder.updated_at = datetime.utcnow()
        vni_workorder.last_execution_log = f"Execution started at {datetime.utcnow().isoformat()}"
        db.commit()
        
        # Use VNI operations service
        vni_ops = VNIOperations()
        
        # Prepare VNI configuration
        vni_config = {
            "vni_name": vni_workorder.vni_name,
            "cidr": vni_workorder.cidr,
            "gateway": vni_workorder.gateway,
            "t0_gw": vni_workorder.t0_gw,
            "t1_gw": vni_workorder.t1_gw,
            "description": vni_workorder.description,
            "project": vni_workorder.project,
            "subnet_mask": vni_workorder.subnet_mask,
            "first_ip": vni_workorder.first_ip,
            "last_ip": vni_workorder.last_ip,
            "number_of_ips": vni_workorder.number_of_ips
        }
        
        # Validate configuration
        validation_result = vni_ops.validate_vni_config(vni_config)
        if not validation_result["valid"]:
            vni_workorder.status = "failed"
            vni_workorder.last_execution_log = f"Validation failed: {', '.join(validation_result['errors'])}"
            vni_workorder.updated_at = datetime.utcnow()
            db.commit()
            raise HTTPException(status_code=400, detail=f"VNI configuration validation failed: {', '.join(validation_result['errors'])}")
        
        # Create VNI
        result = vni_ops.create_vni(vni_config)
        
        if result["success"]:
            vni_workorder.status = "completed"
            vni_workorder.last_execution_log = f"VNI '{vni_workorder.vni_name}' created successfully at {datetime.utcnow().isoformat()}. VNI ID: {result.get('vni_id', 'N/A')}"
        else:
            vni_workorder.status = "failed"
            vni_workorder.last_execution_log = f"VNI creation failed: {result.get('message', 'Unknown error')}"
        
        vni_workorder.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "message": result.get("message", "VNI workorder execution completed"),
            "status": vni_workorder.status,
            "vni_name": vni_workorder.vni_name,
            "vni_id": result.get("vni_id"),
            "execution_log": vni_workorder.last_execution_log
        }
    except HTTPException:
        raise
    except Exception as e:
        print('EXECUTE VNI WORKORDER ERROR:', e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{vni_workorder_id}")
def delete_vni_workorder(
    vni_workorder_id: int,
    db: Session = Depends(get_db)
):
    """Delete a VNI workorder"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        db.delete(vni_workorder)
        db.commit()
        
        return {"message": "VNI workorder deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print('DELETE VNI WORKORDER ERROR:', e)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{vni_workorder_id}/log")
def get_vni_workorder_log(
    vni_workorder_id: int,
    db: Session = Depends(get_db)
):
    """Get the execution log for a VNI workorder"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        return {"log": vni_workorder.last_execution_log}
    except HTTPException:
        raise
    except Exception as e:
        print('GET VNI WORKORDER LOG ERROR:', e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{vni_workorder_id}/status")
def get_vni_workorder_status(
    vni_workorder_id: int,
    db: Session = Depends(get_db)
):
    """Get the status of a VNI workorder"""
    try:
        vni_workorder = db.query(VNIWorkOrder).filter(VNIWorkOrder.id == vni_workorder_id).first()
        if not vni_workorder:
            raise HTTPException(status_code=404, detail="VNI workorder not found")
        
        return {"status": vni_workorder.status}
    except HTTPException:
        raise
    except Exception as e:
        print('GET VNI WORKORDER STATUS ERROR:', e)
        raise HTTPException(status_code=500, detail=str(e)) 