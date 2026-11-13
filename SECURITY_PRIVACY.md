# Security, Privacy, Safety and Trust

## Baseline security
- Use established authentication libraries/providers; never invent cryptography.
- Secure session handling, cookie flags and CSRF protections as appropriate.
- Enforce authorization server-side on every protected action.
- Validate and normalize inputs server-side.
- Use parameterized database access.
- Encode/sanitize user-generated content; prevent XSS.
- Protect against CSRF, SSRF, injection, IDOR/BOLA, brute force and enumeration.
- Rate-limit login, class joining, game invitations, posting, comments and reporting.
- Secure file uploads with type/size validation and safe storage.
- Set security headers and a restrictive Content Security Policy appropriate to the app.
- Keep secrets in environment/secret managers; never commit them.
- Log security events without logging passwords, tokens or sensitive payloads.
- Run dependency and secret scanning in CI.

## Privacy
- Collect only data needed for the stated feature.
- Explain data use in plain language.
- Provide account data export/deletion workflows appropriate to applicable law.
- Define retention for logs, reports, classroom records and deleted accounts.
- Do not expose student email or private progress publicly by default.
- Give educators access only to their own classrooms and authorized reports.
- Avoid collecting exact birth dates unless necessary; use age bands where practical.
- Review child/teen privacy obligations for intended launch markets before release.

## Community safety
- Reporting, blocking/muting and moderator review.
- Spam and abuse rate limits.
- Clear community rules.
- Audit moderator actions.
- Do not expose private messages or classroom discussions to public search.
- Design safeguards for younger users.

## Financial education safeguards
- Simulations use virtual funds only.
- No real trade execution, brokerage login or payment wallet.
- Clearly state that scenarios are educational and not personalized financial advice.
- Explain assumptions, risk and uncertainty.
- Never guarantee returns.
- Label market data as live, delayed, historical, fictional or sample as applicable.
- Do not encourage leverage, speculation or risky financial behaviour through rewards.
- Ensure all example returns and outcomes are illustrative.

## Admin safety
- Strong role separation.
- Least privilege.
- MFA for privileged accounts where supported.
- Audit sensitive actions.
- Confirmation for destructive operations.
- No public admin endpoints.
