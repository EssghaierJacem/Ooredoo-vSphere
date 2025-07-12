import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # vSphere Configuration
    VCENTER_URL: str = os.getenv("VCENTER_URL", "")
    VCENTER_USER: str = os.getenv("VCENTER_USER", "")
    VCENTER_PASSWORD: str = os.getenv("VCENTER_PASSWORD", "")
    VCENTER_PORT: int = int(os.getenv("VCENTER_PORT", "443"))
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/vsphere_monitoring")
    
    # PostgreSQL specific settings
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "vsphere_monitoring")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "username")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    
    # API Configuration
    API_TITLE: str = "vSphere Monitoring API"
    API_DESCRIPTION: str = "REST API for monitoring vSphere infrastructure including clusters, hosts, datastores, and VMs"
    API_VERSION: str = "1.0.0"
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate_vsphere_config(cls):
        """Validate that all required vSphere configuration is present"""
        missing_vars = []
        if not cls.VCENTER_URL:
            missing_vars.append("VCENTER_URL")
        if not cls.VCENTER_USER:
            missing_vars.append("VCENTER_USER")
        if not cls.VCENTER_PASSWORD:
            missing_vars.append("VCENTER_PASSWORD")
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    @classmethod
    def get_database_url(cls):
        """Get database URL, constructing from components if needed"""
        if cls.DATABASE_URL and cls.DATABASE_URL != "postgresql://username:password@localhost:5432/vsphere_monitoring":
            return cls.DATABASE_URL
        
        # Construct from individual components
        return f"postgresql://{cls.POSTGRES_USER}:{cls.POSTGRES_PASSWORD}@{cls.POSTGRES_HOST}:{cls.POSTGRES_PORT}/{cls.POSTGRES_DB}"

settings = Settings()
