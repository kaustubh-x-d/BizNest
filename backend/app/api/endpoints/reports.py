from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.schemas.report import SavedReportCreate, SavedReportResponse
from backend.app.services.report import SavedReportService

router = APIRouter()

@router.post("/", response_model=SavedReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: SavedReportCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Generate and save a business potential report for the active authenticated user.
    """
    try:
        report = SavedReportService.create_report(
            db=db, 
            user_id=current_user.id, 
            report_in=report_in
        )
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate saved report: {str(e)}"
        )


@router.get("/", response_model=List[SavedReportResponse])
def get_reports(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Fetch all saved business potential reports for the active user.
    """
    reports = SavedReportService.get_user_reports(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit
    )
    return reports


@router.get("/{report_id}", response_model=SavedReportResponse)
def get_report(
    report_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Retrieve details of a specific saved business potential report.
    """
    report = SavedReportService.get_report_by_id(
        db=db, 
        report_id=report_id, 
        user_id=current_user.id
    )
    return report


@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Remove a saved business potential report.
    """
    SavedReportService.delete_report(
        db=db, 
        report_id=report_id, 
        user_id=current_user.id
    )
    return {"success": True, "message": "Saved report deleted successfully."}


@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Download the saved report as a styled PDF document.
    """
    pdf_buffer = SavedReportService.generate_pdf_report_bytes(
        db=db, 
        report_id=report_id, 
        user_id=current_user.id
    )
    
    # Stream the PDF response back to the client
    filename = f"BizNest_Report_{report_id[:8]}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
