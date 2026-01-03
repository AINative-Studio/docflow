# Backend Development Plan

## DocFlow HR — Python + FastAPI + ZeroDB

**Tech Stack:**
- **Framework:** Python 3.11+ with FastAPI
- **Database:** ZeroDB (AI-native serverless database)
- **API Endpoint:** `https://api.ainative.studio/api/v1`
- **Approach:** Sprint-based (following sprint.md)

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings & ZeroDB config
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py         # Auth, JWT, RBAC
│   │   ├── events.py           # Audit event emitter
│   │   └── exceptions.py       # Custom exceptions
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── zerodb_client.py    # ZeroDB HTTP client wrapper
│   │   ├── tables.py           # Table operations
│   │   ├── vectors.py          # Vector operations
│   │   └── events.py           # Event stream operations
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── org.py              # Org, User, Role models
│   │   ├── employee.py         # Employee models
│   │   ├── document.py         # Document, Version, File models
│   │   ├── hris.py             # HRIS integration models
│   │   ├── intake.py           # Intake channel models
│   │   ├── submission.py       # Submission models
│   │   ├── retention.py        # Retention policy models
│   │   ├── legal_hold.py       # Legal hold models
│   │   └── notification.py     # Notification models
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── org.py              # Pydantic request/response schemas
│   │   ├── employee.py
│   │   ├── document.py
│   │   ├── hris.py
│   │   ├── intake.py
│   │   ├── submission.py
│   │   ├── retention.py
│   │   ├── legal_hold.py
│   │   └── notification.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── org_service.py      # Org business logic
│   │   ├── user_service.py     # User management
│   │   ├── employee_service.py
│   │   ├── document_service.py
│   │   ├── upload_service.py   # File upload handling
│   │   ├── hris_service.py     # HRIS sync logic
│   │   ├── retention_service.py
│   │   ├── legal_hold_service.py
│   │   ├── notification_service.py
│   │   └── audit_service.py    # Event logging
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py       # Main v1 router
│   │   │   ├── auth.py         # Auth endpoints
│   │   │   ├── orgs.py         # Org endpoints
│   │   │   ├── users.py        # User endpoints
│   │   │   ├── employees.py    # Employee endpoints
│   │   │   ├── documents.py    # Document endpoints
│   │   │   ├── uploads.py      # Upload endpoints
│   │   │   ├── submissions.py  # Submission endpoints
│   │   │   ├── review.py       # Review workflow endpoints
│   │   │   ├── hris.py         # HRIS integration endpoints
│   │   │   ├── retention.py    # Retention endpoints
│   │   │   ├── legal_holds.py  # Legal hold endpoints
│   │   │   └── audit.py        # Audit log endpoints
│   │   └── deps.py             # API dependencies
│   │
│   └── middleware/
│       ├── __init__.py
│       ├── tenant.py           # Org-scoped middleware
│       └── logging.py          # Request logging
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures
│   ├── test_auth.py
│   ├── test_orgs.py
│   ├── test_documents.py
│   └── ...
│
├── requirements.txt
├── pyproject.toml
├── Dockerfile
└── docker-compose.yml
```

---

## Sprint Phases (Following sprint.md)

### PHASE 0 — Setup & Scope Lock (30 min)

**Tasks:**
1. Initialize FastAPI project structure
2. Configure ZeroDB client
3. Set up environment variables
4. Create base Pydantic models
5. Confirm API scope (defer: HRIS execution, AI classification, deletion jobs)

**Deliverables:**
- [ ] Project skeleton created
- [ ] ZeroDB connection working
- [ ] Health check endpoint `/health`

---

### PHASE 1 — Core Foundation (Hour 0-1)

**Goal:** Multi-tenant foundation with orgs, users, roles, employees

**Tables to Create:**
- `orgs`
- `users`
- `roles`
- `user_roles`
- `employees`

**APIs:**

```
POST   /api/v1/orgs                    # Create organization
GET    /api/v1/orgs/{org_id}           # Get organization
POST   /api/v1/orgs/{org_id}/users     # Invite user
POST   /api/v1/auth/magic-link         # Request magic link
POST   /api/v1/auth/verify             # Verify magic link token
GET    /api/v1/auth/me                 # Get current user
POST   /api/v1/users/{user_id}/roles   # Assign role
POST   /api/v1/employees               # Create employee
GET    /api/v1/employees               # List employees
GET    /api/v1/employees/{id}          # Get employee
PATCH  /api/v1/employees/{id}          # Update employee
```

**Deliverables:**
- [ ] Org creation with unique slug
- [ ] User invitation flow
- [ ] Magic link auth
- [ ] Role seeding (hr_admin, hr_manager, legal, it_admin, auditor, employee)
- [ ] RBAC middleware
- [ ] Employee CRUD
- [ ] Audit events emitted for all mutations

---

### PHASE 2 — Intake & Submission (Hour 1-3)

**Goal:** Employees can submit documents via web upload

**Tables to Create:**
- `intake_channels`
- `submissions`
- `submission_documents`
- `files`

**APIs:**

```
GET    /api/v1/intake/channels              # List enabled channels
POST   /api/v1/intake/channels              # Enable/configure channel
POST   /api/v1/uploads                      # Get signed upload URL
POST   /api/v1/uploads/complete             # Confirm upload complete
POST   /api/v1/submissions                  # Create submission
GET    /api/v1/submissions                  # List submissions (employee)
GET    /api/v1/submissions/{id}             # Get submission details
```

**File Upload Flow:**
1. Client requests signed URL → `POST /uploads`
2. Client uploads directly to ZeroDB object storage
3. Client confirms → `POST /uploads/complete`
4. Server creates submission + file record
5. Server emits `document.received` event
6. Server sends receipt notification (email/SMS)

**Deliverables:**
- [ ] Signed upload URL generation
- [ ] File validation (type, size)
- [ ] Malware scan status tracking
- [ ] Submission record creation
- [ ] Immutable timestamps
- [ ] `document.received` event emitted

---

### PHASE 3 — Document Model & Versioning (Hour 3-5)

**Goal:** Immutable, versioned document storage

**Tables to Create:**
- `documents`
- `document_versions`
- `document_categories`
- `document_metadata`

**APIs:**

```
POST   /api/v1/documents                         # Create document shell
GET    /api/v1/documents                         # List documents
GET    /api/v1/documents/{id}                    # Get document
POST   /api/v1/documents/{id}/versions           # Add version
GET    /api/v1/documents/{id}/versions           # List versions
PATCH  /api/v1/documents/{id}/category           # Override category
GET    /api/v1/document-categories               # List categories
POST   /api/v1/document-categories               # Create custom category
```

**Document Lifecycle:**
```
received → needs_review → approved/rejected → (expired)
```

**Deliverables:**
- [ ] Document shell creation
- [ ] Version management (immutable)
- [ ] Checksum validation
- [ ] Category assignment (manual for MVP)
- [ ] Metadata extraction placeholders
- [ ] `document.version.created` event

---

### PHASE 4 — HR Review Workflow (Hour 5-6)

**Goal:** HR can approve/reject documents

**Tables to Create:**
- `document_reviews`

**APIs:**

```
GET    /api/v1/review-queue                      # Get documents needing review
GET    /api/v1/review-queue/stats                # Queue statistics
POST   /api/v1/documents/{id}/approve            # Approve document
POST   /api/v1/documents/{id}/reject             # Reject with notes
POST   /api/v1/documents/{id}/request-resubmit   # Request resubmission
```

**Review Flow:**
1. Document enters queue with status `needs_review`
2. HR opens document → views preview
3. HR approves → status = `approved`, notify employee
4. OR HR rejects → status = `rejected`, reason stored, notify employee

**Deliverables:**
- [ ] Review queue query (filtered by org)
- [ ] Approve action with event
- [ ] Reject action with notes + event
- [ ] Employee notification trigger
- [ ] `document.review.approved` / `document.review.rejected` events

---

### PHASE 5 — Audit & Events (Hour 6-7)

**Goal:** Immutable audit trail for compliance

**Event Stream Schema:**
- `event_stream` (ZeroDB events)

**Events to Emit:**
| Event Type | Trigger |
|------------|---------|
| `org.created` | Org created |
| `user.invited` | User invited |
| `user.activated` | User activated |
| `employee.created` | Employee created |
| `employee.status.changed` | Employment status change |
| `document.received` | Document submitted |
| `document.version.created` | New version added |
| `document.category.changed` | Category override |
| `document.review.approved` | Document approved |
| `document.review.rejected` | Document rejected |
| `retention.scheduled` | Retention date set |
| `legal_hold.applied` | Legal hold applied |
| `legal_hold.released` | Legal hold released |

**APIs:**

```
GET    /api/v1/audit/events                      # Query events
GET    /api/v1/audit/events/entity/{type}/{id}   # Events for entity
GET    /api/v1/audit/export                      # Export audit log
GET    /api/v1/employees/{id}/timeline           # Employee timeline
GET    /api/v1/documents/{id}/timeline           # Document timeline
```

**Deliverables:**
- [ ] Event emitter service
- [ ] Event query API with filters
- [ ] Entity timeline reconstruction
- [ ] Export functionality (JSON/CSV)

---

### PHASE 6 — Retention & Legal Hold (Hour 7-8)

**Goal:** Compliance-ready retention and legal hold scaffolding

**Tables to Create:**
- `retention_policies`
- `state_retention_defaults`
- `document_retention_schedules`
- `legal_holds`
- `legal_hold_scopes`
- `legal_hold_targets`

**APIs:**

```
# Retention
GET    /api/v1/retention/policies                # List policies
POST   /api/v1/retention/policies                # Create policy
GET    /api/v1/retention/state-defaults          # Get state defaults
POST   /api/v1/retention/schedule                # Schedule document retention
GET    /api/v1/documents/{id}/retention          # Get retention info

# Legal Holds
GET    /api/v1/legal-holds                       # List holds
POST   /api/v1/legal-holds                       # Create hold
GET    /api/v1/legal-holds/{id}                  # Get hold details
POST   /api/v1/legal-holds/{id}/release          # Release hold
GET    /api/v1/documents/{id}/holds              # Check if doc under hold
```

**Retention Logic:**
1. On document creation, determine employee's work state
2. Look up state default retention policy
3. Calculate `delete_eligible_at` based on policy
4. If legal hold exists → status = `paused_legal_hold`

**Legal Hold Logic:**
1. Admin creates hold with scope (employee, department, category, date range)
2. System materializes targets (affected documents)
3. Affected documents: retention paused, deletion blocked
4. On release: timers resume, events logged

**Deliverables:**
- [ ] State default policies seeded (FL, TX, AZ, NC, TN)
- [ ] Retention scheduling on document creation
- [ ] Legal hold CRUD
- [ ] Hold scope targeting
- [ ] Hold enforcement checks
- [ ] `retention.scheduled`, `legal_hold.applied`, `legal_hold.released` events

---

## Database Seed Data

```python
# Default Roles
ROLES = ["hr_admin", "hr_manager", "legal", "it_admin", "auditor", "employee"]

# System Document Categories
CATEGORIES = [
    {"name": "I-9", "is_system": True},
    {"name": "W-4", "is_system": True},
    {"name": "Offer Letter", "is_system": True},
    {"name": "ID / Passport", "is_system": True},
    {"name": "Benefits / Medical", "is_system": True},
    {"name": "Performance / Disciplinary", "is_system": True},
    {"name": "Other", "is_system": True},
]

# State Retention Defaults
STATE_DEFAULTS = [
    {"state_code": "FL", "duration_years": 5, "start_event": "termination"},
    {"state_code": "TX", "duration_years": 4, "start_event": "termination"},
    {"state_code": "AZ", "duration_years": 4, "start_event": "termination"},
    {"state_code": "NC", "duration_years": 3, "start_event": "termination"},
    {"state_code": "TN", "duration_years": 3, "start_event": "termination"},
]
```

---

## API Endpoints Summary

| Phase | Endpoints | Count |
|-------|-----------|-------|
| 1. Core | Auth, Orgs, Users, Employees | ~12 |
| 2. Intake | Uploads, Submissions | ~6 |
| 3. Documents | Documents, Versions, Categories | ~8 |
| 4. Review | Review Queue, Approve/Reject | ~5 |
| 5. Audit | Events, Timelines, Export | ~5 |
| 6. Retention/Holds | Retention, Legal Holds | ~10 |
| **Total** | | **~46** |

---

## ZeroDB Client Implementation

```python
# app/db/zerodb_client.py

import httpx
from typing import Any, Optional
from app.config import settings

class ZeroDBClient:
    def __init__(self):
        self.base_url = settings.ZERODB_API_URL
        self.project_id = settings.ZERODB_PROJECT_ID
        self.headers = {
            "Authorization": f"Bearer {self._get_token()}",
            "Content-Type": "application/json"
        }

    async def _get_token(self) -> str:
        # Authenticate with ZeroDB
        pass

    # Table Operations
    async def insert(self, table: str, data: dict) -> dict:
        """Insert row into table"""
        pass

    async def query(self, table: str, filters: dict, limit: int = 100) -> list:
        """Query table with filters"""
        pass

    async def update(self, table: str, id: str, data: dict) -> dict:
        """Update row by ID"""
        pass

    async def delete(self, table: str, id: str) -> bool:
        """Delete row by ID"""
        pass

    # Vector Operations
    async def store_embedding(self, collection: str, data: dict) -> dict:
        """Store vector embedding"""
        pass

    async def vector_search(self, collection: str, query: str, limit: int = 10) -> list:
        """Semantic similarity search"""
        pass

    # Event Operations
    async def emit_event(self, event: dict) -> dict:
        """Emit audit event"""
        pass

    async def query_events(self, filters: dict) -> list:
        """Query event stream"""
        pass

    # Object Storage
    async def get_signed_upload_url(self, key: str, content_type: str) -> str:
        """Get signed URL for upload"""
        pass

    async def get_signed_download_url(self, key: str) -> str:
        """Get signed URL for download"""
        pass
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Magic Link Flow                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. User enters email                                    │
│     POST /auth/magic-link {email}                        │
│                                                          │
│  2. Server:                                              │
│     - Finds user by email + org                          │
│     - Generates JWT token (15 min expiry)                │
│     - Sends email with link                              │
│                                                          │
│  3. User clicks link                                     │
│     POST /auth/verify {token}                            │
│                                                          │
│  4. Server:                                              │
│     - Validates token                                    │
│     - Returns access + refresh tokens                    │
│     - Logs event                                         │
│                                                          │
│  5. Client stores tokens, uses for API calls             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## RBAC Permissions Matrix

| Role | Orgs | Users | Employees | Documents | Review | Legal Holds | Audit |
|------|------|-------|-----------|-----------|--------|-------------|-------|
| hr_admin | RW | RW | RW | RW | RW | R | RW |
| hr_manager | R | R | R | RW | RW | R | R |
| legal | R | R | R | R | R | RW | RW |
| it_admin | RW | RW | R | R | R | R | RW |
| auditor | R | R | R | R | R | R | RW |
| employee | - | - | Self | Own | - | - | Own |

---

## Deferred to Phase 2

As per sprint.md, these are explicitly deferred:

- [ ] HRIS push/pull execution (ADP, Gusto, Workday APIs)
- [ ] AI document classification
- [ ] Background deletion workers
- [ ] Email intake processing
- [ ] SMS intake processing (Twilio)
- [ ] Cloud drive imports (OAuth flows)
- [ ] Advanced permissions UI
- [ ] Mobile app

---

## Getting Started Commands

```bash
# Create project
mkdir -p backend/app && cd backend

# Initialize virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn httpx pydantic python-jose passlib

# Create requirements.txt
pip freeze > requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

---

## Environment Variables

```bash
# .env
ZERODB_API_URL=https://api.ainative.studio/api/v1
ZERODB_PROJECT_ID=your-project-id
ZERODB_USERNAME=your-username
ZERODB_PASSWORD=your-password

JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=30

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-key

TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

---

## Success Criteria

By end of sprint:

- [ ] Create org with unique slug
- [ ] Invite and activate users via magic link
- [ ] Create employees with work location state
- [ ] Upload documents via signed URL
- [ ] Documents versioned immutably
- [ ] HR can approve/reject documents
- [ ] Full audit trail for all actions
- [ ] Retention dates calculated per state
- [ ] Legal holds block deletion
- [ ] All events emitted and queryable

---

## Sources

- [ZeroDB - AI-Native Serverless Database](https://zerodb.ainative.studio/)
- [AINative ZeroDB MCP Server](https://glama.ai/mcp/servers/@AINative-Studio/ainative-zerodb-mcp-server)
- [AINative Studio](https://www.ainative.studio/)
