from sqlalchemy import Column, Integer, String, DateTime, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class WorkOrder(Base):
    __tablename__ = "workorders"

    id = Column(Integer, primary_key=True, index=True)
    
    # General Information
    name = Column(String, nullable=False)  # VM Name
    os = Column(String, nullable=False)     # OS Type
    
    # Network Configuration
    ip = Column(String)
    gateway = Column(String)
    netmask = Column(String)
    uls = Column(String)  # New field
    
    # Location
    site = Column(String)     # OT-CHARGUIA or OT-MGHIRA
    cluster = Column(String)  # Edge, ITaaS Workload, etc.
    datastore_id = Column(String)  # Manual input
    
    # Resources
    cpu = Column(Integer, nullable=False)
    ram = Column(Integer, nullable=False)
    disk = Column(Float, nullable=False)
    
    # Users
    users = Column(JSON)  # Array of users: Userapp, Oss, Optim, Ingdba, Ingsec, Other
    
    # Status and metadata
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Legacy fields (keeping for compatibility)
    host_id = Column(String)
    vm_id = Column(String)
    disks = Column(JSON)
    nics = Column(JSON)
    last_execution_log = Column(String)
    resource_pool_id = Column(String)
    ip_pool_id = Column(String)
    template_id = Column(String)
    hostname = Column(String)
    domain = Column(String)
    hardware_version = Column(String)
    scsi_controller_type = Column(String)
    folder_id = Column(String)
    network_id = Column(String)
    datacenter_name = Column(String) 