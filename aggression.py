from datetime import datetime
pipeline_task_completion=[
    {
        "$match":{
            "status":"Completed"
        }
    },
    {
        "$group":{
            "_id":"$assigned_to",
            "total_tasks_completed":{"$sum":1}
        }
    },
    {
        "$project":{
            "employee_email": "$_id",
            "total_tasks_completed": 1,
            "_id": 0
        }
    }
]

pipeline_employee_performance=[
    {
        "$match":{
            "rating": {"$exists": True} 
        }
    },
    {
        "$group":{
            "_id": "$assigned_to",  # Group by employee email
            "average_rating": {"$avg": "$rating"},  # Calculate average rating
            "total_tasks_rated": {"$sum": 1} 
        }
    },
    {
        "$project":{
            "employee_email": "$_id",
            "average_rating": 1,
            "total_tasks_rated": 1,
            "_id": 0
        }
    }

]

pipeline_overdue_tasks=[
    {
        "$match":{
            "deadline": {"$lt": datetime.now()},  # Filter tasks with deadline before current date
            "status": {"$ne": "Completed"} 
        }
    },
    {
        "$group":{
            "_id": "$assigned_to",  # Group by employee email
            "total_overdue_tasks": {"$sum": 1}
        }
    },
    {
        "$project":{
            "employee_email": "$_id",
            "total_overdue_tasks": 1,
            "_id": 0
        }
    }
]