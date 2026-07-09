import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger("uvicorn.error")

# SMTP Configuration loaded dynamically from OS environment
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def send_verification_email(email: str, token: str, full_name: str) -> None:
    """
    Send an email verification link to the user.
    If SMTP parameters are missing, logs it to stdout/console.
    """
    verification_link = f"{FRONTEND_URL}/verify?token={token}"
    
    subject = "Verify Your BizNest Account"
    html_content = f"""
    <html>
      <body style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">BizNest</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Hi {full_name},</h2>
          <p style="font-size: 14px;">Welcome to BizNest! Before accessing our location intelligence and feasibility engine, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">Or copy and paste this link in your browser:</p>
          <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">{verification_link}</p>
          <div style="border-t: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
            This link is valid for 24 hours. If you did not register for BizNest, please ignore this email.
          </div>
        </div>
      </body>
    </html>
    """

    # If SMTP is not fully configured, log the link and mock send
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD]):
        logger.warning("==========================================================================")
        logger.warning(" [MOCK EMAIL] Verification Email Sent!")
        logger.warning(f" Target User: {full_name} ({email})")
        logger.warning(f" Verification Link: {verification_link}")
        logger.warning(" (Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD to send real emails)")
        logger.warning("==========================================================================")
        return

    # Real SMTP send
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"BizNest Verification <{SMTP_USER}>"
        msg["To"] = email
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, email, msg.as_string())
        logger.info(f"Verification email successfully sent to {email} via SMTP.")
    except Exception as e:
        logger.error(f"Failed to send SMTP verification email to {email}: {e}")
        # Fall back to logging the link
        logger.warning(f"Email Fail Fallback Link: {verification_link}")
