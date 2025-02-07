from fastapi import APIRouter , HTTPException
from database import review_collection
from bson import ObjectId

router = APIRouter()

@router.get("/reviews/{email}")
async def get_performance_reviews(email:str):
    try:
        reviews = await review_collection.find({"employee_email":email}).to_list(length=None)
        
        if not reviews:
            return {"message":"No reviews found"}
        
        for review in reviews:
            review["_id"]=str(review["_id"])

        return {"reviews":reviews}
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Error fetching reviews{str(e)}")