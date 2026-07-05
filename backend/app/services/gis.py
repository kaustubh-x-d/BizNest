import requests
from typing import List, Dict, Any

class GISService:
    # Multiple public mirrors to bypass local server rate-limits or gateway timeouts (504s)
    OVERPASS_MIRRORS = [
        "https://overpass.kumi.systems/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://z.overpass-api.de/api/interpreter",
        "https://overpass-api.de/api/interpreter"
    ]

    @staticmethod
    def geocode_address(query: str) -> List[Dict[str, Any]]:
        """
        Geocode a search query to coordinates using OSM Nominatim.
        """
        url = "https://nominatim.openstreetmap.org/search"
        headers = {
            "User-Agent": "BizNest-Intelligence-Platform/1.0 (contact: support@biznest.com)"
        }
        params = {
            "q": query,
            "format": "json",
            "limit": 10,
            "addressdetails": 1
        }
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for item in data:
                results.append({
                    "display_name": item.get("display_name"),
                    "lat": float(item.get("lat")),
                    "lon": float(item.get("lon")),
                    "type": item.get("type"),
                    "importance": item.get("importance", 0.0),
                    "address": item.get("address", {})
                })
            return results
        except Exception as e:
            print(f"Error in Nominatim Geocoding: {e}")
            return []

    @staticmethod
    def get_overpass_tags_for_business(business_type: str, broad_match: bool = False) -> str:
        """
        Helper to map business type to OSM tags for Overpass query.
        """
        exact_mapping = {
            "cafe": 'node["amenity"="cafe"](around:{radius},{lat},{lon}); way["amenity"="cafe"](around:{radius},{lat},{lon});',
            "bakery": 'node["shop"="bakery"](around:{radius},{lat},{lon}); way["shop"="bakery"](around:{radius},{lat},{lon}); node["amenity"="bakery"](around:{radius},{lat},{lon}); way["amenity"="bakery"](around:{radius},{lat},{lon});',
            "pharmacy": 'node["amenity"="pharmacy"](around:{radius},{lat},{lon}); way["amenity"="pharmacy"](around:{radius},{lat},{lon}); node["shop"="chemist"](around:{radius},{lat},{lon}); way["shop"="chemist"](around:{radius},{lat},{lon});',
            "gym": 'node["leisure"="fitness_centre"](around:{radius},{lat},{lon}); way["leisure"="fitness_centre"](around:{radius},{lat},{lon}); node["leisure"="sports_centre"](around:{radius},{lat},{lon}); way["leisure"="sports_centre"](around:{radius},{lat},{lon});',
            "kirana": 'node["shop"~"^(convenience|supermarket|grocery|general)$"](around:{radius},{lat},{lon}); way["shop"~"^(convenience|supermarket|grocery|general)$"](around:{radius},{lat},{lon});'
        }
        broad_mapping = {
            "cafe": 'node["amenity"~"^(cafe|restaurant|fast_food|food_court)$"](around:{radius},{lat},{lon}); way["amenity"~"^(cafe|restaurant|fast_food|food_court)$"](around:{radius},{lat},{lon});',
            "bakery": 'node["shop"~"^(bakery|confectionery|pastry)$"](around:{radius},{lat},{lon}); way["shop"~"^(bakery|confectionery|pastry)$"](around:{radius},{lat},{lon}); node["amenity"~"^(cafe|restaurant)$"](around:{radius},{lat},{lon}); way["amenity"~"^(cafe|restaurant)$"](around:{radius},{lat},{lon});',
            "pharmacy": 'node["amenity"~"^(pharmacy|clinic|doctors)$"](around:{radius},{lat},{lon}); way["amenity"~"^(pharmacy|clinic|doctors)$"](around:{radius},{lat},{lon}); node["shop"~"^(chemist|medical_supply)$"](around:{radius},{lat},{lon}); way["shop"~"^(chemist|medical_supply)$"](around:{radius},{lat},{lon});',
            "gym": 'node["leisure"~"^(fitness_centre|sports_centre|fitness_station)$"](around:{radius},{lat},{lon}); way["leisure"~"^(fitness_centre|sports_centre|fitness_station)$"](around:{radius},{lat},{lon}); node["sport"](around:{radius},{lat},{lon}); way["sport"](around:{radius},{lat},{lon});',
            "kirana": 'node["shop"~"^(convenience|supermarket|grocery|general|department_store|kiosk|variety_store|dairy|greengrocer|beverages|food|spices|yes)$"](around:{radius},{lat},{lon}); way["shop"~"^(convenience|supermarket|grocery|general|department_store|kiosk|variety_store|dairy|greengrocer|beverages|food|spices|yes)$"](around:{radius},{lat},{lon}); node["name"~"(kirana|grocery|general|provision|store|mart|bhandar|department|super market|supermarket)", i](around:{radius},{lat},{lon}); way["name"~"(kirana|grocery|general|provision|store|mart|bhandar|department|super market|supermarket)", i](around:{radius},{lat},{lon});'
        }
        mapping = broad_mapping if broad_match else exact_mapping
        return mapping.get(business_type.lower(), exact_mapping["cafe"])

    @classmethod
    def _post_overpass(cls, overpass_query: str):
        headers = {
            "User-Agent": "BizNest-Intelligence-Platform/1.0 (contact: support@biznest.com)"
        }

        for url in cls.OVERPASS_MIRRORS:
            try:
                response = requests.post(url, data={"data": overpass_query}, headers=headers, timeout=12)
                response.raise_for_status()
                return response
            except Exception as e:
                print(f"Overpass mirror {url} failed: {e}. Trying next...")
                continue

        return None

    @staticmethod
    def _extract_place(elem: Dict[str, Any], business_type: str) -> Dict[str, Any] | None:
        tags = elem.get("tags", {})
        elem_lat = elem.get("lat") or (elem.get("center", {}).get("lat") if "center" in elem else None)
        elem_lon = elem.get("lon") or (elem.get("center", {}).get("lon") if "center" in elem else None)

        if elem_lat is None or elem_lon is None:
            return None

        return {
            "id": elem.get("id"),
            "name": tags.get("name", f"Unnamed {business_type.capitalize()}"),
            "lat": elem_lat,
            "lon": elem_lon,
            "category": tags.get("amenity", tags.get("shop", tags.get("leisure", tags.get("sport", business_type)))),
            "rating": float(tags.get("rating", 4.0)),
            "address": tags.get("addr:street", tags.get("addr:suburb", "Nearby Area"))
        }

    @staticmethod
    def _dedupe_places(places: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen = set()
        deduped = []

        for place in places:
            key = (place.get("id"), place.get("lat"), place.get("lon"))
            if key in seen:
                continue
            seen.add(key)
            deduped.append(place)

        return deduped

    @classmethod
    def search_nearby_competitors(
        cls, lat: float, lon: float, radius_meters: float, business_type: str
    ) -> List[Dict[str, Any]]:
        """
        Query Overpass API to get competitors within a specific radius.
        """
        tags_clause = cls.get_overpass_tags_for_business(business_type)
        query_clause = tags_clause.format(radius=radius_meters, lat=lat, lon=lon)
        
        overpass_query = f"""
        [out:json][timeout:15];
        (
          {query_clause}
        );
        out center;
        """
        
        response = cls._post_overpass(overpass_query)
        if not response:
            print("All Overpass mirrors failed for competitors query.")
            return []

        try:
            data = response.json()
            elements = data.get("elements", [])
            competitors = []
            
            for elem in elements:
                if elem.get("type") in ["node", "way"] and "tags" in elem:
                    place = cls._extract_place(elem, business_type)
                    if place:
                        competitors.append(place)

            if competitors and business_type.lower() != "kirana":
                return cls._dedupe_places(competitors)

            if business_type.lower() == "kirana":
                fallback_radius = min(max(radius_meters * 3, 3000), 5000)
            else:
                fallback_radius = max(radius_meters, min(radius_meters * 2, 5000))
            fallback_clause = cls.get_overpass_tags_for_business(business_type, broad_match=True)
            fallback_query_clause = fallback_clause.format(radius=fallback_radius, lat=lat, lon=lon)
            fallback_query = f"""
            [out:json][timeout:15];
            (
              {fallback_query_clause}
            );
            out center 50;
            """
            fallback_response = cls._post_overpass(fallback_query)
            if not fallback_response:
                return cls._dedupe_places(competitors)

            fallback_competitors = competitors[:]
            for elem in fallback_response.json().get("elements", []):
                if elem.get("type") in ["node", "way"] and "tags" in elem:
                    place = cls._extract_place(elem, business_type)
                    if place:
                        fallback_competitors.append(place)

            return cls._dedupe_places(fallback_competitors)
        except Exception as e:
            print(f"Error parsing Overpass competitors: {e}")
            return []

    @classmethod
    def search_nearby_amenities(
        cls, lat: float, lon: float, radius_meters: float
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Query Overpass API for schools, colleges, hospitals, public transit, and commercial structures.
        """
        overpass_query = f"""
        [out:json][timeout:15];
        (
          node["amenity"="school"](around:{radius_meters},{lat},{lon});
          way["amenity"="school"](around:{radius_meters},{lat},{lon});
          node["amenity"="university"](around:{radius_meters},{lat},{lon});
          way["amenity"="university"](around:{radius_meters},{lat},{lon});
          node["amenity"="college"](around:{radius_meters},{lat},{lon});
          way["amenity"="college"](around:{radius_meters},{lat},{lon});
          node["amenity"="hospital"](around:{radius_meters},{lat},{lon});
          way["amenity"="hospital"](around:{radius_meters},{lat},{lon});
          node["amenity"="clinic"](around:{radius_meters},{lat},{lon});
          node["highway"="bus_stop"](around:{radius_meters},{lat},{lon});
          node["railway"="station"](around:{radius_meters},{lat},{lon});
          node["amenity"="parking"](around:{radius_meters},{lat},{lon});
          way["amenity"="parking"](around:{radius_meters},{lat},{lon});
        );
        out center;
        """
        
        amenities = {
            "schools_colleges": [],
            "hospitals": [],
            "transit": [],
            "parking": []
        }
        
        response = cls._post_overpass(overpass_query)
        if not response:
            print("All Overpass mirrors failed for amenities query.")
            return amenities

        try:
            data = response.json()
            elements = data.get("elements", [])
            for elem in elements:
                if "tags" in elem:
                    tags = elem.get("tags", {})
                    name = tags.get("name", "Unnamed Facility")
                    
                    elem_lat = elem.get("lat") or (elem.get("center", {}).get("lat") if "center" in elem else None)
                    elem_lon = elem.get("lon") or (elem.get("center", {}).get("lon") if "center" in elem else None)
                    
                    if elem_lat is None or elem_lon is None:
                        continue
                        
                    item = {
                        "id": elem.get("id"),
                        "name": name,
                        "lat": elem_lat,
                        "lon": elem_lon
                    }
                    
                    if "school" in tags.values() or "university" in tags.values() or "college" in tags.values() or tags.get("amenity") in ["school", "university", "college"]:
                        amenities["schools_colleges"].append(item)
                    elif tags.get("amenity") in ["hospital", "clinic"]:
                        amenities["hospitals"].append(item)
                    elif tags.get("highway") == "bus_stop" or tags.get("railway") == "station" or tags.get("amenity") == "bus_station":
                        amenities["transit"].append(item)
                    elif tags.get("amenity") == "parking":
                        amenities["parking"].append(item)
                        
            return amenities
        except Exception as e:
            print(f"Error parsing Overpass amenities: {e}")
            return amenities
