from fastapi import APIRouter, HTTPException
from services.insert_db import store_monitoring_data, get_historical_data, get_metrics_history

router = APIRouter(
    prefix="/history",
    tags=["Historical Data"]
)

@router.post("/store")
def store_current_data():
    """
    Store current monitoring data in the database
    """
    try:
        result = store_monitoring_data()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/{data_type}")
def get_historical_monitoring_data(data_type: str, entity_name: str = None, limit: int = 100):
    """
    Get historical monitoring data by type
    
    Args:
        data_type: Type of data ('cluster', 'host', 'datastore', 'vm')
        entity_name: Optional specific entity name
        limit: Maximum number of records to return
    """
    try:
        if data_type not in ['cluster', 'host', 'datastore', 'vm']:
            raise HTTPException(status_code=400, detail="Invalid data_type. Must be one of: cluster, host, datastore, vm")
        
        data = get_historical_data(data_type, entity_name, limit)
        return {
            "data_type": data_type,
            "entity_name": entity_name,
            "limit": limit,
            "records_count": len(data),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
def get_historical_metrics(metric_type: str = None, limit: int = 100):
    """
    Get historical system metrics
    
    Args:
        metric_type: Optional specific metric type ('cpu_usage', 'memory_usage', 'storage_usage')
        limit: Maximum number of records to return
    """
    try:
        if metric_type and metric_type not in ['cpu_usage', 'memory_usage', 'storage_usage']:
            raise HTTPException(status_code=400, detail="Invalid metric_type. Must be one of: cpu_usage, memory_usage, storage_usage")
        
        metrics = get_metrics_history(metric_type, limit)
        return {
            "metric_type": metric_type,
            "limit": limit,
            "records_count": len(metrics),
            "metrics": metrics
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/summary")
def get_metrics_summary():
    """
    Get a summary of historical metrics with latest values and trends
    """
    try:
        # Get latest metrics for each type
        cpu_metrics = get_metrics_history('cpu_usage', 10)
        memory_metrics = get_metrics_history('memory_usage', 10)
        storage_metrics = get_metrics_history('storage_usage', 10)
        
        summary = {
            "cpu_usage": {
                "latest": cpu_metrics[0]['value'] if cpu_metrics else 0,
                "trend": "stable",  # Could be calculated based on historical data
                "history": cpu_metrics
            },
            "memory_usage": {
                "latest": memory_metrics[0]['value'] if memory_metrics else 0,
                "trend": "stable",
                "history": memory_metrics
            },
            "storage_usage": {
                "latest": storage_metrics[0]['value'] if storage_metrics else 0,
                "trend": "stable",
                "history": storage_metrics
            }
        }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 