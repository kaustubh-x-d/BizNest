from fastapi import Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

class BizNestException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class ResourceNotFoundException(BizNestException):
    def __init__(self, message: str = "Requested resource not found"):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)

class InvalidCredentialsException(BizNestException):
    def __init__(self, message: str = "Invalid username or password"):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)

# Global error handlers to register in main.py
def register_error_handlers(app):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.detail}
        )

    @app.exception_handler(BizNestException)
    async def biznest_exception_handler(request: Request, exc: BizNestException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.message}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            loc = " -> ".join(str(l) for l in error.get("loc", []))
            errors.append(f"Field '{loc}': {error.get('msg')}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": "Validation failed",
                "details": errors
            }
        )

    @app.exception_handler(SQLAlchemyError)
    async def db_exception_handler(request: Request, exc: SQLAlchemyError):
        import logging
        logging.getLogger("uvicorn.error").exception("Database exception occurred:")
        # Prevent leaking raw database details in production
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "A database operation error occurred. Please verify your data integrity."
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        import logging
        logging.getLogger("uvicorn.error").exception("General exception occurred:")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "An unexpected error occurred. Please contact backend support."
            }
        )
