from fastapi import FastAPI , Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from routes import auth , employee , profile_routes , admin_dash , employee_manage , performance_reviews , summary
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static",StaticFiles(directory="static"),name="static")

app.include_router(auth.router,prefix="")
app.include_router(employee.router,prefix="")
app.include_router(profile_routes.router)
app.include_router(admin_dash.router)
app.include_router(employee_manage.router)
app.include_router(performance_reviews.router)
app.include_router(summary.router)

@app.get("/")
async def register_page():
    return FileResponse("static/html/register.html")