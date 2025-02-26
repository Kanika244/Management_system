from fastapi import APIRouter, HTTPException, Query
from database import user_collection, task_collection , employee_collection  # MongoDB connection
from models import Task  , Employee,EmployeeResponse# Task model
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
    

@router.get("/get_employees",response_model=EmployeeResponse)
async def search_employees(query: str = Query(None, description="Search employees by name, role, job title, or department"),
                           page:int=Query(1,description="Page Number",ge=1),
                           limit:int=Query(5,description="Number of results per page",ge=1,le=50)):
      try:
        filter_query = {}

        if query:
            filter_query={
                 "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"role": {"$regex": query, "$options": "i"}},
                {"job_title": {"$regex": query, "$options": "i"}},
                {"department": {"$regex": query, "$options": "i"}},
            ]

            }

           
        

        total = await employee_collection.count_documents(filter_query)
        print(total)
        employee_data= await employee_collection.find(filter_query).skip((page - 1) * limit).limit(limit).to_list(length=None)

        employees = [
            Employee(
                id=str(emp["_id"]),  # Convert ObjectId to string
                name=emp["name"],
                role=emp["role"],
                job_title=emp["job_title"],
                department=emp["department"]
            )
            for emp in employee_data
        ]
        return EmployeeResponse(employees=employees,total=total)

      except Exception as e:
          raise HTTPException(status_code=500, detail=f"Error fetching employees: {str(e)}")

    
