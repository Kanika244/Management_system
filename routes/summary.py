from fastapi import APIRouter , HTTPException
from datetime import datetime
from database import task_collection
from aggression import pipeline_employee_performance,pipeline_overdue_tasks,pipeline_task_completion

router = APIRouter()

@router.get("/summary")
async def get_summary():
    try:
        task_completion = await task_collection.aggregate(pipeline_task_completion).to_list(length=None)
        employee_performance=await task_collection.aggregate(pipeline_employee_performance).to_list(length=None)
        overdue_tasks=await task_collection.aggregate(pipeline_overdue_tasks).to_list(length=None)

        return{
            "task_Completion_summary":task_completion,
            "employee_performance_summary":employee_performance,
            "overdue_tasks":overdue_tasks
        }
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Error generating summary reports{str(e)}")