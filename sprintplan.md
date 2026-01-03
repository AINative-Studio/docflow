---

# Product Backlog (≤ Size 3 per Story)

## DocFlow HR

---

## EPIC 1 — Organization & Access Control

### 1.1 Create Organization (Size 2)

**As an** HR admin
**I want** to create an organization
**So that** my company is isolated

**AC**

* Org created with unique slug
* Org scoped to tenant
* Audit event emitted

---

### 1.2 Seed Default Roles (Size 1)

**As a** system
**I want** default roles created
**So that** access works immediately

**AC**

* HR Admin, HR Manager, Legal, IT Admin, Auditor, Employee
* Roles scoped to org

---

### 1.3 Invite User by Email (Size 2)

**As an** admin
**I want** to invite users
**So that** they can access the system

**AC**

* Invitation stored
* Email sent
* Status = invited

---

### 1.4 Activate User via Magic Link (Size 2)

**As a** user
**I want** to activate my account
**So that** I can log in

**AC**

* Token validated
* User status = active
* Event logged

---

### 1.5 Assign Role to User (Size 2)

**As an** admin
**I want** to assign roles
**So that** permissions are enforced

**AC**

* Role assigned
* RBAC enforced on API

---

## EPIC 2 — Employee Records

### 2.1 Create Employee Record (Size 2)

**As an** HR admin
**I want** an employee profile
**So that** documents can attach

**AC**

* Employee tied to org
* State of work required

---

### 2.2 Update Employment Status (Size 2)

**As an** HR admin
**I want** to update status
**So that** lifecycle is tracked

**AC**

* Status transitions validated
* Event emitted

---

### 2.3 Link User to Employee (Size 1)

**As an** admin
**I want** to link portal users
**So that** employees can log in

**AC**

* User ↔ employee link stored

---

## EPIC 3 — HRIS Integrations (Bi-Directional)

### 3.1 Create HRIS Connection (Size 3)

**As an** admin
**I want** to connect HRIS
**So that** data syncs

**AC**

* Provider selected
* OAuth token stored
* Status = active

---

### 3.2 Pull Employees from HRIS (Size 3)

**As a** system
**I want** to import employees
**So that** HRIS is source of truth

**AC**

* Employees created/updated
* Mapping stored
* Sync event logged

---

### 3.3 Push Document Metadata to HRIS (Size 3)

**As a** system
**I want** to sync doc status
**So that** HRIS reflects compliance

**AC**

* Metadata payload sent
* Success/failure logged

---

### 3.4 Detect HRIS Conflicts (Size 2)

**As a** system
**I want** to detect conflicts
**So that** admins can resolve them

**AC**

* Conflict record created
* Resolution state = pending

---

### 3.5 Resolve HRIS Conflict (Size 2)

**As an** admin
**I want** to resolve conflicts
**So that** data is consistent

**AC**

* Resolution applied
* Event emitted

---

## EPIC 4 — Intake Channels

### 4.1 Enable Web Upload (Size 2)

**As an** admin
**I want** web uploads enabled
**So that** employees can submit

**AC**

* Upload endpoint active
* File validation enforced

---

### 4.2 Create Email Intake Inbox (Size 2)

**As an** admin
**I want** an intake email
**So that** employees can email docs

**AC**

* Unique inbox created
* Routing rules stored

---

### 4.3 Ingest Email Attachment (Size 3)

**As a** system
**I want** to ingest email files
**So that** they become documents

**AC**

* Attachment saved
* Submission created
* Receipt sent

---

### 4.4 Provision Twilio SMS Number (Size 2)

**As an** admin
**I want** an SMS number
**So that** employees can text docs

**AC**

* Number assigned
* Stored in org config

---

### 4.5 Ingest SMS Attachment (Size 3)

**As a** system
**I want** to process MMS uploads
**So that** mobile users can submit

**AC**

* Sender verified
* File saved
* Confirmation SMS sent

---

### 4.6 Connect Cloud Drive (Size 3)

**As an** employee
**I want** to connect my drive
**So that** I can import files

**AC**

* OAuth completed
* Scope = file picker only

---

### 4.7 Import File from Drive (Size 2)

**As an** employee
**I want** to import a file
**So that** it becomes a document

**AC**

* File copied
* Submission recorded

---

## EPIC 5 — Submissions

### 5.1 Create Submission Record (Size 2)

**As a** system
**I want** a submission record
**So that** receipt exists

**AC**

* Channel + sender stored
* Timestamp immutable

---

### 5.2 Link Submission to Document (Size 1)

**As a** system
**I want** to link submissions
**So that** audits are traceable

**AC**

* Submission ↔ document link

---

### 5.3 Handle Submission Failure (Size 2)

**As a** system
**I want** to record failures
**So that** issues are visible

**AC**

* Error reason stored
* Event emitted

---

## EPIC 6 — Documents & Versions

### 6.1 Create Document Shell (Size 2)

**As a** system
**I want** a document entity
**So that** files can version

**AC**

* Document created
* Status = received

---

### 6.2 Create Document Version (Size 3)

**As a** system
**I want** immutable versions
**So that** history is preserved

**AC**

* Version number increments
* File checksum stored

---

### 6.3 Set Current Version (Size 1)

**As a** system
**I want** to mark current version
**So that** UI knows latest

**AC**

* Pointer updated

---

### 6.4 Auto-Classify Document (Size 3)

**As a** system
**I want** classification
**So that** HR saves time

**AC**

* Category assigned
* Confidence stored

---

### 6.5 Override Classification (Size 1)

**As an** HR admin
**I want** to change category
**So that** errors are corrected

**AC**

* Override saved
* Event emitted

---

## EPIC 7 — Review Workflow

### 7.1 Add Document to Review Queue (Size 1)

**As a** system
**I want** docs queued
**So that** HR can review

**AC**

* Status = needs_review

---

### 7.2 Approve Document (Size 2)

**As an** HR manager
**I want** to approve docs
**So that** compliance is met

**AC**

* Status updated
* Employee notified

---

### 7.3 Reject Document (Size 2)

**As an** HR manager
**I want** to reject docs
**So that** resubmission occurs

**AC**

* Reason stored
* Notification sent

---

## EPIC 8 — Retention Engine

### 8.1 Apply State Default Policy (Size 2)

**As a** system
**I want** state-based retention
**So that** compliance is automatic

**AC**

* Policy selected by state

---

### 8.2 Schedule Deletion (Size 3)

**As a** system
**I want** deletion scheduled
**So that** retention is enforced

**AC**

* Delete date calculated
* Job queued

---

### 8.3 Execute Secure Deletion (Size 3)

**As a** system
**I want** secure deletion
**So that** data is removed

**AC**

* File deleted
* Tombstone stored
* Event logged

---

## EPIC 9 — Legal Holds

### 9.1 Create Legal Hold (Size 3)

**As a** legal user
**I want** to create a hold
**So that** docs are preserved

**AC**

* Hold created
* Scope saved

---

### 9.2 Apply Hold to Documents (Size 3)

**As a** system
**I want** to mark documents
**So that** deletion is blocked

**AC**

* Retention paused
* Targets materialized

---

### 9.3 Release Legal Hold (Size 2)

**As a** legal user
**I want** to release a hold
**So that** retention resumes

**AC**

* Hold released
* Timers resumed

---

## EPIC 10 — Audit & Events

### 10.1 Emit Event on Mutation (Size 2)

**As a** system
**I want** audit events
**So that** actions are provable

**AC**

* Event emitted on create/update/delete

---

### 10.2 View Audit Log (Size 3)

**As an** auditor
**I want** to view events
**So that** audits are easy

**AC**

* Filter by entity/date
* Export supported

---

## EPIC 11 — Notifications

### 11.1 Send Submission Receipt (Size 2)

**As an** employee
**I want** confirmation
**So that** I trust the system

**AC**

* Email/SMS sent
* Timestamp included

---

### 11.2 Send Expiration Alert (Size 2)

**As an** HR admin
**I want** alerts
**So that** docs don’t expire unnoticed

**AC**

* Configurable timing
* Event logged

---

## EPIC 12 — Search & Vectors

### 12.1 Chunk & Embed Document (Size 3)

**As a** system
**I want** embeddings
**So that** semantic search works

**AC**

* Chunks stored
* Vectors indexed

---

### 12.2 Semantic Search Query (Size 3)

**As an** HR admin
**I want** natural search
**So that** I find docs faster

**AC**

* Ranked results
* Org isolation enforced

---

## MVP CUT (All ≤3)

**Include Epics:** 1–9
**Phase 2:** 10–12


