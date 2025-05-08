from fastapi import APIRouter , HTTPException , Response
from datetime import datetime
from database import task_collection
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from aggression import pipeline_employee_performance,pipeline_overdue_tasks,pipeline_task_completion

router = APIRouter()

@router.get("/summary")
async def get_summary():
    try:
        task_completion = await task_collection.aggregate(pipeline_task_completion).to_list(length=None)
        print(task_completion)
        employee_performance=await task_collection.aggregate(pipeline_employee_performance).to_list(length=None)
        print(employee_performance)
        overdue_tasks=await task_collection.aggregate(pipeline_overdue_tasks).to_list(length=None)

        return{
            "task_Completion_summary":task_completion,
            "employee_performance_summary":employee_performance,
            "overdue_tasks":overdue_tasks
        }
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Error generating summary reports{str(e)}")
    




@router.get("/download-report")
async def download_report():
    pdf_filename = "employee_performance_report.pdf"
    pdf_buffer = generate_pdf()

    return Response(content=pdf_buffer,media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={pdf_filename}"
    })

def generate_pdf():
    from io import BytesIO
    buffer = BytesIO()

    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(200, 750, "Employee Performance Report")

    c.setFont("Helvetica", 12)
    c.drawString(100, 720, "Total Completed Tasks: 20")
    c.drawString(100, 700, "Average Rating: 4.5")
    c.drawString(100, 680, "Total Overdue Tasks: 3")

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer.getvalue()
    