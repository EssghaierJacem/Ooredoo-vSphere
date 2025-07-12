import ssl
import atexit
from pyVim.connect import SmartConnect, Disconnect
from app.config import settings

def get_vsphere_connection():
    """
    Establish connection to vSphere/vCenter server
    
    Returns:
        ServiceInstance: vSphere service instance
        
    Raises:
        ValueError: If vSphere credentials are missing
        Exception: If connection fails
    """
    # Validate configuration
    settings.validate_vsphere_config()
    
    try:
        # Create SSL context (unverified for self-signed certificates)
        context = ssl._create_unverified_context()
        
        # Connect to vCenter
        si = SmartConnect(
            host=settings.VCENTER_URL,
            user=settings.VCENTER_USER,
            pwd=settings.VCENTER_PASSWORD,
            port=settings.VCENTER_PORT,
            sslContext=context
        )
        
        # Register disconnect function to be called at exit
        atexit.register(Disconnect, si)
        
        return si
        
    except Exception as e:
        raise Exception(f"Failed to connect to vCenter: {str(e)}")

def test_connection():
    """
    Test vSphere connection and return status
    
    Returns:
        dict: Connection status and details
    """
    try:
        si = get_vsphere_connection()
        content = si.RetrieveContent()
        
        return {
            "status": "success",
            "message": "Successfully connected to vCenter",
            "vcenter_url": settings.VCENTER_URL,
            "api_version": content.about.apiVersion,
            "product_name": content.about.name,
            "product_version": content.about.version
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Connection failed: {str(e)}",
            "vcenter_url": settings.VCENTER_URL
        }
