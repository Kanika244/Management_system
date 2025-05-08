from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

# Custom exception class
class InvalidFileTypeException(HTTPException):
    def __init__(self, detail: str = "Invalid file type"):
        super().__init__(status_code=400, detail=detail)

# Custom handler for the exception
async def invalid_file_type_exception_handler(request: Request, exc: InvalidFileTypeException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "detail": "Invalid file type error occurred"
        }
    )

# Dictionary for registering handlers (optional)
exception_handlers = {
    InvalidFileTypeException: invalid_file_type_exception_handler
}