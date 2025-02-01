
from fastapi import HTTPException, Depends,APIRouter
from bson import ObjectId
from database import task_collection
from routes.auth import get_current_user



router = APIRouter()


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



