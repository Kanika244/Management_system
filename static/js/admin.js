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

// Fetch tasks dynamically (Call this function when needed)
async function fetchTasks() {
  try {
      const response = await fetch('/get_tasks'); // API to fetch stored tasks
      if (!response.ok) {
          throw new Error("Failed to fetch tasks.");
      }

      const tasks = await response.json();
      const taskList = document.querySelector("#taskTable tbody");
      taskList.innerHTML = ""; // Clear previous entries

      if (!Array.isArray(tasks)||tasks.length === 0) {
          taskList.innerHTML = `<tr><td colspan="7" style="text-align:center;">No tasks assigned yet.</td></tr>`;
          return;
      }

      tasks.forEach(task => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${task.title}</td>
              <td>${task.description}</td>
              <td>${task.status}</td>
              <td>${task.priority}</td>
              <td>${task.deadline}</td>
              <td>${task.assigned_by}</td>
              <td>${task.assigned_to}</td>
          `;
          taskList.appendChild(row);
      });
  } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Error loading tasks. Please try again.");
  }
}
function redirectToEmployeeManagement(){
  window.location.href="/static/html/employee_manage.html"
}

function redirectToPerformance(){
    window.location.href="/static/html/performance.html"
}

// Call fetchTasks when the page loads
document.addEventListener("DOMContentLoaded", fetchTasks);
