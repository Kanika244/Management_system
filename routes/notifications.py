from fastapi import APIRouter,HTTPException
from database import notification_collection
from typing import List
from bson import ObjectId
from models import Notification


router = APIRouter()

@router.post("/notifications/")
async def add_notification(notification:Notification):
    try:
        notification_data = notification.dict()
        result = await notification_collection.insert_one(notification_data)
        return {"message":"Notification added successfully","id":str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500,detail= f"Error adding notification{str(e)}"  )
    


@router.get("/get_notifications/{email}")
async def get_notifications(email: str):
    """Fetch notifications for a specific employee."""
    try:
        if not email:
            raise HTTPException(status_code=400, detail="Email is required.")
        
        notifications = await notification_collection.find({"email": email}).to_list(length=None)

        for noti in notifications:
            noti["id"] = str(noti["_id"])
            del noti["_id"]

            
        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")
    
@router.get("/get_allnotifications")
async def get_all():
    try:
        notifications = await notification_collection.find({}).to_list(length=None)

        for noti in notifications:
            noti["id"] = str(noti["_id"])
            del noti["_id"]

        return notifications
    except Exception as e :
        raise HTTPException(status_code=500,detail=f"Error fetching notifications{str(e)}")
    

