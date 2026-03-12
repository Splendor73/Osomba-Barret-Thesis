import sys
import os
sys.path.append(os.getcwd())

from app.services.email_service import send_notification_email
from app.core.config import settings

def test_email():
    print(f"Testing SES with From: {settings.ses_from_email}")
    # Sending to the verified recipient provided by the user
    to_email = "ypatel37@asu.edu" 
    subject = "Osomba Help: Verification Test"
    content = """
    <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
        <h2 style='color: #F67C01;'>Osomba Help</h2>
        <p>Hello,</p>
        <p>This is a test email to verify that your <b>Osomba Marketplace</b> notification system is working correctly.</p>
        <p>If you received this, it means your AWS SES configuration and the backend service are properly integrated.</p>
        <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />
        <p style='font-size: 12px; color: #888;'>Sent via AWS SES Production Identity Test.</p>
    </div>
    """
    
    success = send_notification_email(to_email, subject, content)
    if success:
        print(f"Email sent successfully to {to_email}!")
    else:
        print(f"Email failed to send to {to_email}.")

if __name__ == "__main__":
    test_email()
