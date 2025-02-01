const baseURL = "http://127.0.0.1:8000";


const otpForm = document.getElementById("otpForm");
const otpMessage = document.getElementById("otpMessage");
const otpContainer = document.getElementById("otpContainer");

let userEmail = localStorage.getItem("userEmail");



otpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const otp = document.getElementById("otp").value;

  try {
    const response = await fetch(`${baseURL}/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, otp }),
    });

    const data = await response.json();
    if (response.ok) {
      otpMessage.textContent = data.message;
      otpMessage.style.color = "green";
      setTimeout(()=>{
        window.location.href="/static/html/login.html";
      },2000);
    } else {
      otpMessage.textContent = data.detail || "Invalid OTP.";
      otpMessage.style.color = "red";
    }
  } catch (error) {
    otpMessage.textContent = "An error occurred during OTP verification.";
    otpMessage.style.color = "red";
  }

 
});
