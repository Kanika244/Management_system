from fastapi import APIRouter, Depends ,HTTPException , status
from database import user_collection , otp_collection , token_collection
from models import User , LoginRequest , OTPverify
from bson import ObjectId
from datetime import datetime,timedelta
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from utils import generate_otp , send_email_smtplib
import jwt

router = APIRouter()

SECRET_KEY="1567fj62kk2jrj7j"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password:str)->str:
    return pwd_context.hash(password)

def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context.verify(plain_password,hashed_password)

def create_token(data:dict , expires_delta:timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/register/")
async def register_user(data:User):
    user_in_db=await user_collection.find_one({"email":data.email})
    if user_in_db:
        raise HTTPException(status_code=400,detail="Already Registered")
    
    hashed_pass = hash_password(data.password)
    user_dict = data.dict(exclude={"id"})
    user_dict["id"]=str(ObjectId())
    user_dict["password"]=hashed_pass

    await user_collection.insert_one(user_dict)

    otp = generate_otp()
    otp_data={
        "email":data.email,
        "otp":otp,
        "expires_at":datetime.utcnow()+timedelta(minutes=5)
}
    print(otp_data)
    try:
        store_otp = await otp_collection.insert_one(otp_data)
        print(store_otp)
    except Exception as e:
        raise HTTPException(status_code=400,detail=f"Error storing data {str(e)}")
        
    if store_otp:
        send_email_smtplib(
            sender_email="kanikajain0610@gmail.com",
            recipient_email=data.email,
            subject="Your OTP Code",
            body=f"Your OTP is {otp}. It will expire in 5 minutes.",
            smtp_server="smtp.gmail.com",
            smtp_port=587,
            username="kanikajain0610@gmail.com",
            password="shqa nqzt cbbl ctoh",
        )

    return{"message":"User Registered Successfully! OTP sent."}


@router.post("/verify/")
async def verify_otp(data:OTPverify):
    email = data.email
    otp = data.otp
    print(f"Recieved otp {otp}")
    otp_record = await otp_collection.find_one({"email":email})
    print(otp_record)
    print("Record found")
    
    if not otp_record :
        print("otp not found")
        raise HTTPException(status_code=400,detail="Invalid OTP")
    
    if  otp_record["otp"]!=otp:
        raise HTTPException(status_code=400,detail="Invalid OTP")
    
    if otp_record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400,detail="OTP has expired")
    await otp_collection.delete_one({"email":email})

@router.post("/login/")
async def login(login_data:LoginRequest):
    email=login_data.email
    password = login_data.password


    user_in_db = await user_collection.find_one({"email": email})
    if not user_in_db or not verify_password(password, user_in_db["password"]):
        raise HTTPException(status_code=401, detail="Invalid login or password")
    

    await token_collection.delete_many({"email":email})
    

    user_data = {"email": user_in_db["email"], "id": str(user_in_db["_id"])}
    access_token = create_token(data=user_data)
    token_data={
        "email":email,
        "access_token":access_token,
        "created_at":datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    await token_collection.insert_one(token_data)
    return {"access_token": access_token, "token_type": "bearer", "role":user_in_db["role"]}



@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Verify the token and extract the payload
        payload = verify_token(token)
        
        # Ensure the payload contains the required fields
        if "id" not in payload or "email" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        
        # Return the user information
        return {"user_id": payload["id"], "email": payload["email"]}
    
    except HTTPException:
        # Re-raise HTTPException (e.g., from verify_token)
        raise
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
