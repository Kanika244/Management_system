const baseURL = "http://127.0.0.1:8000";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginContainer = document.getElementById("loginContainer");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  console.log("Login form submitted");
  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const response = await fetch(`${baseURL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password}),
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    if (response.ok) {
      console.log("Role:", data.role);
      if (data.role === "EMPLOYEE") {
        console.log("Role is EMPLOYEE. Redirecting to employee dashboard...");
        loginMessage.textContent = "Login successful!";
        loginMessage.style.color = "green";

        // Store user data in localStorage
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("email", email);
        localStorage.setItem("role", data.role);

        // Redirect to employee dashboard
        window.location.href = "/static/html/emp_dashboard.html";
      } else if (data.role === "MANAGER" || data.role === "ADMIN") {
        console.log("Role is MANAGER or ADMIN. Redirecting to admin dashboard...");
        loginMessage.textContent = "Login successful!";
        loginMessage.style.color = "green";

        // Store user data in localStorage
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("email", email);
        localStorage.setItem("role", data.role);

        // Redirect to admin dashboard
        window.location.href = "/static/html/admin_dashboard.html";
      } else {
        console.log("Unknown role. Access denied.");
        loginMessage.textContent = "Access restricted.";
        loginMessage.style.color = "red";
      }
    } else {
      console.log("Invalid login credentials.");
      loginMessage.textContent = data.detail || "Invalid login credentials.";
      loginMessage.style.color = "red";
    }
  } catch (error) {
    console.error("Error during login:", error);
    loginMessage.textContent = "An error occurred during login.";
    loginMessage.style.color = "red";
  }
});
