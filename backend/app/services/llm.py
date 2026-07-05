import json
import os
import google.generativeai as genai
from typing import Dict, Any, List
from backend.app.core.config import settings

class RecommendationService:
    @classmethod
    def get_generative_model(cls):
        """
        Configure and initialize the Gemini API client.
        """
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        try:
            genai.configure(api_key=api_key)
            return genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            print(f"Error configuring Gemini client: {e}")
            return None

    @classmethod
    def generate_explanation(
        cls, score_output: Dict[str, Any], lat: float, lon: float
    ) -> Dict[str, Any]:
        """
        Generate structured explanation (pros, cons, risks, suggestions) based on the ScoreEngine output.
        """
        b_type = score_output["business_type"]
        overall = score_output["overall_score"]
        breakdown = score_output["breakdown"]
        stats = score_output["stats"]
        recommendation = score_output["recommendation"]

        # 1. Structure the prompt with the exact mathematical indicators (no hallucinated values)
        prompt = f"""
You are the AI Business Analyst at BizNest, a GIS-based Decision Support Platform for entrepreneurs.
Analyze the mathematical location assessment output for a user looking to open a {b_type} at coordinates ({lat}, {lon}).

Location Analysis Profile (Calculated Mathematically):
- Business Type: {b_type}
- Overall Score: {overall}/100
- Recommendation Rating: {recommendation}
- Demand Sub-Score: {breakdown['demand']}/100 (Nearby target amenities count: {stats['demand_amenities_count']})
- Competition Sub-Score: {breakdown['competition']}/100 (Nearby direct competitors count: {stats['competitor_count']})
- Accessibility Sub-Score: {breakdown['accessibility']}/100 (Transit nodes: {stats['transit_nodes_count']}, Parking locations: {stats['parking_spots_count']})
- Financial Feasibility Sub-Score: {breakdown['feasibility']}/100

Based ONLY on these metrics and the physical realities of establishing a {b_type}, generate a detailed business review.
You must return a raw JSON object with the following fields:
1. "business_explanation": A brief, professional narrative (2-3 sentences) explaining the rating and the physical context.
2. "pros": A list of exactly 3 bullet points detailing positive indicators of this location.
3. "cons": A list of exactly 3 bullet points detailing negative indicators or warning signals of this location.
4. "suggestions": A list of exactly 3 actionable recommendations (e.g. branding pivots, target demographic focus, parking additions).

Return ONLY the raw JSON string. Do not include markdown code block syntax (like ```json ... ```).
"""

        model = cls.get_generative_model()
        if not model:
            # Return high-quality, realistic mock fallback to keep the app working offline
            return cls._get_mock_explanation(b_type, overall, breakdown, stats)

        try:
            response = model.generate_content(prompt)
            text_result = response.text.strip()
            
            # Clean up potential markdown formatting wrapping the JSON
            if text_result.startswith("```"):
                lines = text_result.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                text_result = "\n".join(lines).strip()
                
            return json.loads(text_result)
        except Exception as e:
            print(f"Gemini API execution error: {e}. Falling back to mock details.")
            return cls._get_mock_explanation(b_type, overall, breakdown, stats)

    @classmethod
    def _get_mock_explanation(
        cls, b_type: str, overall: float, breakdown: Dict[str, float], stats: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Generate realistic mock reasoning data if API key is missing or calls fail.
        """
        # Formulate customized text matches based on overall score thresholds
        if overall >= 80:
            exp = f"This location shows premium potential for a new {b_type}. Strong demand drivers are active within the target radius, coupled with comfortable transit connectivity options."
            pros = [
                f"High density of local demand drivers ({stats['demand_amenities_count']} target amenities detected nearby).",
                f"Favorable accessibility score ({breakdown['accessibility']}/100) indicating transit hub proximity.",
                "Healthy financial index matching operational constraints."
            ]
            cons = [
                f"Presence of {stats['competitor_count']} competitors could dilute initial customer volumes.",
                "High demand areas typically see rising commercial rents.",
                "High visibility requirements might limit store layout choices."
            ]
            sug = [
                f"Target peak hours aligned with the nearby schools and transit schedules.",
                "Invest in strong store front branding to capture foot traffic.",
                "Offer premium features or product variety to offset local competition."
            ]
        elif overall >= 50:
            exp = f"Establishing a {b_type} at this location presents moderate opportunities alongside clear structural challenges, requiring careful market segmenting."
            pros = [
                f"Moderate local amenities count ({stats['demand_amenities_count']} points of interest) supporting base demand.",
                f"Competitor density ({stats['competitor_count']} outlets) is manageable compared to central commercial zones.",
                "Reasonable operational budget feasibility."
            ]
            cons = [
                f"Accessibility rating ({breakdown['accessibility']}/100) indicates transit or parking limitations.",
                "Marginal foot traffic volumes during off-peak weekdays.",
                "A tight budget limits marketing capacity to compete with established brands."
            ]
            sug = [
                "Consider a specialty niche (e.g. coffee coworking space for cafes) to bypass direct competitors.",
                "Partner with local delivery networks to extend reach beyond the immediate physical radius.",
                "Negotiate flexible lease clauses to buffer initial operational ramp-up."
            ]
        else:
            exp = f"Establishing a {b_type} here is highly high-risk. Sub-optimal spatial metrics suggest either high competitor density, thin demand, or weak transport connectivity."
            pros = [
                "Low initial lease/operational costs due to off-center location.",
                "Minimal initial startup complexity.",
                "Direct neighborhood presence can secure hyper-local loyalty."
            ]
            cons = [
                f"Extremely high competition concentration ({stats['competitor_count']} competing stores in the same radius).",
                f"Insufficient target demographic indicators ({stats['demand_amenities_count']} demand drivers).",
                f"Weak infrastructure (transit index scored at {breakdown['accessibility']}/100)."
            ]
            sug = [
                "Recommend testing alternative nearby hubs with higher density ratios.",
                "If committed, pivot model to a low-overhead cloud/delivery-only storefront.",
                "Delay capital investment until starting budget feasibility can be improved."
            ]

        return {
            "business_explanation": exp,
            "pros": pros,
            "cons": cons,
            "suggestions": sug
        }
