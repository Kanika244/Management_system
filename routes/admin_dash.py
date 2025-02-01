from fastapi import APIRouter, HTTPException
from database import user_collection, task_collection  # MongoDB connection
from models import Task  # Task model
from typing import List
from datetime import datetime

tasks=[]

router = APIRouter()

@router.post("/assign_task", response_model=dict)
async def assign_task_using_email(task: Task):
    # Check if the employee exists in the database
    employee = await user_collection.find_one({"email": task.assigned_to})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee with the given email not found.")

    # Prepare task data for insertion
    task_data = task.dict()
    
    # Insert the task into the task collection
    result = await task_collection.insert_one(task_data)

    # Return a success message with the task ID
    return {
        "message": "Task assigned successfully",
        "task_id": str(result.inserted_id)
    }
@router.get("/get_tasks")
async def get_tasks():
    try:
        tasks_cursor = await task_collection.find({}, {"_id": 1, "title": 1, "description": 1, "status": 1, "priority": 1, "deadline": 1, "assigned_by": 1, "assigned_to": 1}).to_list(length=None)
        current_date=datetime.now()
        overdue=[]
        for task in tasks_cursor:
            task["_id"] = str(task.get("_id", "")) 


            if task.get("deadline"):
                try:
                    if isinstance(task["deadline"], str):
                        deadline = datetime.fromisoformat(task["deadline"])
                       
                    else:
                         task["deadline"] = deadline 
                    
                    task["deadline"]=deadline


                    if deadline < current_date:
                        overdue.append(task)
                except ValueError:
                                     
                    print(f"Skipping task {task['_id']} due to invalid deadline format: {task['deadline']}")
                    continue
            
        if not tasks_cursor:
            return {"message": "No Tasks found"}
        
        return {
            "All_Tasks":tasks_cursor,
            "Overdue_tasks":overdue

            } 

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Loading tasks: {str(e)}")


    
