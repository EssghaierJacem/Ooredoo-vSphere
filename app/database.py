from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, Numeric, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from app.config import settings

# Create database engine
engine = create_engine(settings.get_database_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class Cluster(Base):
    __tablename__ = "clusters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    num_hosts = Column(Integer)
    num_vms = Column(Integer)
    vms_running = Column(Integer)
    vms_stopped = Column(Integer)
    cpu_total_mhz = Column(Integer)
    cpu_used_mhz = Column(Integer)
    memory_total_gb = Column(Numeric(10, 2))
    memory_used_gb = Column(Numeric(10, 2))
    storage_total_gb = Column(Numeric(10, 2))
    storage_free_gb = Column(Numeric(10, 2))
    overall_status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    hosts = relationship("Host", back_populates="cluster", cascade="all, delete-orphan")
    datastores = relationship("Datastore", back_populates="cluster", cascade="all, delete-orphan")
    vms = relationship("VM", back_populates="cluster", cascade="all, delete-orphan")

class Host(Base):
    __tablename__ = "hosts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ip_address = Column(String)
    cluster_id = Column(Integer, ForeignKey("clusters.id", ondelete="CASCADE"))
    cpu_model = Column(String)
    cpu_cores = Column(Integer)
    cpu_total_mhz = Column(Integer)
    cpu_used_mhz = Column(Integer)
    memory_total_gb = Column(Numeric(10, 2))
    memory_used_gb = Column(Numeric(10, 2))
    power_state = Column(String)
    connection_state = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cluster = relationship("Cluster", back_populates="hosts")

class Datastore(Base):
    __tablename__ = "datastores"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cluster_id = Column(Integer, ForeignKey("clusters.id", ondelete="CASCADE"))
    capacity_gb = Column(Numeric(10, 2))
    free_space_gb = Column(Numeric(10, 2))
    accessible = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cluster = relationship("Cluster", back_populates="datastores")

class VM(Base):
    __tablename__ = "vms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    host_name = Column(String)
    ip_address = Column(String)
    power_state = Column(String)
    cpu_count = Column(Integer)
    memory_mb = Column(Integer)
    cluster_id = Column(Integer, ForeignKey("clusters.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cluster = relationship("Cluster", back_populates="vms")

# Legacy models for backward compatibility (if needed)
class MonitoringData(Base):
    __tablename__ = "monitoring_data"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    data_type = Column(String, index=True)  # 'cluster', 'host', 'datastore', 'vm'
    entity_name = Column(String, index=True)
    data_json = Column(Text)  # Store JSON data as text
    
class SystemMetrics(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metric_type = Column(String, index=True)  # 'cpu_usage', 'memory_usage', 'storage_usage'
    value = Column(Float)
    unit = Column(String)  # 'percent', 'mhz', 'gb'
    description = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    """
    Get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
