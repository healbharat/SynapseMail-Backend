# SynapseMail Domain Configuration Guide

To ensure high deliverability and prevent your emails from being marked as spam by Gmail/Outlook, configure the following DNS records for your domain (`synapsemail.com`).

## 1. MX Record (Mail Exchange)
Points to the server responsible for receiving emails.
- **Type**: MX
- **Name**: `@`
- **Value**: `feedback-smtp.us-east-1.amazonses.com` (Example, replace with your SMTP provider's MX endpoint)
- **Priority**: `10`

## 2. SPF Record (Sender Policy Framework)
Specifies which mail servers are authorized to send email on behalf of your domain.
- **Type**: TXT
- **Name**: `@`
- **Value**: `v=spf1 include:_spf.resend.com ~all` (Example for Resend, replace with your provider's SPF)

## 3. DKIM (DomainKeys Identified Mail)
Provides a digital signature to verify the email was sent by the domain owner.
- **Type**: TXT/CNAME (Depending on provider)
- **Examples**:
  - `resend1._domainkey.yourdomain.com` -> `resend1.yourdomain.com.dkim.resend.com`
  - `resend2._domainkey.yourdomain.com` -> `resend2.yourdomain.com.dkim.resend.com`

## 4. DMARC (Domain-based Message Authentication, Reporting, and Conformance)
Tells receiving servers what to do if SPF or DKIM fails.
- **Type**: TXT
- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=quarantine; adkim=r; aspf=r;`
  - `p=quarantine`: Moves failed emails to Spam.
  - `p=reject`: Blocks failed emails entirely.

---

## SMTP Provider Recommendations
For production without AWS, we recommend:
1. **Resend**: extremely clean API and great free tier.
2. **Brevo**: Reliable SMTP with generous daily limits.
3. **Mailgun**: Industry standard for high volume.
