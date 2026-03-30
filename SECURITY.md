# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Hard Hat Social, please report it responsibly. **Do not open a public GitHub issue.**

Email us at: **security@hardhatsocial.net**

Include as much detail as possible:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

We will acknowledge your report within 48 hours and aim to resolve confirmed vulnerabilities within 14 days depending on severity.

---

## Scope

The following are in scope for security reports:

- Authentication and session management
- Contact info exposure (phone/email should only be visible to approved contractors)
- Admin route access control (`/admin`)
- File upload handling (credential documents, avatars, post images)
- SQL injection or data access bypassing Row Level Security
- API route authorization (`/api/contact/[id]`)

The following are out of scope:

- Spam or social engineering attacks
- Denial of service
- Vulnerabilities in third-party services (Supabase, Vercel, Resend)
- Issues requiring physical access to a device

---

## Supported Versions

Only the current production deployment at [hardhatsocial.net](https://hardhatsocial.net) is actively maintained and eligible for security fixes.

---

## Disclosure Policy

We follow coordinated disclosure. Please give us reasonable time to investigate and patch before any public disclosure. We will credit researchers who report valid vulnerabilities if they wish to be acknowledged.
