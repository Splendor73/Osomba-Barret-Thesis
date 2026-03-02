import boto3
from app.core.config import settings

def get_ses_client():
    return boto3.client(
        'ses',
        region_name=settings.aws_region if hasattr(settings, 'aws_region') else 'us-east-1'
    )

def send_notification_email(to_email: str, subject: str, html_content: str) -> bool:
    """Sends a transactional email using AWS SES."""
    try:
        ses = get_ses_client()
        response = ses.send_email(
            Source=settings.ses_from_email,
            Destination={'ToAddresses': [to_email]},
            Message={
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {
                    'Html': {'Data': html_content, 'Charset': 'UTF-8'}
                }
            }
        )
        print(f"[Email] Sent to {to_email}, MessageId: {response['MessageId']}")
        return True
    except Exception as e:
        print(f"[Email] Failed to send to {to_email}: {e}")
        return False
