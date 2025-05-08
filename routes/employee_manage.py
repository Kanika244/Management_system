from fastapi import HTTPException , APIRouter
from starlette.responses import JSONResponse
from models import Employee,EmployeeUpdate , DeleteResponse
from database import employee_collection
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter()

@router.post("/employees/")
async def create_employee(employee:Employee):
    existing_employee=await employee_collection.find_one({"name":employee.name})
    if existing_employee:
        raise HTTPException(status_code=400,detail="Employee already exists")
    
    employee_dict=employee.dict()
    employee_dict["_id"]=str(ObjectId())
    await employee_collection.insert_one(employee_dict)

    return {"message":"Employee added successfully"}


@router.get("/employees/",response_model=list[Employee])
async def get_employees():
    employees=[]
    async for employee in employee_collection.find():
        employee["id"]=str(employee["_id"])
        employees.append(employee)
    return employees


@router.delete("/employees/{id}",response_model=DeleteResponse)
async def delete_employee(id:str) -> JSONResponse:
    print("Recieved id:",id)
    try:
        object_id=ObjectId(id)
    except InvalidId as e:
        print(e)
        raise HTTPException(status_code=400, detail="Invalid ID format")
    

    delete_result = await employee_collection.delete_one({"_id": object_id})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    return JSONResponse(content={"message":"Item deleted Successfully"})


@router.patch("/employees/{id}",response_model=Employee)
async def update_employee(id:str , employee:EmployeeUpdate):
    print(id)
    try:
        object_id=ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400,detail="Invalid ID format")
    
    existing_employee= await employee_collection.find_one({"_id":object_id})
    print(existing_employee)
    if not existing_employee:
        raise HTTPException(status_code=400,detail="Employee not found")
    
    update_data=employee.model_dump(exclude=["id"])
    if not update_data:
        raise HTTPException(status_code=400,detail="No fields provided")
    
    await employee_collection.update_one(
        {"_id":object_id},
        {"$set":update_data}
    )

    updated_employee = await employee_collection.find_one({"_id": object_id})
    updated_employee["id"] = str(updated_employee["_id"])  # Convert ObjectId to string


    print(updated_employee)
    return updated_employee


