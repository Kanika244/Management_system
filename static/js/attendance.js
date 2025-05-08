// Elements
const dashboardSection = document.getElementById('dashboard-section');
const attendanceSection = document.getElementById('attendance-section');
const goToAttendanceBtn = document.getElementById('go-to-attendance-btn');
const processBtn = document.getElementById('process-btn');
const responseDiv = document.getElementById('response');
const backBtn = document.getElementById('back-btn');

// Navigation: Show attendance section
goToAttendanceBtn.addEventListener('click', () => {
    dashboardSection.style.display = 'none';
    attendanceSection.style.display = 'block';
    responseDiv.textContent = '';
    responseDiv.className = 'response';
});

// Process face (registration or attendance)
processBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/process_face/', {
            method: 'POST'
        });
        const result = await response.json();

        if (response.ok) {
            responseDiv.textContent = result.message;
            if (result.record_id) {
                responseDiv.textContent += ` (Record ID: ${result.record_id})`;
            }
            if (result.confidence) {
                responseDiv.textContent += ` (Confidence: ${result.confidence.toFixed(2)})`;
            }
            responseDiv.className = 'response success';
        } else {
            responseDiv.textContent = result.detail || 'Error processing face.';
            responseDiv.className = 'response error';
        }
    } catch (error) {
        console.error('Error:', error);
        responseDiv.textContent = 'Failed to connect to the server.';
        responseDiv.className = 'response error';
    }
});

// Back to dashboard
backBtn.addEventListener('click', () => {
    attendanceSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    responseDiv.textContent = '';
    responseDiv.className = 'response';
});

// Initial setup: Show dashboard by default
dashboardSection.style.display = 'block';
attendanceSection.style.display = 'none';