from sqlalchemy import Column, Integer, String, DateTime, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class WorkOrder(Base):
    __tablename__ = "workorders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    os = Column(String, nullable=False)
    host_version = Column(String, nullable=False)
    cpu = Column(Integer, nullable=False)
    ram = Column(Integer, nullable=False)
    disk = Column(Float, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    host_id = Column(String)
    vm_id = Column(String)
    datastore_id = Column(String)
    disks = Column(JSON)
    nics = Column(JSON) 