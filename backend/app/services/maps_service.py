"""Google Maps service for finding nearby hospitals and emergency services."""

# pyrefly: ignore [missing-import]
import httpx
from app.config import settings


async def find_nearby_hospitals(
    latitude: float, longitude: float, radius: int = 5000
) -> list[dict]:
    """Find nearby hospitals using Google Maps Places API (New).

    Args:
        latitude: User's latitude.
        longitude: User's longitude.
        radius: Search radius in meters (default 5km).

    Returns:
        List of hospital dictionaries with name, address, location, rating, etc.
    """
    url = "https://places.googleapis.com/v1/places:searchNearby"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.formattedAddress,"
            "places.location,"
            "places.rating,"
            "places.userRatingCount,"
            "places.nationalPhoneNumber,"
            "places.internationalPhoneNumber,"
            "places.currentOpeningHours,"
            "places.types,"
            "places.googleMapsUri"
        ),
    }

    body = {
        "includedTypes": ["hospital"],
        "maxResultCount": 10,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "radius": radius,
            }
        },
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=body, headers=headers, timeout=10.0)

        if response.status_code != 200:
            return []

        data = response.json()
        places = data.get("places", [])

        hospitals = []
        for place in places:
            hospital = {
                "name": place.get("displayName", {}).get("text", "Unknown"),
                "address": place.get("formattedAddress", "Address not available"),
                "latitude": place.get("location", {}).get("latitude"),
                "longitude": place.get("location", {}).get("longitude"),
                "rating": place.get("rating"),
                "rating_count": place.get("userRatingCount"),
                "phone": place.get("nationalPhoneNumber")
                or place.get("internationalPhoneNumber"),
                "is_open": (
                    place.get("currentOpeningHours", {}).get("openNow")
                    if place.get("currentOpeningHours")
                    else None
                ),
                "maps_url": place.get("googleMapsUri"),
            }
            hospitals.append(hospital)

        return hospitals
