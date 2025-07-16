from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from models.workorder import WorkOrder
from datetime import datetime

router = APIRouter(
    prefix="/workorders",
    tags=["WorkOrders"]
)

@router.post("/")
def create_workorder(
    workorder: dict,
    db: Session = Depends(get_db)
):
    print("Received workorder:", workorder)  # Debug log
    try:
        # Use requested_at from frontend if provided, else use now
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
            created_at=created_at
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
            "created_at": new_order.created_at.isoformat()
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
                "created_at": o.created_at.isoformat()
            }
            for o in orders
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 