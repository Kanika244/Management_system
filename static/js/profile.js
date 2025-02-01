const baseURL = "http://127.0.0.1:8000"; // API Base URL
const editProfileBtn = document.getElementById("editProfileBtn");
const editModal = document.getElementById("editModal");
const cancelEdit = document.getElementById("cancelEdit");
const editProfileForm = document.getElementById("editProfileForm");

// Fetch User Profile
async function fetchProfile() {
  const email = localStorage.getItem("email");
  if (!email) {
    console.error("User email not found in localStorage. Redirecting to login.");
    window.location.href = "/static/html/login.html"; // Redirect if email is missing
    return;
  }

  try {
    const response = await fetch(`${baseURL}/profile/email/${email}`); // Adjust API endpoint if needed
    if (response.ok) {
      const data = await response.json();

      // Fill profile details dynamically
      document.getElementById("userName").textContent = data.name || "Not Available";
      document.getElementById("userEmail").textContent = data.email || "Not Available";
      document.getElementById("userRole").textContent = data.role || "Not Available";

      // Optional: Load profile picture if available
      if (data.profile_picture) {
        document.getElementById("profilePic").src = data.profile_picture;
      }
    } else {
      console.error("Failed to fetch profile.");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

// Open Edit Modal
editProfileBtn.addEventListener("click", () => {
  editModal.style.display = "flex";

  // Pre-fill existing data into form fields
  document.getElementById("editName").value = document.getElementById("userName").textContent;
  document.getElementById("editEmail").value = document.getElementById("userEmail").textContent;
});

// Close Edit Modal
cancelEdit.addEventListener("click", () => {
  editModal.style.display = "none";
});

// Save Changes
editProfileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = localStorage.getItem("email");
  if (!email) {
    alert("User email not found. Please log in again.");
    return;
  }

  const updatedData = {
    name: document.getElementById("editName").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
  };

  const newPassword = document.getElementById("editNewPassword").value.trim();
  const currentPassword = document.getElementById("editCurrentPassword").value.trim();

  // If the user wants to change the password, require the current password
  if (newPassword) {
    if (!currentPassword) {
      alert("Please enter your current password to change the password.");
      return;
    }
    updatedData.password = newPassword;
    updatedData.current_password = currentPassword;
  }

  try {
    const response = await fetch(`${baseURL}/profile/update/${email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      alert("Profile updated successfully!");
      editModal.style.display = "none";
      fetchProfile(); // Refresh the profile details after updating
    } else {
      const errorData = await response.json();
      if (errorData.detail === "Incorrect current password") {
        alert("Incorrect current password. Please try again or contact your admin.");
      } else {
        alert("Failed to update profile.");
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
  }
});

// Load Profile on Page Load
fetchProfile();
