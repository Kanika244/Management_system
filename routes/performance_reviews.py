from fastapi import APIRouter, Request
from database import review_collection  # MongoDB connection for performance reviews
from models import Review  # Import the PerformanceReview model
from bson import ObjectId
from datetime import datetime


router = APIRouter()



@router.post("/performance_reviews/")
async def create_performance_review(review: Review,request:Request):
    review_data = review.dict()
    review_data["review_date"] = datetime.now()  # Set the review date to now

    
    result = await review_collection.insert_one(review_data)
    return {
        "message": "Performance review created successfully",
        "review_id": str(result.inserted_id)
    }

@router.get("/performance_reviews/{employee_email}", response_model=list[Review])
async def get_performance_reviews(employee_email: str):
    # Fetch performance reviews for the specified employee
    reviews_cursor = review_collection.find({"employee_email":employee_email})
    reviews = await reviews_cursor.to_list(length=None)

    # Convert ObjectId to string for each review
    for review in reviews:
        review["_id"] = str(review["_id"])  # Convert ObjectId to string

    if not reviews:
        return {"message": "No performance reviews found for this employee."}

    return reviews