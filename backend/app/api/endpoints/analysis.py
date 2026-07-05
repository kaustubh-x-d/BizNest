from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.analysis import ScoreRequest, CompareRequest
from backend.app.services.score import ScoreEngine
from backend.app.services.llm import RecommendationService

router = APIRouter()

@router.post("/score")
def calculate_score(payload: ScoreRequest):
    """
    Compute mathematical business potential score for a location and supplement
    with LLM-generated pros, cons, and strategic suggestions.
    """
    valid_types = ["cafe", "bakery", "pharmacy", "gym", "kirana"]
    if payload.business_type.lower() not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid business type. Must be one of {valid_types}"
        )
        
    try:
        score_details = ScoreEngine.compute_potential_score(
            lat=payload.latitude,
            lon=payload.longitude,
            radius=payload.radius,
            business_type=payload.business_type,
            budget=payload.budget
        )
        
        # Supplement mathematical score with LLM analysis
        llm_explanation = RecommendationService.generate_explanation(
            score_output=score_details,
            lat=payload.latitude,
            lon=payload.longitude
        )
        score_details["explanation"] = llm_explanation
        
        return score_details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating potential score: {str(e)}"
        )


@router.post("/compare")
def compare_locations(payload: CompareRequest):
    """
    Compare two location points side-by-side using the math engine + LLM reviews.
    """
    valid_types = ["cafe", "bakery", "pharmacy", "gym", "kirana"]
    if payload.business_type.lower() not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid business type. Must be one of {valid_types}"
        )

    try:
        # Score Location A
        score_a = ScoreEngine.compute_potential_score(
            lat=payload.location_a.lat,
            lon=payload.location_a.lon,
            radius=payload.radius,
            business_type=payload.business_type,
            budget=payload.budget
        )
        # Supplement A with LLM Analysis
        explanation_a = RecommendationService.generate_explanation(
            score_output=score_a,
            lat=payload.location_a.lat,
            lon=payload.location_a.lon
        )
        score_a["explanation"] = explanation_a
        
        # Score Location B
        score_b = ScoreEngine.compute_potential_score(
            lat=payload.location_b.lat,
            lon=payload.location_b.lon,
            radius=payload.radius,
            business_type=payload.business_type,
            budget=payload.budget
        )
        # Supplement B with LLM Analysis
        explanation_b = RecommendationService.generate_explanation(
            score_output=score_b,
            lat=payload.location_b.lat,
            lon=payload.location_b.lon
        )
        score_b["explanation"] = explanation_b
        
        # Determine mathematical winner
        val_a = score_a["overall_score"]
        val_b = score_b["overall_score"]
        
        if val_a > val_b:
            winner = payload.location_a.label
            difference = round(val_a - val_b, 1)
            reason = f"{payload.location_a.label} scored {difference} points higher than {payload.location_b.label} due to superior metrics."
        elif val_b > val_a:
            winner = payload.location_b.label
            difference = round(val_b - val_a, 1)
            reason = f"{payload.location_b.label} scored {difference} points higher than {payload.location_a.label} due to superior metrics."
        else:
            winner = "Tie"
            reason = "Both locations exhibit identical overall scoring potential."
            
        return {
            "business_type": payload.business_type,
            "budget": payload.budget,
            "winner": winner,
            "reason": reason,
            "location_a": {
                "label": payload.location_a.label,
                "lat": payload.location_a.lat,
                "lon": payload.location_a.lon,
                "details": score_a
            },
            "location_b": {
                "label": payload.location_b.label,
                "lat": payload.location_b.lat,
                "lon": payload.location_b.lon,
                "details": score_b
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error comparing locations: {str(e)}"
        )

