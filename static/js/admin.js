const baseURL = "http://127.0.0.1:8000";
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

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch employees. Status: ${response.status}`);
    }




    const response_data = await response.json();
    const employees = response_data.employees  || [];
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


document.getElementById("searchEmployee").addEventListener("keyup",searchEmployees);

// Fetch employees when the page loads
document.addEventListener("DOMContentLoaded", searchEmployees);




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
            
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${task.status}</td>
                <td>${task.priority}</td>
                <td>${task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}</td>
                <td>${task.assigned_by}</td>
                <td>${task.assigned_to}</td>
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
