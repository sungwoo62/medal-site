# Phase 3: Email Notifications - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 03-email-notifications
**Areas discussed:** Sender & recipients, SMTP credentials

---

## Sender & Recipients

### Q1: Which email address should send the notifications?

| Option | Description | Selected |
|--------|-------------|----------|
| info@medaloffinisher.com | Generic info address — common for automated notifications | |
| noreply@medaloffinisher.com | Explicit no-reply — discourages customer replies | |
| quote@medaloffinisher.com | Dedicated quote-related address — clear purpose | |
| hello@medaloffinisher.com | (User's custom input) | ✓ |

**User's choice:** hello@medaloffinisher.com (custom input)
**Notes:** None

### Q2: Which admin email address(es) should receive quote notifications?

| Option | Description | Selected |
|--------|-------------|----------|
| Same as sender (hello@) | hello@medaloffinisher.com receives admin notifications too | ✓ |
| Different admin email | A separate address like admin@ or a personal email | |

**User's choice:** Same as sender (hello@)
**Notes:** None

### Q3: Should customers be able to reply to the confirmation email?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, reply goes to hello@ | Reply-To: hello@medaloffinisher.com — customers can email back | ✓ |
| No reply (noreply) | No Reply-To — discourage replies | |

**User's choice:** Yes, reply goes to hello@
**Notes:** None

---

## SMTP Credentials

### Q1: Do you already have a Google Workspace App Password?

| Option | Description | Selected |
|--------|-------------|----------|
| Already have it | App Password is generated — just need to add to .env.local | |
| Need to create it | Will generate App Password before Phase 3 execution | |
| Not sure | Need to check Google Workspace settings first | ✓ |

**User's choice:** Not sure
**Notes:** Plan will include prerequisite step for creating App Password

### Q2: For env var naming, which convention do you prefer?

| Option | Description | Selected |
|--------|-------------|----------|
| SMTP_USER + SMTP_PASS | Generic SMTP naming | ✓ |
| GOOGLE_SMTP_USER + GOOGLE_SMTP_PASS | Google-specific prefix | |
| You decide | Claude picks the naming convention | |

**User's choice:** SMTP_USER + SMTP_PASS
**Notes:** None

---

## Claude's Discretion

- Email content & tone (HTML vs plain text, Korean template design)
- Failure handling strategy (retry, logging, silent fail)
- nodemailer configuration details

## Deferred Ideas

None — discussion stayed within phase scope
