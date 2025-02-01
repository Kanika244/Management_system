import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random


def generate_otp(length=6):
    """Generate a numeric OTP of specified length."""
    return ''.join(random.choices("0123456789", k=length))


def send_email_smtplib(sender_email, recipient_email, subject, body, smtp_server, smtp_port, username, password):
    """Send an email using smtplib."""
    try:
        # Create MIME message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = subject

        # Attach the email body
        msg.attach(MIMEText(body, 'plain'))

        # Connect to SMTP server and send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Start TLS for security
            server.login(username, password)
            server.send_message(msg)

    except Exception as e:
        raise RuntimeError(f"Failed to send email: {e}")
