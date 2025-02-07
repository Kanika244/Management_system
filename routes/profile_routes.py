from fastapi import APIRouter, File, HTTPException, UploadFile
from database import user_collection
from models import UserProfile , UserUpdate
import os
import shutil

router = APIRouter()
UPLOAD_FOLDER = "static/images/"
os.makedirs(UPLOAD_FOLDER,exist_ok=True)

@router.post("/profile/upload_image/{email}")
async def upload_profile(email: str, file:UploadFile = File(...)):
    user = await user_collection.find_one({"email":email})
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    file_location = f"{UPLOAD_FOLDER}{email}.jpg"
    with open(file_location,"wb") as buffer:
        shutil.copyfileobj(file.file , buffer)

    image_url = f"/static/images/{email}.jpg"
    print(image_url)
    await user_collection.update_one(
        {"email":email},
        {"$set":{"profile_picture":image_url}}
    )


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