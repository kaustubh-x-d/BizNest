import os
import dns.resolver
from email_validator import validate_email, EmailNotValidError
from fastapi import HTTPException, status

DISPOSABLE_DOMAINS = {
    # Common disposable/temp domains
    "mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com",
    "yopmail.com", "dispostable.com", "getairmail.com", "throwawaymail.com",
    "temp-mail.org", "maildrop.cc", "sharklasers.com", "guerillamailblock.com",
    "guerillamail.net", "guerillamail.org", "guerillamail.biz", "guerillamail.co",
    "guerillamail.info", "guerillamail.de", "guerillamail.se", "guerillamail.xyz"
}

class EmailValidationService:
    @staticmethod
    def validate_email_address(email: str) -> str:
        """
        Validate email in the following order:
        1. Format validation using email-validator library.
        2. Disposable email domain check.
        3. DNS lookup for valid MX records.
        Returns the normalized email string.
        """
        # 1. Format Check
        try:
            valid_data = validate_email(email, check_deliverability=False)
            normalized_email = valid_data.normalized
            domain = valid_data.domain
        except EmailNotValidError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid email format: {str(e)}"
            )

        # 2. Disposable Email Check
        # Allow configuring additional domains via env variable
        extra_disposable_str = os.getenv("ADDITIONAL_DISPOSABLE_DOMAINS", "")
        disposable_set = DISPOSABLE_DOMAINS.copy()
        if extra_disposable_str:
            extra_domains = [d.strip().lower() for d in extra_disposable_str.split(",") if d.strip()]
            disposable_set.update(extra_domains)
            
        if domain.lower() in disposable_set:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Disposable or temporary email addresses are not allowed."
            )

        # 3. MX Records Check (DNS Lookup)
        try:
            answers = dns.resolver.resolve(domain, 'MX')
            if not answers:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email domain cannot receive emails (no MX records found)."
                )
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.Timeout, Exception):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email domain cannot receive emails (invalid domain or no MX records)."
            )

        return normalized_email
