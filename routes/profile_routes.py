from fastapi import APIRouter, HTTPException
from database import user_collection
from models import UserProfile , UserUpdate  # Ensure this matches your model

router = APIRouter()

@router.get("/profile/email/{email}", response_model=UserProfile)
async def get_profile_by_email(email: str):
    """
    Fetch a user profile using their email.
    """
    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user["id"] = str(user["_id"])  # Convert ObjectId to string
    return user


@router.put("/profile/update/{email}")
async def update_profile(email: str, profile_data: UserUpdate):
    """
    Update the profile of a user using their email.
    """
    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    await user_collection.update_one(
        {"email": email},
        {"$set": profile_data.dict()}
    )
    
    return {"message": "Profile updated successfully"}