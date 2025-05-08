from fastapi import APIRouter , HTTPException
from models import LeaveStatusUpdate
from database import leave_collection
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

router = APIRouter()

@router.get("/get_leave_requests")
async def get_leave_requests():
    try:
        requests = await leave_collection.find().to_list(length=None)


        serialized_requests = [
            {**leave, "_id": str(leave["_id"])} for leave in requests
        ]
        return jsonable_encoder(serialized_requests)
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Error fetching requests: {str(e)}")
    
@router.patch("/update_leave_status/{id}")
async def update_leave_status(id: str, update_data:LeaveStatusUpdate):
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail="Invalid leave request ID format")

        result = await leave_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": update_data.status}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Leave request not found")

        return {"message": "Leave status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating leave status: {str(e)}")