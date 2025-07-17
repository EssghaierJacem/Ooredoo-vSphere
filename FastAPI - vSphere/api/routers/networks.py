from fastapi import APIRouter
from typing import List
from services.vsphere.network_info import get_networks_info

router = APIRouter(
    prefix="/networks",
    tags=["Networks"]
)

@router.get("/", response_model=List[dict])
def get_networks():
    return get_networks_info() 