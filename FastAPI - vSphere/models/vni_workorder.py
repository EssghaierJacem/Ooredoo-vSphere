from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class VNIWorkOrder(Base):
    __tablename__ = "vni_workorders"

    id = Column(Integer, primary_key=True, index=True)
    
    # Header/Metadata fields
    owner = Column(String, nullable=False)
    requested_date = Column(DateTime, nullable=False)
    requested_by = Column(String, nullable=False)
    virtual_machines = Column(JSON, nullable=True)  # Array of VM IDs
    deadline = Column(DateTime, nullable=False)
    
    # VNI Configuration fields
    project = Column(String, nullable=False)
    t0_gw = Column(String, nullable=False)
    t1_gw = Column(String, nullable=False)
    description = Column(String, nullable=False)
    vni_name = Column(String, nullable=False)
    cidr = Column(String, nullable=False)
    subnet_mask = Column(String, nullable=False)
    gateway = Column(String, nullable=False)
    first_ip = Column(String, nullable=False)
    last_ip = Column(String, nullable=False)
    number_of_ips = Column(Integer, nullable=False)
    
    # Status and tracking
    status = Column(String, default="pending")  # pending, approved, executing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_execution_log = Column(Text, nullable=True)
    
    # Additional metadata
    notes = Column(Text, nullable=True)
    priority = Column(String, default="normal")  # low, normal, high, critical
    assigned_to = Column(String, nullable=True) 