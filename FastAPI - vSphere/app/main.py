from fastapi import FastAPI
from api.routers import clusters, hosts, datastores, vms, system, history
from app.config import settings

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Include all routers
app.include_router(system.router)
app.include_router(clusters.router)
app.include_router(hosts.router)
app.include_router(datastores.router)
app.include_router(vms.router)
app.include_router(history.router)

@app.get("/")
def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "vSphere Monitoring API",
        "version": settings.API_VERSION,
        "description": settings.API_DESCRIPTION,
        "docs": "/docs",
        "health": "/system/health"
    }
