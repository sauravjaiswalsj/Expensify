 :# Rivo - Feature-wise TODO Roadmap

This file tracks **what to build next**, grouped by feature area, with optional **AI integrations** for each.

## Priority Legend
- `P0` = critical for product usability
- `P1` = important improvements
- `P2` = advanced / scale / polish

---

## 1) Authentication & Account Flow

### Current
- Signup, login, verify, resend code, forgot/reset password exist.
- JWT auth is integrated.
- Auth responses use the standard API envelope with correlation IDs.
- Signup and auth email side effects use Mongo-backed outbox events.

### TODO
- [x] `P0` Fix backend signup transaction consistency (avoid partial success + 500).
- [x] `P0` Return consistent response schema from all auth endpoints.
- [ ] `P0` Add rate-limits for login/signup/resend endpoints.
- [ ] `P1` Add refresh-token flow and token rotation.
- [ ] `P1` Add logout-all-sessions support.
- [ ] `P2` Add optional 2FA (email OTP or TOTP app).

### AI Integration Ideas
- [ ] `P1` AI risk scoring on login (new device/IP/time anomaly).
- [ ] `P2` AI-generated adaptive verification friction (step-up only on risky logins).
- [ ] `P2` AI assistant for auth support prompts ("why can't I log in?").

---

## 2) Expense Capture

### Current
- Add expense API and UI exist.
- Data is persisted successfully.
- Authenticated list, edit, and delete flows exist in the backend and dashboard UI.

### TODO
- [x] `P0` Add backend endpoint to fetch expenses by authenticated user.
- [x] `P0` Add frontend list/history page for expenses.
- [x] `P0` Add edit and delete expense endpoints + UI actions.
- [ ] `P1` Add pagination, sorting, and server-side filtering (date/category/payment type).
- [ ] `P1` Add bulk import (CSV) with validation report.
- [ ] `P2` Add recurring expenses support.

### AI Integration Ideas
- [ ] `P1` Auto-categorize expense from description (NLP classifier).
- [ ] `P1` Merchant name normalization ("Zomato BLR" -> "Zomato").
- [ ] `P2` Detect duplicate/near-duplicate transactions.
- [ ] `P2` Smart form suggestions (last used category/payment method per merchant).

---

## 3) Dashboard & Insights

### Current
- Dashboard UI is bound to live expense and summary data.

### TODO
- [x] `P0` Build summary APIs (total spend, monthly spend, category count, transaction count).
- [x] `P0` Bind dashboard cards to live backend data.
- [x] `P1` Add charts (monthly trend, category split, payment method split).
- [x] `P1` Add period switchers (7d / 30d / 90d / custom).
- [ ] `P2` Add downloadable reports (PDF/CSV).

### AI Integration Ideas
- [ ] `P1` AI-generated weekly/monthly spend summary in plain language.
- [ ] `P1` Forecast next month spend using recent patterns.
- [ ] `P2` "Why did spend increase?" explanation engine (top contributors).
- [ ] `P2` Goal progress coaching (budget drift warnings + suggestions).

---

## 4) Verification, Email & Notifications

### Current
- Email verification and resend flows are present.
- Verification and reset emails are processed through outbox events with retry/failure state.

### TODO
- [x] `P0` Add delivery logging for verification/reset emails (sent/fail reason).
- [x] `P0` Add retry strategy + dead-letter handling for mail failures.
- [ ] `P1` Add notification preferences (email on/off by type).
- [ ] `P1` Add in-app notification center.
- [ ] `P2` Add push notifications (web/mobile).

### AI Integration Ideas
- [ ] `P1` Personalized reminder timing (best send time per user).
- [ ] `P2` Smart notification prioritization (only high-impact alerts).
- [ ] `P2` AI-generated actionable subject lines for reminders.

---

## 5) Security, Compliance & Reliability

### Current
- JWT + Spring Security + validation + exceptions are in place.
- API responses use a standard envelope and request correlation IDs.
- Auth and expense mutation controllers emit structured audit logs.

### TODO
- [ ] `P0` Move JWT storage from localStorage to secure HttpOnly cookie flow.
- [x] `P0` Add request/response audit logging for auth + expense mutations.
- [x] `P0` Standardize global error handling + correlation IDs.
- [ ] `P1` Add CSRF strategy for cookie-based auth.
- [ ] `P1` Add account lockout policy for repeated failed logins.
- [ ] `P2` Add backup/restore runbook and data retention policy.

### AI Integration Ideas
- [ ] `P2` AI anomaly detection on transaction patterns (possible fraud/outlier).
- [ ] `P2` AI-assisted security alert triage from logs.

---

## 6) Developer Experience & DevOps

### TODO
- [ ] `P0` Add CI checks (backend tests + frontend typecheck/lint/build).
- [ ] `P0` Add basic integration tests for auth and expense flows.
- [ ] `P1` Add Docker Compose for local full-stack run.
- [ ] `P1` Add environment matrix docs (`dev`, `staging`, `prod`).
- [ ] `P1` Add metrics and tracing (latency/error rate for key endpoints).
- [ ] `P2` Add release checklist + automated changelog.

### AI Integration Ideas
- [ ] `P1` AI PR review assistant for code smells and risk hot-spots.
- [ ] `P2` AI incident summarizer from logs/traces for faster debugging.

---

## 7) Suggested Execution Plan (Practical)

### Phase 1 (P0: stabilize core)
- [x] Live dashboard data (summary + list endpoints).
- [x] Fix signup/verification reliability and email delivery visibility.
- [x] Improve error consistency and auth/session security baseline.

### Phase 2 (P1: product value)
- [ ] Filters/charts/reports and better notification controls.
- [ ] First AI features: auto-categorization + monthly summary text.

### Phase 3 (P2: intelligence & scale)
- [ ] Forecasting, anomaly detection, advanced coaching.
- [ ] DevOps automation and AI-assisted operations.

---

## 8) First AI Sprint (Recommended)

A low-risk AI slice you can ship quickly:

- [ ] Add endpoint: `POST /ai/categorize` (description -> category suggestion).
- [ ] Integrate on add-expense form as "Suggested category" chip.
- [ ] Save both `userSelectedCategory` and `aiSuggestedCategory` for feedback loop.
- [ ] Add offline fallback: keyword rules if model/API is unavailable.
- [ ] Track precision metric weekly to improve prompts/rules.

---

## 9) Definition of Done (for each feature)

- [ ] API contract documented and versioned.
- [ ] Happy path + failure path covered by tests.
- [ ] UI shows clear success/error states.
- [ ] Logs/metrics added for observability.
- [ ] Security review completed for auth/data impact.
