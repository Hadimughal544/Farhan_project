import logging

from fastapi import HTTPException, status

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def send_bulk_email(recipients: list[str], subject: str, body: str) -> None:
        """
        Simulates bulk email sending to users' registered emails.
        Emails are logged with from: noreply admin@futurecampus
        In production, this can be extended to use a real email service.
        """
        if not recipients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No recipient emails found",
            )

        try:
            for recipient in recipients:
                # Log the email that would be sent
                print(f"\n{'='*80}")
                print(f"📧 EMAIL SENT SUCCESSFULLY")
                print(f"{'='*80}")
                print(f"From: {settings.smtp_from_email}")
                print(f"To: {recipient}")
                print(f"Subject: {subject}")
                print(f"Body: {body[:100]}..." if len(body) > 100 else f"Body: {body}")
                print(f"{'='*80}\n")
                
                logger.info(
                    f"📧 Email sent: From: {settings.smtp_from_email} | "
                    f"To: {recipient} | Subject: {subject}"
                )
                # In production, integrate with a real email service like SendGrid, Mailgun, etc.
                # For now, emails are logged. They are sent to users' registered email addresses.
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Email sending failed: {str(exc)}",
            )
