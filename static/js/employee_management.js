document.addEventListener("DOMContentLoaded", function () {
  fetchEmployees(); // Fetch employees when the page loads

  // Handle form submission to add a new employee
  document.getElementById("addEmployeeForm").onsubmit = async function (event) {
    event.preventDefault();

    const employee = {
      name: document.getElementById("name").value.trim(),
      role: document.getElementById("role").value.trim(),
      job_title: document.getElementById("job_title").value.trim(),
      department: document.getElementById("department").value.trim(),
    };

    try {
      const response = await fetch("/employees/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (response.ok) {
        alert("Employee added successfully!");
        document.getElementById("addEmployeeForm").reset(); // Clear the form
        fetchEmployees(); // Refresh the employee list
      } else {
        throw new Error("Failed to add employee.");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Error: " + error.message);
    }
  };
});

// Function to fetch all employees
async function fetchEmployees() {
  try {
    const response = await fetch("/employees/");
    if (!response.ok) {
      throw new Error("Failed to fetch employees.");
    }

    const employees = await response.json();
    const employeeList = document.getElementById("employeeList");
    employeeList.innerHTML = ""; // Clear previous entries

    if (employees.length === 0) {
      employeeList.innerHTML = `<tr><td colspan="5" style="text-align:center;">No employees found.</td></tr>`;
      return;
    }

    // Populate the table with employee data
    employees.forEach((employee) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.role}</td>
        <td>${employee.job_title}</td>
        <td>${employee.department}</td>
        <td>
          <button onclick="editEmployee('${employee.id}', this)">Edit</button>
          <button onclick="deleteEmployee('${employee.id}')">Delete</button>
        </td>
      `;
      employeeList.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    alert("Error loading employees. Please try again.");
  }
}

// Function to delete an employee by ID
async function deleteEmployee(id) {
  try {
    const response = await fetch(`/employees/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Employee deleted successfully!");
      fetchEmployees(); // Refresh the employee list
    } else {
      throw new Error("Failed to delete employee.");
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    alert("Error: " + error.message);
  }
}

// Function to enable inline editing for an employee
function editEmployee(id, button) {
  const row = button.closest("tr"); // Get the row containing the Edit button
  const cells = row.querySelectorAll("td");

  // Replace text with input fields
  cells[0].innerHTML = `<input class="edit-input" type="text" value="${cells[0].textContent}">`;
  cells[1].innerHTML = `<input class="edit-input" type="text" value="${cells[1].textContent}">`;
  cells[2].innerHTML = `<input class="edit-input" type="text" value="${cells[2].textContent}">`;
  cells[3].innerHTML = `<input class="edit-input" type="text" value="${cells[3].textContent}">`;

  // Replace Edit button with Save and Cancel buttons
  cells[4].innerHTML = `
    <button onclick="saveEmployee('${id}', this)">Save</button>
    <button onclick="cancelEdit(this)">Cancel</button>
  `;
}

// Function to save updated employee details
async function saveEmployee(id, button) {
  const row = button.closest("tr"); // Get the row containing the Save button
  const inputs = row.querySelectorAll(".edit-input");

  const updatedEmployee = {
    name: inputs[0].value.trim(),
    role: inputs[1].value.trim(),
    job_title: inputs[2].value.trim(),
    department: inputs[3].value.trim(),
  };

  try {
    const response = await fetch(`/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEmployee),
    });

    if (response.ok) {
      alert("Employee updated successfully!");
      fetchEmployees(); // Refresh the employee list
    } else {
      throw new Error("Failed to update employee.");
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    alert("Error: " + error.message);
  }
}

// Function to cancel editing and revert to the original data
function cancelEdit(button) {
  fetchEmployees(); // Refresh the employee list to revert changes
}