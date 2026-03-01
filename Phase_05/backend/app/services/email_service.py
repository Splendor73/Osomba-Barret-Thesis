import sendgrid
from sendgrid.helpers.mail import Mail
from app.core.config import settings

def send_notification_email(to_email: str, subject: str, html_content: str) -> bool:
    """Sends a transactional email utilizing SendGrid."""
    if not settings.sendgrid_api_key:
        print(f"[Email Service] Skipped sending to {to_email}. SENDGRID_API_KEY is not configured.")
        return False
        
    sg = sendgrid.SendGridAPIClient(api_key=settings.sendgrid_api_key)
    message = Mail(
        from_email="no-reply@osomba.com",
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    
    try:
        response = sg.send(message)
        if response.status_code in [200, 201, 202]:
            return True
        return False
    except Exception as e:
        print(f"[Email Service] Failed to send email to {to_email}: {e}")
        return False
