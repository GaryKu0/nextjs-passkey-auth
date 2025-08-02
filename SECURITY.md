# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The security of our users and their data is extremely important to us. If you have found a security vulnerability in this project, we would appreciate your help in disclosing it to us in a responsible manner.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them by emailing the maintainer directly. You should receive a response within 48 hours. If for some reason you do not, please follow up to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

### What to Expect

After you submit a report, we will:

1. **Acknowledge** your email within 48 hours
2. **Investigate** the issue and determine its severity
3. **Develop** a fix for the issue
4. **Test** the fix thoroughly
5. **Release** the fix and notify you
6. **Credit** you in our security advisory (if desired)

### Security Update Process

1. Security issues are given the highest priority
2. A fix is developed and tested privately
3. A new release is published with the security fix
4. The security advisory is published
5. Users are notified to update

## Security Considerations

### WebAuthn Security

This application implements WebAuthn for passwordless authentication. Key security features:

- **Origin Binding**: Credentials are bound to the origin domain
- **User Verification**: Requires biometric or PIN verification
- **Attestation**: Validates authenticator integrity
- **Challenge-Response**: Prevents replay attacks

### JWT Security

- Tokens are signed with a strong secret
- Short expiration times recommended
- Secure token storage practices

### CAPTCHA Protection

- Bot protection during registration
- Rate limiting on authentication endpoints
- Input validation and sanitization

### Database Security

- Supabase provides built-in security features
- Row Level Security (RLS) policies recommended
- Encrypted credential storage

## Best Practices for Users

### Deployment Security

- Use HTTPS in production
- Set strong JWT secrets
- Configure proper CORS policies
- Enable rate limiting
- Use environment variables for secrets

### Environment Configuration

- Never commit `.env` files to version control
- Use different secrets for different environments
- Regularly rotate secrets and API keys
- Monitor for exposed credentials

### Monitoring

- Monitor authentication logs
- Set up alerts for unusual activity
- Regularly audit user access
- Keep dependencies updated

## Dependencies

We regularly monitor our dependencies for security vulnerabilities using:

- GitHub Security Advisories
- npm audit
- Automated dependency updates

## Compliance

This project follows security best practices for:

- OWASP Top 10
- WebAuthn Level 2 specification
- JWT security recommendations
- Next.js security guidelines

---

**Thank you for helping keep our users safe!** 🔐
