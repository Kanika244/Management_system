const baseURL = "http://127.0.0.1:8000"; // Backend API URL
const token = localStorage.getItem("access_token"); // Admin authentication token
const email = localStorage.getItem("email");
// Redirect to the Admin Dashboard
function redirectToDashboard() {
  window.location.href = "/static/html/admin_dashboard.html";
}

// Fetch and display all notifications
async function fetchNotifications() {
  try {
    const response = await fetch(`${baseURL}/get_notifications/${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications.");
    }

    const notifications = await response.json();
    const notificationList = document.getElementById("notificationList");
    notificationList.innerHTML = ""; // Clear existing entries

    if (notifications.length === 0) {
      notificationList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No notifications available.</td></tr>`;
      return;
    }

    notifications.forEach((notification) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${notification.email}</td>
        <td>${notification.title}</td>
        <td>${notification.message}</td>
        
      `;
      notificationList.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    alert("Error loading notifications. Please try again.");
  }
}

// Handle notification form submission
document.getElementById("notificationForm").onsubmit = async function (event) {
  event.preventDefault(); // Prevent default form submission

  const notificationData = {
    email: document.getElementById("recipientEmail").value.trim(),
    title: document.getElementById("notificationTitle").value.trim(),
    message: document.getElementById("notificationMessage").value.trim(),
  };

  if (!notificationData.email || !notificationData.title || !notificationData.message) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  try {
    const response = await fetch(`${baseURL}/notifications/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notificationData),
    });

    if (response.ok) {
      alert("Notification sent successfully!");
      document.getElementById("notificationForm").reset(); // Clear the form
      fetchNotifications(); // Refresh notifications list
    } else {
      throw new Error("Failed to send notification.");
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    alert("Error: " + error.message);
  }
};


// Fetch notifications when the page loads
document.addEventListener("DOMContentLoaded", fetchNotifications);
