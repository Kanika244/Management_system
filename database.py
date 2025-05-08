from motor.motor_asyncio import AsyncIOMotorClient
import gridfs
from pymongo import MongoClient

Mongo_url="mongodb://localhost:27017"
client = AsyncIOMotorClient(Mongo_url)

database = client["management"]
user_collection = database["user"]
otp_collection = database["otp"]
task_collection = database["tasks"]
token_collection=database["token"]
employee_collection = database["employee"]
review_collection = database["reviews"]
notification_collection = database["notifications"]
leave_collection = database["leave"]
holiday_collection = database["holiday"]
attendance_collection = database["attendance_records"]


sync_client = MongoClient(Mongo_url)
sync_db = sync_client["management"]
fs = gridfs.GridFS(sync_db)






