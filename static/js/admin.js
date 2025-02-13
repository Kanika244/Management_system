const baseURL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access_token");
let currentPage=1;
const pageSize = 5;

document.addEventListener("DOMContentLoaded", function () {
    const modeToggle = document.getElementById("modeToggle");
    const icon = document.querySelector(".toggle-slider .icon");
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";
  
    // Apply saved mode
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      modeToggle.checked = true;
      icon.classList.replace("fa-sun", "fa-moon");
    }
  
    // Toggle Mode
    modeToggle.addEventListener("change", function () {
      if (modeToggle.checked) {
        document.body.classList.add("dark-mode");
        icon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("darkMode", "enabled");
      } else {
        document.body.classList.remove("dark-mode");
        icon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("darkMode", "disabled");
      }
    });
  
    fetchTasks();
  });


document.addEventListener("DOMContentLoaded", function () {
  fetchLeaveRequests(); // Fetch leave requests on page load
});

async function fetchLeaveRequests() {
  try {
      const response = await fetch(`${baseURL}/get_leave_requests`, {
          headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
          throw new Error("Failed to fetch leave requests.");
      }

      const leaveRequests = await response.json();
      const leaveList = document.getElementById("leaveList");
      leaveList.innerHTML = ""; // Clear existing entries

      if (leaveRequests.length === 0) {
          leaveList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No leave requests available.</td></tr>`;
          return;
      }

      leaveRequests.forEach(request => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${request.email}</td>
              <td>${request.reason}</td>
              <td>${request.status}</td>
              <td>
                  ${request.status === "Pending" ? `
                      <button class="approve-btn" onclick="updateLeaveStatus('${request.id}', 'Approved')">Approve</button>
                      <button class="reject-btn" onclick="updateLeaveStatus('${request.id}', 'Rejected')">Reject</button>
                  ` : request.status}
              </td>
          `;
          leaveList.appendChild(row);
      });

  } catch (error) {
      console.error("Error fetching leave requests:", error);
      alert("Error loading leave requests.");
  }
}

async function updateLeaveStatus(id, newStatus) {
  try {
    console.log(id)

    if (!id || id === "undefined") {  
      console.error("Error: Invalid leave request ID.");
      alert("Invalid leave request ID.");
      return;
  }

      const response = await fetch(`${baseURL}/update_leave_status/${id}`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
      });

      console.log(response.status)

      const responseData = await response.json();
      console.log("Response JSON:", responseData); 

      if (!response.ok) {
          throw new Error("Failed to update leave status.");
      }

      alert(`Leave request ${newStatus.toLowerCase()} successfully.`);
      fetchLeaveRequests(); // Refresh leave requests list

  } catch (error) {
      console.error("Error updating leave status:", error.message);
      alert(`Error updating leave request:${error.message}`);
  }
}


async function searchEmployees(page=1){
  
  const query = document.getElementById("searchEmployee").value.trim();
  const employeeList = document.getElementById("employeeList");
  const pageNumber = document.getElementById("pageNumber");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");

  try {
    let url = `${baseURL}/get_employees/?page=${page}&limit=${pageSize}`;
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }

    console.log(`Fetching data from ${url}`)

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch employees. Status: ${response.status}`);
    }




    const response_data = await response.json();
    console.log(response_data)

    const employees = response_data.employees  || [];
    const total = response_data.total || 0;
    const totalPages = Math.ceil(response_data.total / pageSize);


    employeeList.innerHTML = ""; // Clear existing entries

    if (!Array.isArray(employees)) {
      throw new Error("Expected 'employees' to be an array but got something else.");
  }

    if (employees.length === 0) {
      employeeList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No employees found.</td></tr>`;
      return;
    }

    employees.forEach((employee) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.role}</td>
        <td>${employee.job_title}</td>
        <td>${employee.department}</td>
      `;
      employeeList.appendChild(row);
    });

    pageNumber.textContent = `Page ${page} of ${totalPages}`;
    prevPage.disabled = page === 1;
    nextPage.disabled = page === totalPages;

    currentPage = page;

  } catch (error) {
    console.error("Error fetching employees:", error);
    alert("Error loading employees. Please try again.");
  }
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    searchEmployees(currentPage - 1);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  searchEmployees(currentPage + 1);
});


document.getElementById("searchEmployee").addEventListener("keyup",searchEmployees(1));

// Fetch employees when the page loads
document.addEventListener("DOMContentLoaded", searchEmployees(1));




// Function to open the modal with fade-in effect
function openModal() {
  const modal = document.getElementById('assignTaskModal');
  const overlay = document.getElementById('overlay');

  modal.style.display = 'block';
  overlay.style.display = 'block';

  // Smooth fade-in effect
  setTimeout(() => {
      modal.style.opacity = '1';
      overlay.style.opacity = '1';
  }, 50);
}

// Function to close the modal with fade-out effect
function closeModal() {
  const modal = document.getElementById('assignTaskModal');
  const overlay = document.getElementById('overlay');

  // Smooth fade-out effect
  modal.style.opacity = '0';
  overlay.style.opacity = '0';

  setTimeout(() => {
      modal.style.display = 'none';
      overlay.style.display = 'none';
  }, 300); // Wait for animation to complete
}


  
// Function to handle form submission
document.getElementById('assignTaskForm').onsubmit = async function(event) {
  event.preventDefault(); // Prevent default form submission

  // Gather form data
  const formData = {
      assigned_to: document.getElementById('assignedToEmail').value.trim(),
      title: document.getElementById('taskTitle').value.trim(),
      description: document.getElementById('taskDescription').value.trim(),
      status: document.getElementById('taskStatus').value,
      priority: document.getElementById('taskPriority').value,
      deadline: document.getElementById('taskDeadline').value,
      assigned_by: document.getElementById('assignedBy').value.trim(),
  };

  // Ensure required fields are not empty
  if (!formData.assigned_to || !formData.title || !formData.description || !formData.deadline || !formData.assigned_by) {
      alert("Please fill in all required fields.");
      return;
  }

  try {
      // Send the data to the FastAPI backend
      const response = await fetch('/assign_task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
      });

      if (response.ok) {
          const result = await response.json();
          alert(result.message); // Show success message

          closeModal(); // Close the modal
          document.getElementById('assignTaskForm').reset(); // Reset the form

          fetchTasks(); // Refresh task list after assignment
      } else {
          throw new Error("Failed to assign task.");
      }
  } catch (error) {
      console.error("Task assignment error:", error);
      alert("Error: " + error.message);
  }
};

// Function to close modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById('assignTaskModal');
  const overlay = document.getElementById('overlay');

  if (event.target === overlay) {
      closeModal();
  }
};


async function fetchTasks() {
  try {
      const response = await fetch('/get_tasks'); 
      console.log("API Response",response)
      if (!response.ok) {
          throw new Error("Failed to fetch tasks.");
      }

      const tasks = await response.json();
      console.log("Tasks Data:",tasks)
      if (tasks.message){
        document.getElementById("taskList").innerHTML=`<tr><td colspan="7">${tasks.message}</td></tr>`;
        return;
      }

      const taskList = document.getElementById("taskList")
      taskList.innerHTML = ""; 

      tasks.All_Tasks.forEach(task => {
            const row = document.createElement("tr");

            let documentLinks = "No documents";
            if (task.documents.length > 0) {
                documentLinks = task.documents
                  .map(doc => `<a href="${baseURL}/download_document/${doc.split("/").pop()}" target="_blank">Download</a>`)
                  .join(", ");
            }
            
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${task.status}</td>
                <td>${task.priority}</td>
                <td>${task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}</td>
                <td>${task.assigned_by}</td>
                <td>${task.assigned_to}</td>
                <td> ${documentLinks}</td>
            `;
            
            taskList.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        document.getElementById("taskList").innerHTML = `<tr><td colspan="7">Error loading tasks</td></tr>`;
    }
}


document.addEventListener("DOMContentLoaded", fetchTasks);

function redirectToNotifications() {
    window.location.href = "/static/html/notifications.html";
  }
  


function redirectToEmployeeManagement(){
  window.location.href="/static/html/employee_manage.html"
}

function redirectToPerformance(){
    window.location.href="/static/html/performance.html"
}

// Call fetchTasks when the page loads
document.addEventListener("DOMContentLoaded", fetchTasks);
