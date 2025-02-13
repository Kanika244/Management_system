import os
from fastapi import File, HTTPException, Depends,APIRouter, UploadFile
from bson import ObjectId
from database import task_collection , leave_collection
import aiofiles
from routes.auth import get_current_user
from models import LeaveRequest , LeaveResponse



router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/tasks/assigned/{email}")
async def get_assigned_tasks(email: str, current_user: str = Depends(get_current_user)):
    # Ensure the logged-in user can only access their own tasks

    print(f"Current User:{current_user}")
    print(f"Requested Email:{email}")

    current_user_email = current_user.get("email")

    if current_user_email != email:
        raise HTTPException(status_code=403, detail="Not authorized to access these tasks")

    # Fetch tasks assigned to the employee
    tasks = await task_collection.find({"assigned_to": email}).to_list(length=None)
    print("No of tasks Fetched:",len(tasks))

    # Convert ObjectId to string for JSON serialization
    for task in tasks:
        task["_id"] = str(task["_id"])

    return tasks

@router.patch("/tasks/update-status/{task_id}")
async def update_task_status(task_id: str, status: dict):
    try:
        result = await task_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": status["status"]}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"message": "Task status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating task status: {str(e)}")
    

@router.post("/upload_task_document/{task_id}")
async def upload_task_document(task_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Allow employees to upload documents for tasks"""

    # Validate task existence
    task = await task_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Generate file path
    file_ext = file.filename.split(".")[-1]
    if file_ext not in ["pdf", "docx", "png", "jpg", "jpeg"]:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    file_path = os.path.join(UPLOAD_DIR, f"{task_id}_{file.filename}")

    # Save file asynchronously
    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    # Update task with file URL
    file_url = f"/{UPLOAD_DIR}/{file.filename}"
    await task_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"documents": file_url}}
    )

    return {"message": "File uploaded successfully", "file_url": file_url}


@router.post("/request_leave")
async def request_leave(leave:LeaveRequest):
    try:
        leave_data = leave.dict(exclude={"id"})
        leave_data["status"] = "Pending" 
        result = await leave_collection.insert_one(leave_data)
        return {"message":"Leave Request submitted successfully","id":str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Error submitting leave request: {str(e)}")




