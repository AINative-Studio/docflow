# DocFlow HR - Project Memory

## 🚨 RULE #1: NO AI ATTRIBUTION (ZERO TOLERANCE)

**FORBIDDEN in commits/PRs:** "Claude", "Anthropic", "claude.com", "AI-generated", emojis+attribution
**Enforcement:** `.git/hooks/commit-msg` blocks commits, see `.claude/git-rules.md`

**Correct format:**
```
Title
- Change 1
- Change 2
```

---

## Quick Reference

**Product:** Secure Employee Document Intake, Compliance & HRIS Sync Platform
**Stack:** Python 3.11+, FastAPI, ZeroDB (AI-native database)
**Database:** ZeroDB (api.ainative.studio)
**Deploy:** TBD

### Project Structure
```
docflow/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # Settings
│   │   ├── core/                # Security, events, exceptions
│   │   ├── db/                  # ZeroDB client
│   │   ├── models/              # Domain models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   ├── api/v1/              # API endpoints
│   │   └── middleware/          # Tenant, logging
│   └── tests/
├── docs/                        # Documentation (not root .md)
├── .claude/                     # AI context files
└── README.md                    # Only root .md allowed
```

---

## Critical Rules

### 1. Git Commits
- File: `.claude/git-rules.md`
- Hook: `.git/hooks/commit-msg`
- Zero tolerance for AI attribution

### 2. Issue Tracking (MANDATORY)
- File: `.claude/ISSUE_TRACKING_ENFORCEMENT.md`
- NO code without GitHub issue
- Branch: `[type]/[issue]-[desc]`
- Commits: `Refs #123` or `Closes #123`

### 3. File Placement
- File: `.claude/CRITICAL_FILE_PLACEMENT_RULES.md`
- Docs → `docs/{category}/`
- No root `.md` (except README.md)

### 4. Testing (MANDATORY)
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing
# Must see: 80%+ coverage
```

### 5. Code Quality
- Type hints all functions
- Docstrings public methods
- Multi-tenant `org_id` on all records
- Rate limiting all endpoints

---

## ZeroDB Integration

**API:** https://api.ainative.studio/v1
**Console:** https://zerodb.ainative.studio/
**SDK:** `pip install zerodb-mcp`

### Slash Commands (37 available)
| Category | Commands |
|----------|----------|
| Vectors | `/zerodb-vector-upsert`, `/zerodb-vector-search` |
| Tables | `/zerodb-table-create`, `/zerodb-table-query` |
| Files | `/zerodb-file-upload`, `/zerodb-file-url` |
| Memory | `/zerodb-memory-store`, `/zerodb-memory-search` |
| Events | `/zerodb-event-create`, `/zerodb-event-list` |
| PostgreSQL | `/zerodb-postgres-*` |

### Key Principles
- Vectors: 1536 dimensions (ada-002)
- Multi-tenant: `org_id` on all records
- Use namespaces for organization
- Rich metadata for filtering

---

## DocFlow Data Model

### /table Schema (25+ tables)
- **Identity:** orgs, users, roles, user_roles
- **Employees:** employees (HRIS-linked)
- **HRIS:** hris_connections, hris_employee_mappings, hris_sync_jobs, hris_conflicts
- **Intake:** intake_channels, email_inboxes, sms_numbers, drive_connections
- **Documents:** documents, document_versions, files, document_categories, document_metadata, document_reviews
- **Submissions:** submissions, submission_documents
- **Retention:** retention_policies, state_retention_defaults, document_retention_schedules
- **Legal Holds:** legal_holds, legal_hold_scopes, legal_hold_targets
- **Notifications:** notifications
- **Access:** document_access_grants

### /vector Schema
- `document_chunks` - Semantic search for documents

### /events Schema
- `event_stream` - Immutable audit trail

---

## MVP Scope (Sprint-based)

### Phase 1: Core Foundation
- Orgs, users, roles, employees
- Magic link auth
- RBAC middleware

### Phase 2: Intake & Submission
- Web upload (signed URLs)
- Submissions
- File storage

### Phase 3: Documents
- Document shell + versions
- Categories
- Metadata

### Phase 4: HR Review
- Review queue
- Approve/reject workflow

### Phase 5: Audit
- Event emitter
- Timeline queries

### Phase 6: Retention & Legal Holds
- State-based retention
- Legal hold enforcement

### Deferred
- HRIS sync execution (ADP, Gusto, Workday)
- AI document classification
- Email/SMS intake
- Cloud drive imports

---

## API Endpoints (~46 total)

### Auth
```
POST /api/v1/auth/magic-link
POST /api/v1/auth/verify
GET  /api/v1/auth/me
```

### Orgs & Users
```
POST /api/v1/orgs
GET  /api/v1/orgs/{id}
POST /api/v1/orgs/{id}/users
POST /api/v1/users/{id}/roles
```

### Employees
```
POST /api/v1/employees
GET  /api/v1/employees
GET  /api/v1/employees/{id}
PATCH /api/v1/employees/{id}
```

### Documents
```
POST /api/v1/uploads
POST /api/v1/uploads/complete
POST /api/v1/documents
GET  /api/v1/documents
POST /api/v1/documents/{id}/versions
GET  /api/v1/review-queue
POST /api/v1/documents/{id}/approve
POST /api/v1/documents/{id}/reject
```

### Retention & Legal Holds
```
GET  /api/v1/retention/policies
POST /api/v1/retention/schedule
POST /api/v1/legal-holds
POST /api/v1/legal-holds/{id}/release
```

### Audit
```
GET  /api/v1/audit/events
GET  /api/v1/employees/{id}/timeline
GET  /api/v1/documents/{id}/timeline
```

---

## Environment Variables

```bash
# ZeroDB
ZERODB_API_URL=https://api.ainative.studio/v1
ZERODB_PROJECT_ID=your-project-id
ZERODB_API_KEY=your-api-key

# Auth
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=30

# Email (for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-key

# SMS (Twilio - Phase 2)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

---

## Seed Data

### Default Roles
```python
ROLES = ["hr_admin", "hr_manager", "legal", "it_admin", "auditor", "employee"]
```

### Document Categories
```python
CATEGORIES = ["I-9", "W-4", "Offer Letter", "ID / Passport",
              "Benefits / Medical", "Performance / Disciplinary", "Other"]
```

### State Retention Defaults
```python
STATE_DEFAULTS = {
    "FL": 5,  # years post-termination
    "TX": 4,
    "AZ": 4,
    "NC": 3,
    "TN": 3,
}
```

---

## Common Tasks

### New API Endpoint
1. Create issue first: `[FEATURE] Add {endpoint}`
2. Branch: `feature/{issue}-{name}`
3. `app/api/v1/{feature}.py`
4. `app/schemas/{feature}.py`
5. `app/services/{feature}_service.py`
6. `tests/test_{feature}.py`
7. Register in `app/api/v1/router.py`
8. Test: `pytest tests/ -v --cov`
9. Commit: `Refs #{issue}` (NO AI ATTRIBUTION)

### Dev Start
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

---

## Key Documentation

- **PRD:** `prd.md`
- **Data Model:** `datamodel.md`
- **Backend Plan:** `backend-plan.md`
- **Backlog:** `backlog.md`
- **Sprint:** `sprint.md`
- **Frontend PRD:** `frontend-prd.md`

---

## Resources

- **ZeroDB API:** https://api.ainative.studio/docs
- **ZeroDB Console:** https://zerodb.ainative.studio/
- **Python SDK:** https://pypi.org/project/zerodb-mcp/
- **Developer Settings:** https://www.ainative.studio/developer-settings

---

## Deployment Checklist

- [ ] Tests passing (80%+ coverage)
- [ ] No AI attribution in commits
- [ ] All endpoints rate-limited
- [ ] Multi-tenant org_id verified
- [ ] Audit events emitting
- [ ] Retention policies seeded
- [ ] Environment variables set
- [ ] Security reviewed

---

## 🚨 FINAL REMINDER

**BEFORE COMMIT:**
1. GitHub issue created? → If NO, CREATE FIRST!
2. Contains "Claude"/"Anthropic"? → STOP! REMOVE!
3. Has attribution footer/emoji? → STOP! REMOVE!
4. Tests executed? → If NO, TEST FIRST!

**Hook blocks forbidden text.**

---

**Updated:** 2026-01-03 | **Status:** Development
