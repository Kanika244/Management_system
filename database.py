from motor.motor_asyncio import AsyncIOMotorClient

Mongo_url="mongodb://localhost:27017"
client = AsyncIOMotorClient(Mongo_url)

database = client["management"]
user_collection = database["user"]
otp_collection = database["otp"]
task_collection = database["tasks"]
token_collection=database["token"]
employee_collection = database["employee"]
review_collection = database["reviews"]