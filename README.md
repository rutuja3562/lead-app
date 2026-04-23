# Lead App — Full Stack (React Native + NestJS + PostgreSQL + Temporal)

A complete lead onboarding application with multi-step form flows, live validation, tab-based progression, and durable workflow orchestration.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                React Native App                     │
│   QuickLead → ProspectLead (6 tabs)                 │
│   Live validation · Tab state machine               │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│              NestJS Backend (Port 3000)             │
│   /otp   /leads   /masters                          │
│   TypeORM + PostgreSQL                              │
└──────────┬───────────────────────────┬──────────────┘
           │ TypeORM                   │ Temporal Client
┌──────────▼──────────┐    ┌──────────▼──────────────┐
│  PostgreSQL (5432)  │    │  Temporal Server (7233) │
│  Tables:            │    │  Workflow: leadOnboarding│
│  leads              │    │  Activities:             │
│  applicants         │    │  • sendWelcomeSms        │
│  property_info      │    │  • assignLeadToOfficer   │
│  income_info        │    │  • runCibilCheck         │
│  references         │    │  • escalateIfStale       │
│  lead_documents     │    │  • notifyLeadSubmitted   │
│  otps               │    └─────────────────────────┘
└─────────────────────┘
```

---

## Project Structure

```
lead-app/
├── frontend/                    # React Native app
│   └── src/
│       ├── types/               # Shared TypeScript types
│       ├── themes/              # Colors, spacing, typography
│       ├── utils/
│       │   ├── validation.ts    # Pure validation functions
│       │   └── formRules.ts     # Validation rules per form
│       ├── store/
│       │   └── leadStore.tsx    # React Context + useReducer
│       ├── services/
│       │   └── api.ts           # API client
│       ├── components/          # Reusable UI components
│       │   ├── CustomInput/     # Input with live validation
│       │   ├── Button/
│       │   ├── Dropdown/        # Bottom-sheet picker
│       │   ├── OTPInput/        # 6-cell OTP entry
│       │   ├── RadioButton/
│       │   ├── PhoneInput/
│       │   ├── TabBar/          # Locked/Active/Completed tabs
│       │   ├── FileUpload/      # Photo & document upload
│       │   └── SectionCard/
│       └── screens/
│           ├── QuickLead/       # Step 1: Quick lead creation
│           └── ProspectLead/    # Step 2: Tabbed form container
│               tabs/
│               ├── BasicInfoTab.tsx
│               ├── PropertyInfoTab.tsx
│               ├── IncomeInfoTab.tsx
│               ├── PhotoUploadTab.tsx
│               ├── DocumentUploadTab.tsx
│               └── ReferencesTab.tsx
│
├── backend/                     # NestJS API
│   └── src/
│       ├── database/entities/   # TypeORM entities
│       ├── modules/
│       │   ├── otp/             # OTP send/verify/resend
│       │   ├── lead/            # Lead CRUD + tab saves
│       │   └── masters/         # Dropdown data API
│       └── main.ts
│
├── temporal/                    # Temporal workflows
│   └── src/
│       ├── workflows/
│       │   └── leadOnboarding.workflow.ts
│       ├── activities/
│       │   └── lead.activities.ts
│       └── workers/
│           └── lead.worker.ts
│
└── docker-compose.yml           # Full local stack
```

---

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker & Docker Compose
- React Native CLI + Android/iOS SDK

### 2. Start Infrastructure

```bash
docker-compose up -d postgres temporal temporal-ui
```

Wait ~30s for Temporal to initialize, then verify:
- Temporal UI: http://localhost:8080

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API available at: http://localhost:3000  
Swagger docs: http://localhost:3000/api/docs

### 4. Temporal Worker

```bash
cd temporal
npm install
npm run start:worker
```

### 5. Mobile App

```bash
cd frontend
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

---

## Running Tests

### Frontend (validation + form rules)
```bash
cd frontend
npm test
# or with coverage:
npm test -- --coverage
```

### Backend (service logic)
```bash
cd backend
npm test
npm run test:cov
```

### Temporal (workflow state machine)
```bash
cd temporal
npm test
```

---

## Form Flow

### Step 1: Quick Lead (`/leads/quick`)
1. Enter 10-digit mobile number → **Send OTP**
2. Enter 6-digit OTP → **Verify OTP**
3. Fill: Customer Type, Name, Gender
4. Fill: Address
5. Fill: Loan Information
6. Fill: Property Information
7. Fill (Non-Individual only): Business Information
8. Fill: Lead Source + Lead Status (Hot/Warm/Cold)
9. **Save as Draft** or **Continue →**

### Step 2: Prospect Lead (6 tabs)

| Tab | Required Fields | Unlocks Next |
|-----|----------------|--------------|
| Basic Info | Salutation, Name, DOB, Gender, PAN, Aadhar, Email | ✓ |
| Property Info | Type, Location, Area, Market Value, Owner | ✓ |
| Income Info | Employment, Company, Monthly Income, Bank, IFSC | ✓ |
| Photos | Applicant photo (min 1) | ✓ |
| Documents | PAN, Aadhar, Bank Statement, Property Doc | ✓ |
| References | Min 2 references with name, relation, mobile | → Submit |

**Tab rules:**
- Tabs unlock sequentially — can't skip
- Completed tabs show a ✓ checkmark and can be revisited
- Locked tabs show 🔒 and are non-pressable
- Each tab validates all required fields on "Save & Continue"
- Live validation: error appears on blur, clears when field becomes valid

---

## Validation Design

All validation is done through **pure functions**:

```typescript
// Single field
validateField(value, rules) → error string | ''

// Entire form
validateForm(form, fieldRules) → FormErrors object

// Check if any errors
hasErrors(errors) → boolean

// Mark all as touched (for submit-button validation)
markAllTouched(form) → TouchedFields
```

**Live validation flow:**
1. User types → `handleChange` → validates if field is already touched
2. User leaves field → `handleBlur` → marks touched + validates immediately
3. User clicks Save → `markAllTouched` + `validateForm` → shows all errors

---

## Temporal Workflow

When a lead is created, a `leadOnboardingWorkflow` starts:

```
Lead Created
    ↓
notifyLeadCreated → sendWelcomeSms → assignLeadToOfficer
    ↓
Wait for signals (max 30 days):
  • tabCompleted(tab)   → tracks progress
  • leadSubmitted       → advances to submission
  • cancelLead(reason)  → terminates gracefully
    ↓
Every 3 days (if still active):
  → escalateIfStale (alerts branch manager)
    ↓
On submit:
  notifyLeadSubmitted → sendSubmissionEmail → runCibilCheck
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/otp/send` | Send OTP |
| POST | `/api/v1/otp/verify` | Verify OTP |
| POST | `/api/v1/otp/resend` | Resend OTP |
| POST | `/api/v1/leads/quick` | Create quick lead |
| PUT | `/api/v1/leads/:id/basic-info` | Save basic info tab |
| PUT | `/api/v1/leads/:id/property-info` | Save property info tab |
| PUT | `/api/v1/leads/:id/income-info` | Save income info tab |
| PUT | `/api/v1/leads/:id/references` | Save references tab |
| POST | `/api/v1/leads/:id/submit` | Final submit |
| GET | `/api/v1/leads/:id` | Get lead details |
| GET | `/api/v1/masters` | All dropdown data |
| GET | `/api/v1/masters/:key` | Specific dropdown |

---

## Database Schema

```
leads (id, mobileNumber, customerType, leadStatus, loanType, loanAmount,
       propertyType, currentStage, temporalWorkflowId, isDraft, ...)
   ↓ 1:1
applicants (salutation, firstName, lastName, dob, gender, panNumber,
            aadharNumber, email, addressLine1, city, state, pincode, ...)
   ↓ 1:1
property_info (propertyType, propertyArea, marketValue, ownerName, ...)
   ↓ 1:1
income_info (employmentType, companyName, monthlyIncome, bankName, ifscCode, ...)
   ↓ 1:N
references (name, relation, mobileNumber, address)
   ↓ 1:N
lead_documents (fileKey, fileName, mimeType, fileSize, documentType)

otps (mobileNumber, otp, verified, attempts, expiresAt)
```

---

## Production Integrations (replace mocks)

| Feature | Replace With |
|---------|-------------|
| OTP SMS | MSG91, Fast2SMS, Twilio |
| File Upload | AWS S3 (`@aws-sdk/client-s3`) |
| Email | SendGrid, AWS SES |
| CIBIL Check | CIBIL / CRIF API |
| Push Notification | Firebase FCM |
| Auth | JWT + Refresh Token |
