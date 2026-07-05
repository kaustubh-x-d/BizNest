from typing import List
from sqlalchemy.orm import Session
from backend.app.models.saved_report import SavedReport
from backend.app.repositories.base import BaseRepository

class SavedReportRepository(BaseRepository[SavedReport]):
    def __init__(self):
        super().__init__(SavedReport)

    def get_multi_by_user(
        self, db: Session, *, user_id: Any, skip: int = 0, limit: int = 100
    ) -> List[SavedReport]:
        return (
            db.query(SavedReport)
            .filter(SavedReport.user_id == user_id)
            .order_by(SavedReport.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

# Global singleton repository
report_repository = SavedReportRepository()
