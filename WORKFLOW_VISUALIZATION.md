# Subscription Grace Period - Visual Workflow

## Complete Subscription Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION & 5-DAY GRACE PERIOD FLOW                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              PHASE 1: SELECTION
                          /pricing page or /subscription
                                    ↓
                    ┌─────────────────────────────────┐
                    │  1. Choose Plan (B/A/P)         │
                    │     Set plan details            │
                    │     View pricing                │
                    └─────────────────────────────────┘
                                    ↓
                      ✉️  EMAIL SENT TO UNIVERSITY
                    ┌─────────────────────────────────┐
                    │  Plan Confirmation Email        │
                    │  + Acceptance Link (24h valid)  │
                    │  + Grace Period Info            │
                    └─────────────────────────────────┘
        Status: PENDING_ACCEPTANCE (Acceptance Token Valid: 24h)
                                    
                              PHASE 2: ACCEPTANCE
                          Click link from email
                    /university/subscription/accept?token=XXX
                                    ↓
                    ┌─────────────────────────────────┐
                    │  2. Verify Token                │
                    │     Calculate Grace Period      │
                    │     Set End Date = Now + 5 days │
                    │     Update Status to GRACE_     │
                    │     PERIOD                      │
                    └─────────────────────────────────┘
                                    ↓
                      ✉️  WELCOME EMAIL WITH GRACE DETAILS
                    ┌─────────────────────────────────┐
                    │  Subscription Accepted!         │
                    │  Grace Period: 5 Days Starts    │
                    │  Deadline: [DATE]               │
                    │  3 Tasks to Complete            │
                    └─────────────────────────────────┘
        Status: GRACE_PERIOD (5 Days = 432,000 seconds remaining)
                    ↓
      🎯 AUTO-REDIRECT TO GRACE PERIOD DASHBOARD
                                    
                          PHASE 3: GRACE PERIOD
                  /university/subscription/grace-period
                          Duration: 5 Days
                                    ↓
            ┌───────────────────────────────────────────────┐
            │        GRACE PERIOD DASHBOARD                 │
            │  ⏳ Days Remaining: [COUNTDOWN TIMER]         │
            │  Deadline: [DATE, TIME]                       │
            │  Status: 🟢 IN_GRACE_PERIOD                   │
            └───────────────────────────────────────────────┘
                                    ↓
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  📋 SUBTASK 1: ADD STUDENTS
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                    
                  Option A: Add One by One
                    ┌──────────────────────────┐
                    │ [Add Single Student]     │
                    │ ↓ Opens Form Modal       │
                    │ Name: _________          │
                    │ Email: _________         │
                    │ Roll #: _________        │
                    │ [SUBMIT]                 │
                    └──────────────────────────┘
                                    OR
                  Option B: Bulk CSV Upload  
                    ┌──────────────────────────┐
                    │ [Bulk Import]            │
                    │ ↓ Opens CSV Modal        │
                    │ [Download Template]      │
                    │ [Select CSV File]        │
                    │ [IMPORT]                 │
                    │ ↓ Adds all students      │
                    └──────────────────────────┘
                                    
                    Each student added:
                    → Updated Total Count
                    → Amount Due Recalculated
                    → Dashboard Refreshes
                                    
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  📚 SUBTASK 2: ADD FACULTY
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                    
                    [Go to Faculty Management]
                    ↓ Add faculty members (same process)
                    ↓ Updated Total Count
                    ↓ Amount Due Recalculated
                                    
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  💰 SUBTASK 3: MAKE PAYMENT
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                    
                    [Make Payment] or Go to Payment Page
                    ↓
                    ┌─────────────────────────────────┐
                    │  AMOUNT DUE                     │
                    │  = (Students + Faculty) ×       │
                    │    Price Per User               │
                    │                                 │
                    │  Example:                       │
                    │  100 Students @ ₹500            │
                    │  + 10 Faculty @ ₹500            │
                    │  = 110 Users × ₹500             │
                    │  = ₹55,000                      │
                    └─────────────────────────────────┘
                                    ↓
                    Payment Options:
                    1️⃣  UPI (Fast)
                        → Scan QR Code
                        → UPI ID: universityaccount@axis
                        
                    2️⃣  Bank Transfer
                        → Account Details Provided
                        → IFSC Code
                        
                    3️⃣  Invoice Method
                        → Via email
                        → Flexible payment
                                    
                    [Complete Payment]
                    ↓
                    ✉️  PAYMENT CONFIRMATION EMAIL
                    
        Status: Still GRACE_PERIOD (waiting for payment confirmation)
                                    
                          PHASE 4: CONFIRMATION
                  After university completes payment
                                    ↓
                    ┌─────────────────────────────┐
                    │  Admin Confirms Payment      │
                    │  (or auto via webhook)       │
                    │                              │
                    │  POST /confirm-payment       │
                    │  {amount, transactionId}     │
                    └─────────────────────────────┘
                                    ↓
                    System Updates:
                    ✅ lastPaymentDate = now
                    ✅ lastPaymentAmount = ₹55,000
                    ✅ Status: GRACE_PERIOD → ACTIVE
                    ✅ renewalDate = now + 30 days
                    ✅ Invoice record created
                                    ↓
                      ✉️  PAYMENT CONFIRMATION EMAIL
                    ┌─────────────────────────────┐
                    │  ✅ Payment Received!       │
                    │  Subscription ACTIVE        │
                    │  Full access granted        │
                    │  Next billing: [DATE]       │
                    └─────────────────────────────┘
                                    
        Status: ACTIVE (Subscription confirmed, full access)

        Celebration! 🎉 University now has:
        ✓ All students can login
        ✓ All faculty can manage classes
        ✓ All features unlocked
        ✓ Next billing in 30 days
```

---

## Grace Period Timeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    5-DAY GRACE PERIOD TIMELINE                   │
└──────────────────────────────────────────────────────────────────┘

Day 1 (Acceptance):
  ├─ User clicks email link
  ├─ Grace period activated
  ├─ ⏳ 5 Days remaining
  ├─ Dashboard shows: Add students, faculty, payment
  └─ User starts adding data

Day 2:
  ├─ User adding students/faculty (active)
  ├─ ⏳ 4 Days remaining
  ├─ Amount updates in real-time
  └─ No notifications

Day 3:
  ├─ Progress check - should have 50% tasks done
  ├─ ⏳ 3 Days remaining
  ├─ ✉️ REMINDER EMAIL SENT
  │   "3 Days Left" notification
  │   Shows current progress
  │   Amount due
  └─ User should complete main tasks

Day 4:
  ├─ User should be finalizing
  ├─ ⏳ 2 Days remaining
  ├─ 🔴 ALERT: Timer turns RED (urgent)
  ├─ Dashboard emphasizes deadline
  └─ Final day to add any users

Day 5 (LAST DAY):
  ├─ ⏳ 1 Day remaining
  ├─ 🚨 CRITICAL EMAIL SENT
  │   "URGENT: Last Day!"
  │   "Expires Tomorrow"
  │   "Make Payment NOW"
  ├─ Dashboard shows FINAL WARNING
  ├─ User must complete:
  │   - All users added
  │   - Payment made
  └─ Time running out... hours left!

Day 6 (AFTER DEADLINE):
  ├─ Grace period has EXPIRED
  ├─ If not paid:
  │   ├─ Status: PAYMENT_OVERDUE ❌
  │   ├─ Red alert on dashboard
  │   ├─ ✉️ Urgent payment demand email
  │   ├─ Admin notified
  │   └─ Access may be restricted
  │
  └─ If payment made:
      ├─ Status: ACTIVE ✅
      ├─ All features unlocked
      ├─ Next billing 30 days later
      └─ Subscription confirmed!
```

---

## Automatic Reminder System

```
┌─────────────────────────────────────────────────────────────┐
│              AUTOMATIC EMAIL REMINDERS                      │
└─────────────────────────────────────────────────────────────┘

REMINDER 1: Day 3
┌─────────────────────────────────────────────────────────────┐
│  From: support@portal.com                                   │
│  Subject: ⏰ Reminder: 3 Days Left to Complete Setup        │
│                                                              │
│  Hi [University Name],                                      │
│                                                              │
│  You have 3 DAYS REMAINING to complete your setup:          │
│                                                              │
│  ✓ Task 1: Add Students - Status: [DONE/PENDING]           │
│            Current: 87 students added                       │
│                                                              │
│  ✓ Task 2: Add Faculty - Status: [DONE/PENDING]            │
│            Current: 12 faculty added                        │
│                                                              │
│  ✓ Task 3: Make Payment - Status: [PENDING]                │
│            Amount Due: ₹49,500                              │
│                                                              │
│  Deadline: [DATE, TIME - exact deadline]                    │
│                                                              │
│  [COMPLETE SETUP NOW] button → Dashboard link              │
│                                                              │
│  Need help? Contact support@portal.com                      │
└─────────────────────────────────────────────────────────────┘

REMINDER 2: Day 5 (LAST DAY) 🚨 CRITICAL
┌─────────────────────────────────────────────────────────────┐
│  From: support@portal.com                                   │
│  Subject: 🚨 URGENT: Last Day To Complete Payment           │
│                                                              │
│  ⚠️ RED ALERT - LAST DAY NOTICE ⚠️                          │
│                                                              │
│  Hi [University Name],                                      │
│                                                              │
│  YOUR GRACE PERIOD EXPIRES TOMORROW!                        │
│                                                              │
│  Status: [Deadline - MM/DD/YYYY]                            │
│                                                              │
│  You MUST complete:                                         │
│  ❌ Task 1: Add Students
│  ❌ Task 2: Add Faculty
│  ❌ Task 3: Make Payment (₹49,500)
│                                                              │
│  ⚠️ After tomorrow, your subscription will be marked as     │
│     OVERDUE and you may lose access.                        │
│                                                              │
│  [PAY NOW IMMEDIATELY] button → Payment page               │
│                                                              │
│  Contact us immediately if you need help!                   │
│  Phone: +91-XXXX-XXXX-XXXX                                 │
│  Email: support@portal.com                                  │
└─────────────────────────────────────────────────────────────┘

Automated Sending:
  - Day 3 Reminder: Sent automatically (checked daily)
  - Day 5 Reminder: Sent automatically (critical alert)
  - Email not duplicated (tracked in system)
  - Sent during business hours
```

---

## Status Transitions

```
Status Flow:

PENDING_ACCEPTANCE
    ↓ (User clicks email link)
GRACE_PERIOD
    ↓ (Payment made before deadline)
ACTIVE ✅ (Subscription confirmed, ready to use)
    ↓ (Later)
ACTIVE → PAYMENT_OVERDUE (if renewal payment not made)
    ↓ (Payment made after deadline)
    ACTIVE ✅ (Back to active)

Alternative Path (Overdue):

GRACE_PERIOD
    ↓ (Deadline passes, no payment)
PAYMENT_OVERDUE ❌
    ↓ (Payment made after overdue)
    ACTIVE ✅ (Back to active, but late)
    
    OR
    
    ↓ (Too long overdue)
    CANCELLED ❌ (Subscription cancelled)
    
Other Statuses:
- EXPIRED: Grace period expired, no action taken
- CANCELLED: Manually cancelled by user/admin
```

---

## Real-Time Dashboard Updates

```
Grace Period Dashboard Auto-Refresh (Every 30 Seconds):

┌─────────────────────────────────────────────────────┐
│              REAL-TIME COUNTERS                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  STUDENTS ADDED:  87 ↺ [pulsing animation]          │
│  FACULTY ADDED:   12 ↺ [pulsing animation]          │
│  TOTAL USERS:     99 ↺ [pulsing animation]          │
│  AMOUNT DUE:   ₹49,500 ↺ [pulsing animation]        │
│                                                      │
│  Status: Last updated 2 seconds ago                 │
│  Next refresh: in 28 seconds                        │
│                                                      │
└─────────────────────────────────────────────────────┘

When User Adds Student:
  1. Form submitted
  2. Student record created in DB
  3. UI shows loading state
  4. On success:
     → Student count increments
     → Total users updates
     → Amount due recalculates
     → All counters update instantly
  5. "Student added successfully!" toast message
  6. Form clears, ready for next entry

Chain Reaction:
  Add Student → Count +1 → Amount Due Recalculates 
             → All Displays Update → Realtime Sync
```

---

## Payment Processing Flow

```
Payment Routes:

Route 1: UPI (Fastest)
┌─────────────────────────────┐
│ Show QR Code                │
│ ↓                           │
│ User scans with UPI app     │
│ ↓                           │
│ Enters amount (₹49,500)     │
│ ↓                           │
│ Completes transaction       │
│ ↓                           │
│ Instant confirmation from   │
│ bank to payment provider    │
│ ↓                           │
│ [OPTIONAL] Admin confirms   │
│ in dashboard                │
│ ↓                           │
│ Subscription → ACTIVE       │
└─────────────────────────────┘

Route 2: Bank Transfer (Standard)
┌─────────────────────────────┐
│ Display Bank Details        │
│ ↓                           │
│ User initiates transfer     │
│ from their bank app/ATM     │
│ ↓                           │
│ Wait 24-48 hours for        │
│ transfer to complete        │
│ ↓                           │
│ Admin verifies payment      │
│ in dashboard                │
│ ↓                           │
│ Admin confirms in system    │
│ ↓                           │
│ Subscription → ACTIVE       │
│ User gets confirmation      │
└─────────────────────────────┘

Route 3: Invoice (Flexible)
┌─────────────────────────────┐
│ System auto-generates       │
│ invoice                     │
│ ↓                           │
│ Email sent with invoice     │
│ ↓                           │
│ User pays via their         │
│ preferred method            │
│ ↓                           │
│ Admin marks as paid in      │
│ dashboard                   │
│ ↓                           │
│ Subscription → ACTIVE       │
└─────────────────────────────┘
```

---

## Key Metrics & Calculation

```
REAL-TIME CHARGE CALCULATION:

Monthly Charge Formula:
┌─────────────────────────────────────────────┐
│  Monthly Charge = Total Users × Price/User  │
└─────────────────────────────────────────────┘

Example with BASIC Plan (₹500/user):
  
  Week 1: 50 students
          5 faculty
          = 55 users × ₹500 = ₹27,500
  
  Week 2: Add 25 students
          = 80 users × ₹500 = ₹40,000
  
  Week 3: Add 20 students + 5 faculty
          = 105 users × ₹500 = ₹52,500
  
  Day 5:  Final: 100 students + 10 faculty
          = 110 users × ₹500 = ₹55,000 ← FINAL AMOUNT

This amount is:
✓ Displayed on grace period dashboard
✓ Shown on payment page
✓ Calculated in real-time
✓ Updated after each user addition
✓ Used to generate payment QR code
✓ Tracked in invoices

Annual Projection:
  Monthly: ₹55,000
  Quarterly: ₹165,000
  Annually: ₹660,000 (12 months)
```

---

This visual workflow provides complete clarity on the entire process! 🎯
