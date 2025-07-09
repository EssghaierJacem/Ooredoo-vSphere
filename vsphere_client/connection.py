import ssl
import os
from dotenv import load_dotenv
from pyVim.connect import SmartConnect, Disconnect
import atexit

load_dotenv()

def get_vsphere_connection():
    VCENTER_HOST = os.getenv("VCENTER_URL")
    VCENTER_USER = os.getenv("VCENTER_USER")
    VCENTER_PASSWORD = os.getenv("VCENTER_PASSWORD")
    VCENTER_PORT = int(os.getenv("VCENTER_PORT", 443))

    if not all([VCENTER_HOST, VCENTER_USER, VCENTER_PASSWORD]):
        raise ValueError("❌ Missing vCenter credentials in .env")

    context = ssl._create_unverified_context()
    si = SmartConnect(
        host=VCENTER_HOST,
        user=VCENTER_USER,
        pwd=VCENTER_PASSWORD,
        port=VCENTER_PORT,
        sslContext=context
    )
    atexit.register(Disconnect, si)
    return si
