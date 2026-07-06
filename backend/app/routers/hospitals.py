"""Hospital finder router — finds nearby hospitals using Google Maps."""

from fastapi import APIRouter, Query
from app.services.maps_service import find_nearby_hospitals

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])


@router.get("/nearby")
async def get_nearby_hospitals(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
):
    """Find nearby hospitals based on user location.

    - **lat**: User's latitude
    - **lng**: User's longitude
    - **radius**: Search radius in meters (default 5000)
    """
    hospitals = await find_nearby_hospitals(lat, lng, radius)
    return {"status": "success", "data": hospitals, "count": len(hospitals)}
