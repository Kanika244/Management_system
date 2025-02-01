const baseURL = "http://127.0.0.1:8000";

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const registerContainer = document.getElementById("registerContainer");

let userEmail = "";

// Handle Registration
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name=document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role=document.getElementById("role").value;
  
    try {
      const response = await fetch(`${baseURL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name , email, password, role}),
      });
  
      const data = await response.json();
      if (response.ok) {
        userEmail = email;
        localStorage.setItem("userEmail",email);
        registerMessage.textContent = data.message;
        registerMessage.style.color = "green";
        setTimeout(() =>{
            window.location.href="/static/html/otp.html";
        },2000);
      
      } else {
        registerMessage.textContent = data.detail || "Registration failed.";
        registerMessage.style.color = "red";
      }
    } catch (error) {
      registerMessage.textContent = "An error occurred during registration.";
      registerMessage.style.color = "red";
    }
  });
  