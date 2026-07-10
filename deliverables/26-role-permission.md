# Identity & Access Management (IAM) Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [25-ai-analytics.md](25-ai-analytics.md) (all prior modules)
**Consumed by:** Every module in the platform
**Scope note:** This module is the actual authorization system every prior module's "Role-Based Permissions," "Row-Level Security," "Branch/Region-level Access," and "shared Manager Override/Approval component" has assumed exists. It is structurally foundational alongside Multi-Branch (19) and Settings (20) — a user cannot log in, a role cannot be checked, and an approval cannot route to the right person until this module exists. This module owns *who can do what*; it never re-implements *what happens when they do it* (that remains each module's own business logic).

---

## 1. Module Objective

Provide enterprise identity, authentication, authorization, and access governance — User Management, Roles, Permissions, Access Policies, Sessions, Security Monitoring, Audit Compliance — as the single system every other module's login, permission check, and approval-routing decision resolves to.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin | Full access, all users/roles/policies, cannot be permission-restricted by any other role |
| System Administrator | Full operational IAM management; cannot alter Super Admin's own account |
| Security Administrator | Security Events (§15), MFA policy, Access Policies (§9), typically not day-to-day user CRUD |
| IT Administrator | User Management (§6), SSO/directory integration (§12) |
| Owner | Full visibility, typically delegates day-to-day administration to System Administrator |
| Compliance Officer | Read-only across Audit Log (§16), Access Review Campaigns (§25) — cannot modify permissions, only review/attest to them |

This module's own permission model is necessarily self-referential — it must protect itself from being misconfigured by anyone other than Super Admin/System Administrator, since a mistake here has platform-wide blast radius unlike any other module.

---

## 3. Identity Lifecycle

```
User Invited → Account Created → Identity Verified → Role Assigned
→ Permission Applied → Active Session → Access Reviewed → Account Disabled
```

**Access Reviewed** is a recurring lifecycle stage, not a one-time step — it's the formal trigger for Access Review Campaigns (§25), where a manager periodically re-attests that each of their reports' role/permission assignments are still appropriate, closing the common enterprise-security gap of permissions accumulating indefinitely as an employee changes roles over years (ties directly to Employees' Transfer workflow, [18-employees.md](18-employees.md) §3 — a branch/department transfer should trigger a review of whether the prior role's permissions still make sense).

---

## 4. Module Structure

```
IAM Dashboard (§5)
↓
Users (§6) ──→ Roles (§7) ──→ Permissions (§8)
↓
Access Policies (§9)
↓
Authentication (§10) ──→ SSO (§12) ──→ MFA (§13)
↓
Authorization (§11)
↓
Sessions (§14)
↓
Security Events (§15) ──→ Audit Logs (§16)
```

---

## 5. IAM Dashboard

Lightweight header pattern (Dashboard §4): Total Users · Active Users · Online Users · Failed Login Attempts · Locked Accounts · Expired Passwords · Active Sessions · Security Alerts.

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15); this is the module's own health-monitoring view — distinct from every business-domain Dashboard elsewhere in the platform, since this one tracks system security posture rather than business performance.

---

## 6. User Management

Invite User (email-based, generates a time-limited setup link) · Create User (direct, for offline-onboarded staff without email access) · Deactivate/Reactivate User · Reset Password · Assign Branch (writing to the same Employees' Branch Assignment relationship, [18-employees.md](18-employees.md) §3, and Multi-Branch's Branch/Region-level Access scoping, [19-multi-branch.md](19-multi-branch.md) §23 — one user-to-branch assignment, not duplicated across three modules) · Assign Department · Assign Manager (mirrors Employees' Organization Structure reporting line, 18 §8) · Status.

**A User record here and an Employee record in Employees ([18-employees.md](18-employees.md)) are linked but distinct concepts:** a User is a login/authentication identity; an Employee is the HR/operational record (compensation, attendance, commission). Every Employee needing system access has exactly one linked User; not every User necessarily has a full Employee record (e.g., a Supplier Portal or Customer Portal login, per Suppliers 15 §25 and E-commerce 23 §14, is a User without an Employee record). This module owns the User/authentication side; Employees owns the HR side; they reference each other rather than duplicating fields.

---

## 7. Role Management

System Roles (the platform-predefined set — Super Admin, Business Owner, Regional Manager, Branch Manager, Store Manager, Cashier, and the full role list established across the Master Context and every module's own §2) · Custom Roles (organization-defined, composed from the same Permission set, §8) · Role Hierarchy (inheritance — a Custom Role can extend a System Role, adding/removing specific permissions rather than building from scratch) · Role Templates · Role Cloning (duplicating an existing role as a starting point for a new one, e.g., "Senior Cashier" cloned from "Cashier" with additional discount-approval authority) · Role Assignment (a user can hold multiple roles simultaneously, per Navigation's Workspace Switcher's Role-switching concept, 02 §14 — e.g., a Regional Manager who also holds Store Manager access at one location).

---

## 8. Permission Management

Module Permissions (which of the platform's ~25 modules a role can access at all — the actual mechanism behind every module's Sidebar visibility, per Navigation's permission-based-visibility rule, 02 §4) · Menu Permissions · Screen Permissions · **Action Permissions**: Create · Read · Update · Delete · Approve · Export · Import · Print · API Access.

This is the concrete permission matrix every prior module's own §2 target-user table has been informally describing — "Cashier: full transaction flow; discounts require Manager Override" ([04-pos.md](04-pos.md) §2) is, formally, a set of Action Permissions on specific Screens/Modules configured here. The **Approve** action specifically is what the shared Manager Override/Approval component (established across POS, Product Management, Inventory, Purchase, Sales, Loyalty, Promotions, Marketing, CRM, Suppliers, Finance, Employees) checks to determine who's eligible to act as an approver for a given request.

---

## 9. Access Policies

Branch-level / Region-level / Department-level Access (the row-level security foundation Multi-Branch established as needing to exist, [19-multi-branch.md](19-multi-branch.md) §23 — this module is where it's actually implemented) · Document-level Access (e.g., a specific high-value contract restricted beyond normal role permissions) · **Row-level Security** and **Field-level Security** (the mechanism behind Product Management's field-level permission model, [05-product-management.md](05-product-management.md) §2, and every PII-masking rule established for Customers/Suppliers/Finance/Employees, 10 §24, 15 §7, 16 §27, 18 §24) · Time-based Access (e.g., a seasonal/temporary staff role that auto-expires) · IP Restrictions (e.g., restricting Finance module access to office network IP ranges only).

Every module across this entire spec set that described "field-level permission," "row-level security," or "branch-scoped access" was describing the *behavior* this section implements as actual configured policy — this is the mechanism, those were the requirements.

---

## 10. Authentication

Username & Password · Email Login · Phone Login · OTP · Passkeys (Optional) · Biometric Authentication (the same capability Mobile Manager's Secure Login relies on, [24-mobile-manager.md](24-mobile-manager.md) §22 — that module's Biometric Authentication/Device Binding are this module's authentication mechanisms as consumed by that specific client) · Magic Link (Optional).

---

## 11. Authorization

**RBAC** (Role-Based Access Control, the primary model — a user's permissions derive from their assigned Role(s), §7) · **ABAC** (Attribute-Based Access Control, for finer-grained policies beyond role alone — e.g., Access Policies' Time-based/IP restrictions, §9, which depend on request attributes, not just who the user is) · Policy Evaluation (the runtime engine resolving RBAC + ABAC + Access Policies into an allow/deny decision for any given request) · Permission Inheritance (from Role Hierarchy, §7) · **Approval-based Access** (temporary elevated access granted through an approval workflow — reusing the platform-wide shared Approval component pattern, this time applied to granting access itself rather than a business transaction) · **Temporary Access** (time-boxed elevation, auto-reverting — the formalization of Just-in-Time Access, §25).

---

## 12. Single Sign-On (SSO)

SAML 2.0 · OAuth 2.0 · OpenID Connect (OIDC) · Microsoft Entra ID · Google Workspace · Okta · Keycloak.

For enterprise customers with an existing corporate identity provider — SSO establishes the user's authenticated identity; this module's own Role/Permission assignment (§7/§8) still governs what that authenticated identity can do within the platform (SSO answers "who are you," not "what can you access here").

---

## 13. Multi-Factor Authentication

Authenticator Apps · SMS OTP · Email OTP · Security Keys · Backup Codes.

MFA enrollment/requirement can be configured per role (§7) or Access Policy (§9) — e.g., Finance/Super Admin roles may mandate MFA while a Cashier role relies on the faster PIN-based POS login already specified in POS ([04-pos.md](04-pos.md) §24), since MFA-per-transaction would be impractical at a register.

---

## 14. Session Management

Active Sessions · Device Management (the same capability surfaced in Mobile Manager's Profile & Preferences, 24 §14) · Force Logout (Remote Logout, matching Mobile Manager's §22 security control) · Session Timeout (the configurable default set in Settings' General Settings, [20-settings.md](20-settings.md) §6, with per-context overrides already established — POS's shorter register timeout, 04 §24; Mobile's biometric-reauth cadence, 24 §18) · Trusted Devices · Concurrent Session Limits (e.g., preventing the same login from being used simultaneously at two physical registers, a common retail fraud/error vector).

---

## 15. Security Events

Login Success · Login Failure · Permission Changes · Role Changes · Password Reset · MFA Enrollment · Account Lock · **Suspicious Activity** (unusual login location/time, rapid failed attempts, impossible-travel patterns — feeding AI Analytics' Anomaly Detection, [25-ai-analytics.md](25-ai-analytics.md) §9, as the Fraud Indicators category's identity-security dimension).

Security-category events specifically route to the Notification Center's non-bulk-dismissible Security category (established back in Navigation §13 and carried through Notifications 21 §21) — a failed-login spike or permission change is never buried in routine notification volume.

---

## 16. Audit Logs

Who · What · When · Where (location/IP) · Old Value · New Value · IP Address · Device.

This is the platform's most foundational Audit Log — every other module's own "Audit Log" section (present in all 25 prior modules) records domain-specific changes (a price change, a stock adjustment), but the **actor identity, session, and access-grant context** behind every one of those entries ultimately traces back to a record here. This module's Audit Log is held to the strictest retention/immutability standard in the platform, exceeding even Finance's (16 §22), since it's the record that would be consulted first in any security incident investigation.

---

## 17. Search & Filter

User · Role · Department · Branch · Status · Last Login · Security Status — same combinable filter+chip pattern used platform-wide.

---

## 18. Bulk Operations

Bulk User Import (e.g., onboarding a newly acquired franchise's staff roster) · Bulk User Export · Bulk Role Assignment · Bulk Permission Update · Bulk Deactivation (e.g., an entire branch closing, per Multi-Branch's Branch Status change, 19 §10) — same preview-before-commit rule as every other bulk action platform-wide, with Bulk Permission Update specifically requiring Security Administrator approval given the security-sensitivity of mass permission changes.

---

## 19. Validation

| Rule | Behavior |
|---|---|
| Duplicate Username | Hard-blocked — unique key |
| Duplicate Email | Hard-blocked here specifically (unlike the soft-warning treatment for Customer/Supplier email duplicates elsewhere) — a User account's email is an authentication credential, not just contact info, so uniqueness is a hard security requirement |
| Password Policy | Enforced at set/reset time (minimum length, complexity, reuse restrictions per Settings' configuration) |
| Permission Conflicts | Blocked if a Custom Role's configuration would create a contradictory rule (e.g., simultaneously granting and denying the same Action Permission via inherited vs. explicit rules) — resolved via explicit precedence (explicit deny always wins over inherited grant), never left ambiguous |
| Role Conflicts | Blocked if assigning a role would violate a configured Segregation of Duties rule (§25) — e.g., a user cannot simultaneously hold both "Purchase Order Creator" and "Purchase Order Approver" roles if SoD is configured to prevent that combination |
| Policy Conflicts | Access Policy (§9) conflicts (e.g., overlapping Time-based Access windows) resolved via most-restrictive-wins, consistent with a security-first default |

---

## 20. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Users | Not applicable post-initial-setup (Super Admin always exists); relevant only during first-run tenant provisioning |
| No Roles | Not applicable — System Roles ship as platform defaults; relevant only for the Custom Roles sub-list before any are created |
| Offline | Authentication/authorization are inherently server-dependent — this module has minimal offline tolerance by design (a security decision, not an oversight); POS's own offline mode (04 §15) relies on a previously-authenticated, cached session rather than this module operating offline |
| Permission Denied | Standard Navigation §19 pattern, though notably this module's own Permission Denied is the most consequential instance platform-wide — it's the mechanism enforcing every other module's Permission Denied state |
| Authentication Error | Distinct state — invalid credentials, expired MFA code, locked account — each with a specific, actionable message (not a generic "access denied," since a locked account needs a different next step than a wrong password) |
| Retry | Consistent retry affordance, rate-limited per §23 to prevent retry-based brute-forcing |

---

## 21. Responsive Design

| Breakpoint | Full IAM Console | Mobile (Admin Essentials) |
|---|---|---|
| Desktop/Laptop | Full tables, full Role/Permission matrix editor | N/A |
| Tablet | Priority columns + scroll | Most viewing/basic actions supported |
| Mobile | Card-per-row stacked lists | **Admin Essentials**, consistent with Settings' (20 §25) and Finance's (16 §25) scoping — a Security Administrator reviewing a Security Alert or force-logging-out a compromised session from a phone; deep Role/Permission matrix design remains Desktop/Tablet-oriented |

---

## 22. Accessibility

Standard platform baseline: keyboard navigation, screen reader labels, accessible forms (User/Role/Permission entry), WCAG AA. Given this module is almost entirely form/table-based configuration (similar to Settings, 20 §26), it carries a comparably lighter accessibility surface than data-visualization-heavy modules, but with the same rigor applied to every input and validation message — particularly critical here given assistive-technology users must be able to manage their own account security (password reset, MFA enrollment) without barriers.

---

## 23. Security

This module's own §23 is, uniquely among the platform, close to its entire reason for existing rather than one section among many:

**Password Policies** (complexity, expiration, history/reuse prevention) · **Encryption** (credentials, tokens, and session data encrypted at rest and in transit, exceeding even Finance's Financial Data Encryption standard, 16 §27, since this module protects the keys to everything else) · **Secret Rotation** (API keys, service account credentials, per Settings' Integration Settings, 20 §17, rotated on a schedule or on-demand after a suspected compromise) · **Account Lockout** (after N failed attempts, configurable threshold and lockout duration) · **Rate Limiting** (on login attempts, password reset requests, and MFA code submission — the mechanism behind §20's rate-limited Retry) · **Audit Trail** (§16, this module's own — logged with the strictest platform-wide standard) · **Security Headers** (CSP, HSTS, and related web-security headers for any web-facing authentication surface) · **Zero Trust Principles** (every request re-verified against current permissions rather than trusting a long-lived session's initial grant — particularly relevant given how many modules' data this platform's users can touch).

---

## 24. Performance

Optimized for thousands of users and large role hierarchies: **Fast Permission Evaluation** is the single most performance-critical requirement in this entire module, since every API call platform-wide — every POS scan, every Sales Order save, every Dashboard load — passes through a permission check here first. Permission decisions must be cached/precomputed per user-role-context (invalidated immediately on any role/permission change, consistent with the cache-invalidation discipline established for Settings' configuration caching, 20 §28) rather than re-evaluating the full RBAC+ABAC+Access Policy chain on every single request — this module cannot be the platform's bottleneck given its position in literally every request path. Lazy loading, server-side pagination for the administrative UI itself.

---

## 25. Advanced Enterprise Features

**Just-in-Time (JIT) Access** (§11's Temporary Access formalized — a user requests elevated access for a specific task/duration, auto-reverting) · **Privileged Access Management (PAM)** (extra scrutiny/session-recording for the highest-privilege roles) · Delegated Administration (a Branch Manager administering their own branch's user accounts without full System Administrator authority) · **Access Review Campaigns** (§3's recurring re-attestation process, formalized as a scheduled workflow assigning managers a review task per report) · **Segregation of Duties (SoD)** (§19's Role Conflict validation, formalized as a configurable rule engine — this is the authoritative SoD configuration that Purchase (08 §2/§27), Sales (09 §2), and Finance (16 §2/§27) all referenced as a principle; it's implemented here as the actual rule engine those modules' approval flows check against) · Identity Federation · **SCIM Provisioning** (automated user lifecycle sync with an external HR/identity system) · API Token Management (for Settings' Integration Settings, 20 §17, and any external system/webhook consumer, e.g., E-commerce's marketplace integrations, 23 §10) · Service Accounts (non-human identities for system-to-system integration) · Machine-to-Machine Authentication · Risk-based Authentication and Adaptive Authentication (step-up MFA triggered by contextual risk signals — an unfamiliar device or location prompts additional verification even for an otherwise-valid login) · Behavior Analytics and AI Risk Scoring (feeding, and fed by, AI Analytics' Anomaly Detection, 25 §9, for the identity-security dimension of platform-wide fraud/anomaly monitoring).

Additive/opt-in per the platform-wide principle — a smaller single-branch retailer uses Users/Roles/Permissions/basic Authentication/MFA without ever engaging SSO/SCIM/PAM/Risk-based Authentication.

---

## 26. Developer Implementation Notes

- Permission evaluation (§8/§11/§24) must be a single shared authorization service every module's API layer calls before executing any action — never a per-module reimplementation of "does this user have permission," since that would create exactly the drift risk this entire spec set has repeatedly warned against for shared logic (approval components, pricing engines, forecasting).
- The shared Manager Override/Approval component (referenced across all 25 prior modules) checks eligibility to approve via this module's Action Permissions' **Approve** flag (§8) — this module is the actual source of truth for "who can approve this," not a locally-maintained approver list per module.
- User (this module) and Employee ([18-employees.md](18-employees.md)) must remain two linked-but-distinct entities per §6 — a User without an Employee record (Supplier/Customer portal logins) must be fully supported by the data model, not treated as an edge case requiring a workaround.
- Row/Field-level Security (§9) should be the single policy-evaluation layer every module's own "field-level permission" or "row-level security" claim throughout this spec set (Product Management 05 §2, Customers 10 §24, Suppliers 15 §7, Finance 16 §27, Reports 17 §27, Employees 18 §24) actually delegates to — not reimplemented per module.
- Session/token invalidation (§14) must propagate immediately across every client (web back-office, Mobile Manager, POS terminal, Customer/Supplier Portal) — a Force Logout or password reset should terminate all active sessions for that identity everywhere, not just the session where the action was taken.
- SoD rule evaluation (§25) should be the single engine Purchase, Sales, and Finance's own segregation-of-duties enforcement (08 §27, 09, 16 §2) calls into at their approval-transition endpoints — those modules' specs described the *requirement*; this module is where it's actually configured and evaluated.

---

**Next:** 27-api-webhook.md
