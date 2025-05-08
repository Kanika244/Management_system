const baseURL = "http://127.0.0.1:8000"; // Backend API URL
const token = localStorage.getItem("access_token"); // Admin authentication token
const email = localStorage.getItem("email");
// Redirect to the Admin Dashboard
function redirectToDashboard() {
  window.location.href = "/static/html/admin_dashboard.html";
}

async function fetchallNotifications(){
  try {
    console.log("Fetching all notifications with token:", token);

    const response = await fetch(`${baseURL}/get_allnotifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch notifications. Status: ${response.status}, Body: ${errorText}`);
    }

    const notifications = await response.json();
    console.log("Received notifications:", notifications);

    const notificationList = document.getElementById("notificationList");
    notificationList.innerHTML = "";

    if (!Array.isArray(notifications)) {
      throw new Error("Expected an array, got:", notifications);
    }

    if (notifications.length === 0) {
      notificationList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No notifications available.</td></tr>`;
      return;
    }

    notifications.forEach((notification) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${notification.email || "N/A"}</td>
        <td>${notification.title || "N/A"}</td>
        <td>${notification.message || "N/A"}</td>
      `;
      notificationList.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    alert("Error loading notifications: " + error.message);
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
      fetchallNotifications(); // Refresh notifications list
    } else {
      throw new Error("Failed to send notification.");
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    alert("Error: " + error.message);
  }
};


// Fetch notifications when the page loads
document.addEventListener("DOMContentLoaded", fetchallNotifications);
