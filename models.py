from pydantic import BaseModel,EmailStr, Field
from typing import List , Optional
from datetime import datetime

class User(BaseModel):
    name:str= Field(..., pattern="^[A-Za-z ]{2,}$", description="Name should contain only letters and spaces, min 2 characters.")
    email:str = Field(...,pattern="^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",description="Invalid email format.")
    password:str
    role:str

class LoginRequest(BaseModel):
    email:EmailStr
    password:str

class Employee(BaseModel):
    _id:Optional[str]=None
    name:str
    role:str
    job_title:str
    department:str
    face_data:Optional[bytes]=None


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None

class Review(BaseModel):
    employee_email:str
    task_id:str = Field(...,pattern="^[a-fA-F0-9]{24}$",description="Invalid TaskID format")
    rating:int
    comments:str
    review_date:datetime



class Task(BaseModel):
    title:str
    description:str
    status:str
    priority:str
    deadline:datetime
    assigned_by:str
    assigned_to:str
    documents:Optional[List[str]]=Field(default=[],description="List of Uploaded document urls")

class UserProfile(BaseModel):
    name:str
    email:EmailStr
    role:str
    
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None 


class OTPverify(BaseModel):
    email:EmailStr
    otp:str = Field(...,pattern="^d{6}$", description="OTP should be 6 digit")

class Notification(BaseModel):
    id:str = None
    title:str
    message:str
    email:str
    timestamp:datetime = datetime.utcnow()

class EmployeeResponse(BaseModel):
    employees:List[Employee]
    total:int

class LeaveRequest(BaseModel):
    id:Optional[str] = Field(None , alias = "_id")
    email:str
    reason:str  =Field(...,min_length=5,max_length=500,description="Reason should be 5-500 characters long")
    status:str ="Pending"

class LeaveResponse(BaseModel):
    id:str
    status:str

class LeaveStatusUpdate(BaseModel):
    status:str

class DeleteResponse(BaseModel):
    message:str

class Holiday(BaseModel):
    name:str
    date:datetime
    type:str

class ChatRequest(BaseModel):
    user_message:str

class Attendance(BaseModel):
    id: Optional[str]
    face_img: bytes
    timestamp: datetime
    status: str
















