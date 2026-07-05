import json
import os
from typing import Dict, Any
from backend.app.services.gis import GISService

# Default targets and fallback budget configurations in Indian Rupees (INR)
BUDGET_TARGETS = {
    "cafe": 1500000.0,       # 15 Lakh
    "bakery": 1000000.0,     # 10 Lakh
    "pharmacy": 1200000.0,   # 12 Lakh
    "gym": 2000000.0,        # 20 Lakh
    "kirana": 800000.0       # 8 Lakh
}

class ScoreEngine:
    _weights_cache = None

    @classmethod
    def load_weights_config(cls) -> Dict[str, Any]:
        """
        Load weights configuration from core/weights.json file.
        """
        if cls._weights_cache is not None:
            return cls._weights_cache
            
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        config_path = os.path.join(current_dir, "core", "weights.json")
        
        try:
            with open(config_path, "r") as f:
                cls._weights_cache = json.load(f)
            return cls._weights_cache
        except Exception as e:
            print(f"Error loading weights.json: {e}. Using fallback weights.")
            # Fallback configuration
            return {
                "cafe": {
                    "weights": {"demand": 0.35, "competition": 0.25, "accessibility": 0.20, "feasibility": 0.20},
                    "demand_amenities": ["school", "university", "college"]
                }
            }

    @classmethod
    def compute_potential_score(
        cls, lat: float, lon: float, radius: float, business_type: str, budget: float
    ) -> Dict[str, Any]:
        """
        Purely mathematical scoring engine logic.
        """
        config = cls.load_weights_config()
        b_type = business_type.lower()
        
        # Verify business type configuration
        if b_type not in config:
            b_type = "cafe" # default fallback
            
        b_config = config[b_type]
        weights = b_config["weights"]
        demand_targets = b_config.get("demand_amenities", [])

        # 1. Fetch real-world GIS statistics
        competitors = GISService.search_nearby_competitors(lat, lon, radius, b_type)
        amenities = GISService.search_nearby_amenities(lat, lon, radius)

        # 2. Compute Competition Score (Inverse relationship - fewer is better)
        # N = count of competitors. Scaled linearly.
        comp_count = len(competitors)
        if comp_count == 0:
            comp_score = 100.0
        else:
            # Drop 8 points per competitor, min score 10
            comp_score = max(10.0, 100.0 - (comp_count * 8.0))

        # 3. Compute Demand Score (Based on target demographics/amenities count)
        # Count target amenities present in radius
        demand_count = 0
        if "school" in demand_targets or "university" in demand_targets or "college" in demand_targets:
            demand_count += len(amenities.get("schools_colleges", []))
        if "hospital" in demand_targets or "clinic" in demand_targets:
            demand_count += len(amenities.get("hospitals", []))
        if "parking" in demand_targets:
            demand_count += len(amenities.get("parking", []))
            
        # Standard residential fallback count (we check transit as proxy if residential is empty)
        if "residential" in demand_targets:
            demand_count += len(amenities.get("schools_colleges", [])) + 1 # simple proxy count
            
        if demand_count == 0:
            demand_score = 20.0 # base score
        else:
            # Increase 15 points per target amenity, max score 100
            demand_score = min(100.0, 20.0 + (demand_count * 15.0))

        # 4. Compute Accessibility Score (transit & parking nodes)
        transit_count = len(amenities.get("transit", []))
        parking_count = len(amenities.get("parking", []))
        
        accessibility_score = min(
            100.0, 
            30.0 + (transit_count * 12.0) + (parking_count * 15.0)
        )

        # 5. Compute Financial Feasibility Score
        # Compare user budget vs target operational budget requirements
        target_budget = BUDGET_TARGETS.get(b_type, 1000000.0)
        if budget >= target_budget:
            feasibility_score = 100.0
        else:
            feasibility_score = max(20.0, round((budget / target_budget) * 100.0))

        # 6. Overall Weighted Sum Calculation
        overall_score = (
            (demand_score * weights["demand"]) +
            (comp_score * weights["competition"]) +
            (accessibility_score * weights["accessibility"]) +
            (feasibility_score * weights["feasibility"])
        )
        
        # Round overall score
        overall_score = round(overall_score, 1)

        # 7. Generate Recommendation Category based on Score
        if overall_score >= 80.0:
            recommendation = "Highly Recommended"
            explanation = "Superb balance of low competitor density, high accessibility, and ideal financial feasibility."
        elif overall_score >= 65.0:
            recommendation = "Recommended"
            explanation = "Solid target potential with moderate market presence. Feasible with clear positioning."
        elif overall_score >= 50.0:
            recommendation = "Advisable with Caution"
            explanation = "Average potential. Watch out for higher competitor density or tight budget limits."
        else:
            recommendation = "Not Recommended"
            explanation = "Sub-optimal parameters. High competition density, poor accessibility transit, or insufficient starting capital."

        return {
            "business_type": business_type,
            "overall_score": overall_score,
            "recommendation": recommendation,
            "brief": explanation,
            "breakdown": {
                "demand": round(demand_score, 1),
                "competition": round(comp_score, 1),
                "accessibility": round(accessibility_score, 1),
                "feasibility": round(feasibility_score, 1)
            },
            "stats": {
                "competitor_count": comp_count,
                "demand_amenities_count": demand_count,
                "transit_nodes_count": transit_count,
                "parking_spots_count": parking_count
            }
        }
