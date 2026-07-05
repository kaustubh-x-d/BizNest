import io
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.saved_report import SavedReport
from backend.app.repositories.report import report_repository
from backend.app.schemas.report import SavedReportCreate
from backend.app.services.score import ScoreEngine
from backend.app.services.llm import RecommendationService
from backend.app.services.gis import GISService
from backend.app.services.pdf import PDFReportGenerator
from backend.app.core.exceptions import ResourceNotFoundException

class SavedReportService:
    @staticmethod
    def create_report(
        db: Session, *, user_id: Any, report_in: SavedReportCreate
    ) -> SavedReport:
        """
        Calculates scores, compiles AI recommendations, and saves the report to the DB.
        """
        # 1. Compute potential score
        score_details = ScoreEngine.compute_potential_score(
            lat=report_in.latitude,
            lon=report_in.longitude,
            radius=report_in.radius,
            business_type=report_in.business_type,
            budget=report_in.budget
        )

        # 2. Generate LLM explanations
        llm_explanation = RecommendationService.generate_explanation(
            score_output=score_details,
            lat=report_in.latitude,
            lon=report_in.longitude
        )

        # 3. Query competitors details
        competitors = GISService.search_nearby_competitors(
            lat=report_in.latitude,
            lon=report_in.longitude,
            radius_meters=report_in.radius,
            business_type=report_in.business_type
        )

        # 4. Formulate SavedReport DB object
        db_report = SavedReport(
            user_id=user_id,
            title=report_in.title,
            latitude=report_in.latitude,
            longitude=report_in.longitude,
            business_type=report_in.business_type,
            budget=report_in.budget,
            score_breakdown=score_details["breakdown"],
            recommendations=llm_explanation,
            competitors_metadata=competitors
        )

        return report_repository.create(db, obj_in=db_report)

    @staticmethod
    def get_user_reports(
        db: Session, *, user_id: Any, skip: int = 0, limit: int = 100
    ) -> List[SavedReport]:
        return report_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    @staticmethod
    def get_report_by_id(db: Session, *, report_id: Any, user_id: Any) -> SavedReport:
        report = report_repository.get(db, report_id)
        if not report or report.user_id != user_id:
            raise ResourceNotFoundException("Saved report not found.")
        return report

    @staticmethod
    def delete_report(db: Session, *, report_id: Any, user_id: Any) -> SavedReport:
        report = SavedReportService.get_report_by_id(db, report_id=report_id, user_id=user_id)
        return report_repository.remove(db, id=report_id)

    @staticmethod
    def generate_pdf_report_bytes(db: Session, *, report_id: Any, user_id: Any) -> io.BytesIO:
        """
        Generate publication-quality PDF formatting of the saved report.
        """
        report = SavedReportService.get_report_by_id(db, report_id=report_id, user_id=user_id)
        return PDFReportGenerator.build_report_pdf(report)
