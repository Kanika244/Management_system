from pydantic import BaseModel,EmailStr
from typing import List , Optional
from datetime import datetime

class User(BaseModel):
    name:str
    email:EmailStr
    password:str
    role:str

class LoginRequest(BaseModel):
    email:EmailStr
    password:str

class Employee(BaseModel):
    id:str=None
    name:str
    role:str
    job_title:str
    department:str


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None

class Review(BaseModel):
    employee_email:str
    task_id:str
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
    otp:str



