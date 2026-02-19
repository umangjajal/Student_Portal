# Subscription & Grace Period System - Complete Workflow

## Overview
This document outlines the complete subscription flow implemented in the Student Portal:
1. **Subscription Selection** → 2. **Email Confirmation** → 3. **Acceptance** → 4. **5-Day Grace Period** → 5. **Payment** → 6. **Activation**

---

## Step-by-Step Workflow

### 1. University Selects a Plan
**Location:** `/pricing` or `/university/subscription`

- University admin visits the pricing page
- Chooses between BASIC, ADVANCED, or PREMIUM plans
- Each plan has:
  - Different price per user (student/faculty)
  - Different features available
  - Storage limits
  - Support levels

**What happens:**
```
User clicks "Select Plan" 
→ Backend generates acceptance token
→ Email sent with acceptance link (valid 24 hours)
→ Subscription status: PENDING_ACCEPTANCE
```

---

### 2. Confirmation Email Sent
**Email Trigger:** `selectPlanAndInitiate` endpoint

Universities receive an email containing:
- Plan details (name, price per user, storage, features)
- 5-day grace period explanation
- **Acceptance link** (valid for 24 hours)
- Instructions for next steps

**Email Preview in Acceptance:**
```
Subject: "Subscription Confirmation Required - [PLAN_NAME] Plan"

Content:
- Plan details and pricing
- Grace period information (5 days)
- Acceptance link - UNIQUE TOKEN
- Warning about expiring link (24 hours)
```

---

### 3. University Accepts Subscription
**Location:** `/university/subscription/accept?token=[TOKEN]`

When user clicks the email link:
- Token is verified (must be valid and not expired)
- Subscription status changes to `GRACE_PERIOD`
- **5-day countdown starts** from the acceptance date
- University redirected to Grace Period Dashboard
- Confirmation email sent with grace period details

**Grace Period Dates Calculated:**
```javascript
const gracePeriodEndDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
const paymentDueDate = gracePeriodEndDate; // Same date
```

---

### 4. Grace Period Dashboard
**Location:** `/university/subscription/grace-period`

### What Universities See:
#### A. Time Remaining Counter
- Large display showing days remaining
- Color changes to RED if ≤2 days (URGENT)
- Shows exact deadline date

#### B. Setup Checklist (3 Tasks)
```
✓ Task 1: Add Students
  - Total students added: [COUNT]
  - Buttons: "Add Single" or "Bulk Import CSV"
  
✓ Task 2: Add Faculty
  - Total faculty added: [COUNT]
  - Link to Faculty Management page
  
✓ Task 3: Make Payment
  - Amount due: [CALCULATED REAL-TIME]
  - Link to Payment Page
```

#### C. Real-Time User Counters
- Students Added: [LIVE COUNT - Updates every 30 seconds]
- Faculty Added: [LIVE COUNT - Updates every 30 seconds]
- Total Users: [STUDENTS + FACULTY]
- Amount Due: [TOTAL USERS × PRICE PER USER]

#### D. Quick Actions
- **Add Single Student:** Pop-up form
  - Name, Email, Roll Number
  - Immediately counts toward total
  
- **Bulk Import CSV:** Upload CSV file using template
  - Download template from dashboard
  - Supports multiple students at once
  - Validates and imports all records

#### E. Important Information Box
- Grace period duration (5 days)
- Real-time calculation explanation
- Deadline date (bold, prominent)
- Consequence of missing deadline
- Contact for support

---

### 5. During Grace Period: Adding Users & Viewing Charges

#### A. Add Students/Faculty
**Single Student Addition:**
```
Form Fields:
- Student Name (required)
- Email (required)
- Roll Number (optional)

On Submit:
→ User created in database
→ Counted toward total
→ Monthly charge recalculated
→ Dashboard updates in real-time
```

**Bulk CSV Import:**
```
CSV Format:
name, email, rollNumber
John Doe, john@example.com, A001
Jane Smith, jane@example.com, A002
```

---

#### B. Real-Time Charge Calculation

**Formula:**
```
Monthly Charge = (Total Students + Total Faculty) × Price Per User

Example:
- Plan: BASIC (₹500/user/month)
- Students: 100
- Faculty: 10
- Total Users: 110
- Monthly Charge: 110 × ₹500 = ₹55,000
```

**Updates Triggered When:**
- New student added
- New faculty member added
- Plan changed
- Any user count modification

**Display Updated:**
- Grace period dashboard
- Subscription page
- Payment modal

---

### 6. Payment During Grace Period
**Duration:** Must complete within 5 days

#### A. Payment Options Available
1. **UPI Payment**
   - UPI ID: `universityaccount@axis`
   - Bank Details provided
   - QR code for quick scanning
   - App-opening direct UPI link

2. **Bank Transfer**
   - Account details displayed
   - Bank: Axis Bank
   - Account: [PROVIDED]
   - IFSC: [PROVIDED]

3. **Invoice Method**
   - Email invoice to university
   - Pay via their preferred method
   - Mark as paid in system

#### B. Payment Flow
```
University clicks "Make Payment"
→ Payment modal opens
→ Shows amount due (auto-calculated)
→ Displays available payment methods
→ University completes payment
→ Admin confirms payment in system (or auto-confirmation via webhook)
→ Subscription status changes to ACTIVE
→ Confirmation email sent
```

---

### 7. Confirmation After Payment
**Status:** ACTIVE (Subscription confirmed)

**Email Received:**
```
Subject: "✅ Payment Received - Subscription Activated"

Content:
- Payment confirmation details
- Transaction ID
- Amount received
- Plan details
- Next billing cycle date
- Dashboard link
```

**System Updates:**
```javascript
subscription.status = "ACTIVE";
subscription.lastPaymentDate = new Date();
subscription.lastPaymentAmount = amount;
subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
```

**What Happens Next:**
- University has full access to all features
- Students can login and access courses
- Faculty can manage classes
- System ready for production use

---

## Automatic Reminders During Grace Period

### Day 3 Reminder
**Triggered When:** 3 days remaining
**Email Subject:** "⏰ Reminder: 3 Days Left to Complete Your Subscription Setup"
**Contents:**
- Progress update (students/faculty added)
- Remaining tasks
- Payment deadline date
- Action button to complete setup

### Day 5 Critical Reminder
**Triggered When:** 1 day remaining (last day)
**Email Subject:** "🚨 URGENT: Last Day To Complete Payment - Your Subscription Expires Tomorrow"
**Contents:**
- RED urgent warning
- Last day notice (TOMORROW)
- Tasks remaining
- Overdue consequences warning
- Action button for immediate payment

---

## Grace Period Expiration

### If All Tasks Completed (HAPPY PATH)
```
Day 5 Evening:
✓ Users Added
✓ Payment Made
→ Subscription Status: ACTIVE
→ Full access granted
→ Next billing in 30 days
```

### If Tasks NOT Completed (PROBLEM PATH)
```
Day 6 Morning:
Status: PAYMENT_OVERDUE

Consequences:
- Subscription marked OVERDUE
- University can still pay but faces penalties
- Access might be restricted
- Admin notified
- Follow-up contacts sent
- Service may be suspended after X days
```

---

## Grace Period Extension (Admin Feature)

**Location:** Admin Dashboard (routes available)

**When to Use:**
- University requests more time
- Special circumstances (server issues, manual upload latency, etc.)
- Payment processing delays

**Extension Process:**
```
Admin Dashboard:
POST /subscription/admin/extend-grace-period
{
  universityId: "...",
  days: 3  // Number of days to extend
}

Results:
→ Grace period end date pushed back
→ Days remaining recalculated
→ University notified via email
→ New deadline clearly stated
```

---

## API Endpoints Summary

### Public Endpoints
```
POST /subscription/accept
- Accepts subscription using token from email
- No authentication required
```

### University Endpoints
```
GET /subscription/my-subscription
- Current subscription details

GET /subscription/status/grace-period
- Grace period status and countdown

GET /subscription/progress/grace-period
- Progress on all 3 tasks

POST /subscription/select-plan
- Initiate subscription (triggers email)

POST /subscription/confirm-payment
- Mark payment as received

POST /subscription/change-plan
- Change to different plan during grace period
```

### Admin Endpoints
```
POST /subscription/admin/send-reminders
- Manually trigger reminder emails

POST /subscription/admin/extend-grace-period
- Extend grace period for a university

GET /subscription/admin/all-subscriptions
- View all subscriptions and their statuses
```

---

## Data Model - Subscription Fields

```javascript
{
  universityId: ObjectId,
  planName: "BASIC|ADVANCED|PREMIUM",
  
  // Acceptance
  isAccepted: Boolean,
  acceptedAt: Date,
  acceptanceToken: String,
  acceptanceTokenExpiresAt: Date,
  
  // Grace Period
  gracePeriodEndDate: Date,
  paymentDueDate: Date,
  gracePeriodDaysRemaining: Number,
  status: "PENDING_ACCEPTANCE|GRACE_PERIOD|ACTIVE|PAYMENT_OVERDUE|CANCELLED|EXPIRED",
  
  // Payment
  lastPaymentDate: Date,
  lastPaymentAmount: Number,
  paymentMethod: "BANK_TRANSFER|INVOICE|CREDIT_CARD",
  
  // Billing
  monthlyCharges: Number,
  studentCount: Number,
  billingCycle: "MONTHLY|QUARTERLY|ANNUALLY",
  renewalDate: Date,
  
  // Notifications
  confirmationEmailSent: Boolean,
  confirmationEmailSentAt: Date,
  reminderEmailsSent: [{type: "DAY_3|DAY_5_CRITICAL", sentAt: Date}],
  
  // Audit
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Components

### 1. Grace Period Dashboard (`/university/subscription/grace-period`)
- Timer countdown
- Task checklist
- Add student modal
- Bulk import modal
- Progress tracking
- Information callout

### 2. Subscription Payment Modal
- Real-time amount calculation
- UPI QR code
- Bank details
- Payment instructions
- Amount summary

### 3. Subscription Main Page
- Grace period alert (if active)
- Payment overdue alert (if applicable)
- Live user counters
- Plan details
- Change plan option

### 4. Accept Subscription Page
- Token verification
- Success confirmation
- Grace period explanation
- Next steps guidance
- Redirect to grace period dashboard

---

## Key Features

✅ **Real-Time Calculations:** Charges update instantly as users are added
✅ **Automatic Reminders:** Day 3 and Day 5 emails sent automatically
✅ **Grace Period Tracking:** Clear countdown with urgent warnings
✅ **Bulk Import:** CSV file support for adding multiple users
✅ **Payment Confirmation:** Automatic and manual payment marking
✅ **Status Tracking:** Clear subscription status at all times
✅ **Emergency Extensions:** Admins can extend grace periods if needed
✅ **Email Notifications:** All key events trigger email updates
✅ **Overdue Handling:** System detects and marks overdue subscriptions
✅ **User Progress:** Dashboard shows exactly what's been done and what's remaining

---

## Implementation Complete ✅

All features have been implemented:
1. Grace Period Dashboard - DONE
2. Real-time charge calculation - DONE
3. Add students/faculty during grace period - DONE
4. Automatic reminder emails (Day 3 & 5) - DONE
5. Payment confirmation workflow - DONE
6. Grace period extension feature - DONE
7. Complete email notifications - DONE
8. Status tracking and updates - DONE

Start using the system by having universities select a plan from `/pricing`!
