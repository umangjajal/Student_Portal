import Pricing from "../models/Pricing.js";
import Subscription from "../models/Subscription.js";
import Invoice from "../models/Invoice.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import University from "../models/University.js";

/* =========================
   GET ALL PRICING PLANS
========================= */
export const getPricingPlans = async (req, res) => {
  try {
    const plans = await Pricing.find({ isActive: true }).sort({ pricePerStudent: 1 });
    
    res.json({
      message: "Pricing plans retrieved successfully",
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error("Get Pricing Plans Error:", error.message);
    res.status(500).json({ message: "Failed to fetch pricing plans" });
  }
};

/* =========================
   GET UNIVERSITY SUBSCRIPTION
========================= */
export const getUniversitySubscription = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const subscription = await Subscription.findOne({ universityId })
      .populate('universityId', 'name email');

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    // Get current student count
    const studentCount = await Student.countDocuments({ universityId });
    
    // Get current faculty count
    const facultyCount = await Faculty.countDocuments({ universityId });
    
    // Total users (students + faculty)
    const totalUsers = studentCount + facultyCount;
    
    // Get pricing plan details
    const pricing = await Pricing.findOne({ planName: subscription.planName });

    res.json({
      message: "Subscription details retrieved successfully",
      subscription,
      currentStudentCount: studentCount,
      currentFacultyCount: facultyCount,
      totalUsers: totalUsers,
      planDetails: pricing,
      pricePerUser: pricing?.pricePerStudent || 0,
      monthlyCharges: totalUsers * (pricing?.pricePerStudent || 0)
    });
  } catch (error) {
    console.error("Get Subscription Error:", error.message);
    res.status(500).json({ message: "Failed to fetch subscription details" });
  }
};

/* =========================
   CALCULATE CHARGES
========================= */
export const calculateCharges = async (universityId, planName) => {
  try {
    // Get student count
    const studentCount = await Student.countDocuments({ universityId });
    
    // Get faculty count
    const facultyCount = await Faculty.countDocuments({ universityId });
    
    // Total users
    const totalUsers = studentCount + facultyCount;
    
    // Get pricing plan
    const pricing = await Pricing.findOne({ planName });

    if (!pricing) {
      throw new Error("Pricing plan not found");
    }

    const monthlyCharges = totalUsers * pricing.pricePerStudent;

    return {
      studentCount,
      facultyCount,
      totalUsers,
      pricePerStudent: pricing.pricePerStudent,
      monthlyCharges,
      annualCharges: monthlyCharges * 12
    };
  } catch (error) {
    console.error("Calculate Charges Error:", error.message);
    throw error;
  }
};

/* =========================
   UPGRADE/DOWNGRADE PLAN
========================= */
export const changePlan = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { newPlan } = req.body;

    if (!newPlan || !["BASIC", "ADVANCED", "PREMIUM"].includes(newPlan)) {
      return res.status(400).json({ message: "Invalid plan name" });
    }

    // Get current subscription
    let subscription = await Subscription.findOne({ universityId });

    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    const oldPlan = subscription.planName;

    // Get pricing details
    const pricing = await Pricing.findOne({ planName: newPlan });
    if (!pricing) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Calculate charges
    const charges = await calculateCharges(universityId, newPlan);

    // Update subscription
    subscription.planName = newPlan;
    subscription.monthlyCharges = charges.monthlyCharges;
    subscription.studentCount = charges.studentCount;
    subscription.upgradedFrom = oldPlan;
    subscription.upgradedAt = new Date();
    subscription.status = "ACTIVE";

    await subscription.save();

    res.json({
      message: `Successfully upgraded from ${oldPlan} to ${newPlan}`,
      subscription,
      charges
    });
  } catch (error) {
    console.error("Change Plan Error:", error.message);
    res.status(500).json({ message: "Failed to change plan" });
  }
};

/* =========================
   UPDATE RENEWAL DATE
========================= */
const calculateRenewalDate = (billingCycle) => {
  const date = new Date();
  
  switch(billingCycle) {
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "QUARTERLY":
      date.setMonth(date.getMonth() + 3);
      break;
    case "ANNUALLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date;
};

/* =========================
   SET BILLING CYCLE
========================= */
export const setBillingCycle = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { billingCycle } = req.body;

    if (!["MONTHLY", "QUARTERLY", "ANNUALLY"].includes(billingCycle)) {
      return res.status(400).json({ message: "Invalid billing cycle" });
    }

    const subscription = await Subscription.findOne({ universityId });

    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    subscription.billingCycle = billingCycle;
    subscription.renewalDate = calculateRenewalDate(billingCycle);

    await subscription.save();

    res.json({
      message: `Billing cycle updated to ${billingCycle}`,
      subscription
    });
  } catch (error) {
    console.error("Set Billing Cycle Error:", error.message);
    res.status(500).json({ message: "Failed to update billing cycle" });
  }
};

/* =========================
   GENERATE INVOICE
========================= */
export const generateInvoice = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const subscription = await Subscription.findOne({ universityId });
    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    // Get pricing details
    const pricing = await Pricing.findOne({ planName: subscription.planName });
    
    // Get student count for this billing period
    const studentCount = await Student.countDocuments({ universityId });

    // Generate invoice number
    const invoiceNumber = `INV-${universityId.toString().slice(-8)}-${Date.now()}`;

    // Create invoice
    const invoice = await Invoice.create({
      universityId,
      subscriptionId: subscription._id,
      invoiceNumber,
      billingPeriodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      billingPeriodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      studentCount,
      pricePerStudent: pricing.pricePerStudent,
      subtotal: studentCount * pricing.pricePerStudent,
      tax: 0,
      discount: 0,
      totalAmount: studentCount * pricing.pricePerStudent,
      status: "SENT",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      items: [{
        description: `${subscription.planName} Plan - ${studentCount} students`,
        quantity: studentCount,
        unitPrice: pricing.pricePerStudent,
        amount: studentCount * pricing.pricePerStudent
      }]
    });

    res.status(201).json({
      message: "Invoice generated successfully",
      invoice
    });
  } catch (error) {
    console.error("Generate Invoice Error:", error.message);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};

/* =========================
   GET INVOICES
========================= */
export const getInvoices = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const invoices = await Invoice.find({ universityId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      message: "Invoices retrieved successfully",
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error("Get Invoices Error:", error.message);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

/* =========================
   ADMIN: GET ALL SUBSCRIPTIONS
========================= */
export const adminGetAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('universityId', 'name email')
      .sort({ createdAt: -1 });

    // Add student count for each
    const detailed = await Promise.all(
      subscriptions.map(async (sub) => {
        const studentCount = await Student.countDocuments({ universityId: sub.universityId._id });
        return {
          ...sub.toObject(),
          currentStudentCount: studentCount
        };
      })
    );

    res.json({
      message: "All subscriptions retrieved",
      count: detailed.length,
      data: detailed
    });
  } catch (error) {
    console.error("Admin Get Subscriptions Error:", error.message);
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};

/* =========================
   ADMIN: UPDATE SUBSCRIPTION
========================= */
export const adminUpdateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { planName, status, billingCycle, notes } = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { planName, status, billingCycle, notes },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({
      message: "Subscription updated successfully",
      subscription
    });
  } catch (error) {
    console.error("Admin Update Subscription Error:", error.message);
    res.status(500).json({ message: "Failed to update subscription" });
  }
};

/* =========================
   ADMIN: MANAGE PRICING PLANS
========================= */
export const adminCreatePricingPlan = async (req, res) => {
  try {
    const { planName, pricePerStudent, features, description } = req.body;

    const existingPlan = await Pricing.findOne({ planName });
    if (existingPlan) {
      return res.status(400).json({ message: "Plan already exists" });
    }

    const plan = await Pricing.create({
      planName,
      pricePerStudent,
      features,
      description
    });

    res.status(201).json({
      message: "Pricing plan created successfully",
      plan
    });
  } catch (error) {
    console.error("Create Pricing Plan Error:", error.message);
    res.status(500).json({ message: "Failed to create pricing plan" });
  }
};

export const adminUpdatePricingPlan = async (req, res) => {
  try {
    const { planName } = req.params;
    const updates = req.body;

    const plan = await Pricing.findOneAndUpdate(
      { planName },
      updates,
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({
      message: "Pricing plan updated successfully",
      plan
    });
  } catch (error) {
    console.error("Update Pricing Plan Error:", error.message);
    res.status(500).json({ message: "Failed to update pricing plan" });
  }
};

/* =========================
   SELECT PLAN & INITIATE SUBSCRIPTION
   (Sends confirmation email with acceptance link)
========================= */
export const selectPlanAndInitiate = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { planName } = req.body;

    if (!["BASIC", "ADVANCED", "PREMIUM"].includes(planName)) {
      return res.status(400).json({ message: "Invalid plan name" });
    }

    // Check if subscription already exists
    let subscription = await Subscription.findOne({ universityId });

    if (subscription && subscription.isAccepted) {
      return res.status(400).json({ message: "You already have an active subscription. Upgrade/downgrade your plan instead." });
    }

    // Get pricing details
    const pricing = await Pricing.findOne({ planName });
    if (!pricing) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Generate acceptance token
    const acceptanceToken = require('crypto').randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (!subscription) {
      // Create new subscription
      subscription = await Subscription.create({
        universityId,
        planName,
        status: "PENDING_ACCEPTANCE",
        isAccepted: false,
        acceptanceToken,
        acceptanceTokenExpiresAt: tokenExpiry,
        confirmationEmailSent: false
      });
    } else {
      // Update existing pending subscription
      subscription.planName = planName;
      subscription.status = "PENDING_ACCEPTANCE";
      subscription.isAccepted = false;
      subscription.acceptanceToken = acceptanceToken;
      subscription.acceptanceTokenExpiresAt = tokenExpiry;
      subscription.confirmationEmailSent = false;
      await subscription.save();
    }

    // Get university details for email
    const university = await University.findById(universityId);
    
    // Build acceptance link
    const acceptanceLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/subscription/accept?token=${acceptanceToken}`;

    // Send confirmation email
    try {
      const mailConfig = require('../config/mail.js');
      const transporter = mailConfig.default;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: university.email,
        subject: `Subscription Confirmation Required - ${planName} Plan`,
        html: `
          <h2>Welcome to our Subscription Service!</h2>
          <p>Hi ${university.name},</p>
          <p>You have selected the <strong>${planName}</strong> plan for your university.</p>
          
          <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Plan Details:</h3>
            <ul>
              <li>Plan: <strong>${planName}</strong></li>
              <li>Price per User: <strong>₹${pricing.pricePerStudent}/month</strong></li>
              <li>Grace Period: <strong>5 days</strong></li>
              <li>Payment Due: Within 5 days of acceptance</li>
            </ul>
          </div>

          <h3>Next Steps:</h3>
          <ol>
            <li><strong>Accept Subscription:</strong> Click the button below to confirm</li>
            <li><strong>Add Users:</strong> You'll have 5 days to add all your students and faculty</li>
            <li><strong>Make Payment:</strong> Complete payment within 5 days for all enrolled users</li>
          </ol>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${acceptanceLink}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Subscription
            </a>
          </p>

          <p style="color: #666; font-size: 12px;">
            <strong>⏰ Important:</strong> This acceptance link expires in 24 hours. If it expires, you can request a new one.
          </p>

          <hr>
          <p style="color: #999; font-size: 12px;">
            If you didn't request this, please disregard this email.
          </p>
        `
      });

      subscription.confirmationEmailSent = true;
      subscription.confirmationEmailSentAt = new Date();
      await subscription.save();
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      // Don't fail the whole request if email fails
    }

    res.status(201).json({
      message: "Subscription initiated successfully. Confirmation email sent.",
      subscription: {
        planName: subscription.planName,
        status: subscription.status,
        message: `A confirmation email has been sent to ${university.email}. Please accept the subscription within 24 hours.`
      }
    });
  } catch (error) {
    console.error("Select Plan Error:", error.message);
    res.status(500).json({ message: "Failed to initiate subscription" });
  }
};

/* =========================
   ACCEPT SUBSCRIPTION
   (Verify token and start 5-day grace period)
========================= */
export const acceptSubscription = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Acceptance token required" });
    }

    // Find subscription by token
    const subscription = await Subscription.findOne({
      acceptanceToken: token,
      acceptanceTokenExpiresAt: { $gt: new Date() }
    }).populate('universityId');

    if (!subscription) {
      return res.status(401).json({ message: "Invalid or expired acceptance token" });
    }

    // Calculate grace period dates
    const now = new Date();
    const gracePeriodEndDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days

    // Update subscription
    subscription.isAccepted = true;
    subscription.acceptedAt = now;
    subscription.acceptanceToken = undefined; // Clear token
    subscription.acceptanceTokenExpiresAt = undefined;
    subscription.status = "GRACE_PERIOD";
    subscription.gracePeriodEndDate = gracePeriodEndDate;
    subscription.paymentDueDate = gracePeriodEndDate;
    subscription.gracePeriodDaysRemaining = 5;

    await subscription.save();

    // Send welcome email
    try {
      const mailConfig = require('../config/mail.js');
      const transporter = mailConfig.default;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: subscription.universityId.email,
        subject: `Subscription Accepted! 5-Day Grace Period Starts Now`,
        html: `
          <h2>Subscription Activated!</h2>
          <p>Hi ${subscription.universityId.name},</p>
          <p>Your <strong>${subscription.planName}</strong> plan has been successfully activated.</p>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #155724;">⏳ Grace Period: 5 Days</h3>
            <ul>
              <li>Plan: <strong>${subscription.planName}</strong></li>
              <li>Grace Period End: <strong>${gracePeriodEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></li>
              <li>Payment Due: <strong>${gracePeriodEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></li>
            </ul>
          </div>

          <h3>During the 5-day grace period, you can:</h3>
          <ul>
            <li>✅ Add all your students and faculty members</li>
            <li>✅ View real-time calculation of charges based on enrolled users</li>
            <li>✅ Make the full payment before the deadline</li>
          </ul>

          <h3>Next Steps:</h3>
          <ol>
            <li>Go to your <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/dashboard">Dashboard</a></li>
            <li>Add all students and faculty in the next 5 days</li>
            <li>Check your bill amounts automatically calculated</li>
            <li>Proceed with payment before the deadline</li>
          </ol>

          <p style="color: #d32f2f; font-weight: bold;">
            ⚠️ <strong>IMPORTANT:</strong> If you do not add your students/faculty and complete payment by ${gracePeriodEndDate.toLocaleDateString()}, your subscription will be marked as overdue.
          </p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/subscription" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Subscription Dashboard
            </a>
          </p>
        `
      });
    } catch (emailErr) {
      console.error("Welcome email error:", emailErr);
    }

    res.json({
      message: "Subscription accepted successfully! 5-day grace period started.",
      subscription: {
        status: subscription.status,
        planName: subscription.planName,
        acceptedAt: subscription.acceptedAt,
        gracePeriodEndDate: subscription.gracePeriodEndDate,
        paymentDueDate: subscription.paymentDueDate,
        gracePeriodDaysRemaining: 5
      }
    });
  } catch (error) {
    console.error("Accept Subscription Error:", error.message);
    res.status(500).json({ message: "Failed to accept subscription" });
  }
};

/* =========================
   GET SUBSCRIPTION STATUS WITH GRACE PERIOD
========================= */
export const getSubscriptionWithGracePeriod = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const subscription = await Subscription.findOne({ universityId })
      .populate('universityId', 'name email');

    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    // Calculate days remaining in grace period
    let gracePeriodDaysRemaining = 0;
    let isInGracePeriod = false;
    let paymentStatus = "NOT_DUE";

    if (subscription.status === "GRACE_PERIOD" && subscription.gracePeriodEndDate) {
      const now = new Date();
      const daysRemaining = Math.ceil((subscription.gracePeriodEndDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        gracePeriodDaysRemaining = daysRemaining;
        isInGracePeriod = true;
        paymentStatus = "IN_GRACE_PERIOD";
      } else {
        paymentStatus = "OVERDUE";
        subscription.status = "PAYMENT_OVERDUE";
        await subscription.save();
      }
    }

    // Get current counts
    const studentCount = await Student.countDocuments({ universityId });
    const facultyCount = await Faculty.countDocuments({ universityId });
    const totalUsers = studentCount + facultyCount;

    // Get pricing
    const pricing = await Pricing.findOne({ planName: subscription.planName });

    res.json({
      message: "Subscription status retrieved",
      subscription: {
        _id: subscription._id,
        planName: subscription.planName,
        status: subscription.status,
        isAccepted: subscription.isAccepted,
        acceptedAt: subscription.acceptedAt,
        confirmationEmailSent: subscription.confirmationEmailSent,
        gracePeriodEndDate: subscription.gracePeriodEndDate,
        paymentDueDate: subscription.paymentDueDate,
        gracePeriodDaysRemaining,
        isInGracePeriod,
        paymentStatus,
        lastPaymentDate: subscription.lastPaymentDate,
        createdAt: subscription.createdAt
      },
      userCounts: {
        studentCount,
        facultyCount,
        totalUsers
      },
      charges: {
        pricePerUser: pricing?.pricePerStudent || 0,
        monthlyCharges: totalUsers * (pricing?.pricePerStudent || 0),
        estimatedTotal: totalUsers * (pricing?.pricePerStudent || 0)
      }
    });
  } catch (error) {
    console.error("Get Subscription with Grace Period Error:", error.message);
    res.status(500).json({ message: "Failed to fetch subscription status" });
  }
};

/* =========================
   SEND REMINDER EMAILS DURING GRACE PERIOD
========================= */
export const sendGracePeriodReminders = async (req, res) => {
  try {
    // Find all subscriptions in grace period
    const subscriptions = await Subscription.find({
      status: "GRACE_PERIOD",
      gracePeriodEndDate: { $exists: true }
    }).populate('universityId');

    let remindersCount = 0;

    for (const subscription of subscriptions) {
      const now = new Date();
      const daysRemaining = Math.ceil((subscription.gracePeriodEndDate - now) / (1000 * 60 * 60 * 24));

      // Send day 3 reminder
      if (daysRemaining === 3) {
        const emailSent = subscription.reminderEmailsSent?.some(r => r.type === "DAY_3");
        if (!emailSent) {
          try {
            const mailConfig = require('../config/mail.js');
            const transporter = mailConfig.default;

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: subscription.universityId.email,
              subject: `⏰ Reminder: 3 Days Left to Complete Your Subscription Setup`,
              html: `
                <h2>Friendly Reminder</h2>
                <p>Hi ${subscription.universityId.name},</p>
                <p>You have <strong>3 days remaining</strong> in your grace period to:</p>
                <ul>
                  <li>✅ Add all your students and faculty members</li>
                  <li>✅ Complete the payment for your ${subscription.planName} plan</li>
                </ul>
                <p><strong>Deadline:</strong> ${subscription.gracePeriodEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/subscription" style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Complete Setup Now
                  </a>
                </p>
              `
            });

            subscription.reminderEmailsSent.push({ type: "DAY_3", sentAt: now });
            await subscription.save();
            remindersCount++;
          } catch (emailErr) {
            console.error("Day 3 reminder email error:", emailErr);
          }
        }
      }

      // Send critical day 5 reminder
      if (daysRemaining === 1) {
        const emailSent = subscription.reminderEmailsSent?.some(r => r.type === "DAY_5_CRITICAL");
        if (!emailSent) {
          try {
            const mailConfig = require('../config/mail.js');
            const transporter = mailConfig.default;

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: subscription.universityId.email,
              subject: `🚨 URGENT: Last Day To Complete Payment - Your Subscription Expires Tomorrow`,
              html: `
                <h2 style="color: #d32f2f;">⚠️ URGENT - LAST DAY NOTICE</h2>
                <p>Hi ${subscription.universityId.name},</p>
                <p style="color: #d32f2f; font-weight: bold; font-size: 16px;">
                  Your grace period expires <strong>TOMORROW (${subscription.gracePeriodEndDate.toLocaleDateString()})</strong>
                </p>
                
                <div style="background: #ffebee; border: 2px solid #d32f2f; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p>You must complete the following before the deadline:</p>
                  <ul style="color: #d32f2f;">
                    <li>✅ Finalize your student and faculty list</li>
                    <li>✅ Complete the full payment for your ${subscription.planName} plan</li>
                  </ul>
                </div>

                <p style="color: #d32f2f; font-weight: bold;">
                  After tomorrow, your subscription will be marked as <strong>OVERDUE</strong> and your access may be restricted.
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/subscription" style="background: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Complete Payment Immediately
                  </a>
                </p>

                <p>If you have any questions, please contact our support team immediately.</p>
              `
            });

            subscription.reminderEmailsSent.push({ type: "DAY_5_CRITICAL", sentAt: now });
            await subscription.save();
            remindersCount++;
          } catch (emailErr) {
            console.error("Day 5 critical reminder email error:", emailErr);
          }
        }
      }
    }

    res.json({
      message: `Reminder emails sent successfully`,
      remindersCount,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Send Reminders Error:", error.message);
    res.status(500).json({ message: "Failed to send reminder emails" });
  }
};

/* =========================
   CLAIM FREE TRIAL (No email required)
========================= */
export const claimFreeTrial = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    // Check if already has subscription
    let subscription = await Subscription.findOne({ universityId });

    if (subscription && subscription.isAccepted) {
      return res.status(400).json({ message: "You already have an active subscription. Cannot claim free trial." });
    }

    // Get FREE_TRIAL pricing
    const pricing = await Pricing.findOne({ planName: "FREE_TRIAL" });
    if (!pricing) {
      return res.status(404).json({ message: "Free trial plan not available" });
    }

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    if (!subscription) {
      // Create new free trial subscription
      subscription = await Subscription.create({
        universityId,
        planName: "FREE_TRIAL",
        isFreeTrial: true,
        isAccepted: true,
        acceptedAt: now,
        status: "GRACE_PERIOD", // Using GRACE_PERIOD status for 30-day trial
        gracePeriodEndDate: trialEndDate,
        paymentDueDate: trialEndDate,
        gracePeriodDaysRemaining: 30,
        freeTrialStartDate: now,
        freeTrialEndDate: trialEndDate,
        freeTrialDaysRemaining: 30,
        confirmationEmailSent: false
      });
    } else {
      // Update existing subscription to free trial
      subscription.planName = "FREE_TRIAL";
      subscription.isFreeTrial = true;
      subscription.isAccepted = true;
      subscription.acceptedAt = now;
      subscription.status = "GRACE_PERIOD";
      subscription.gracePeriodEndDate = trialEndDate;
      subscription.paymentDueDate = trialEndDate;
      subscription.gracePeriodDaysRemaining = 30;
      subscription.freeTrialStartDate = now;
      subscription.freeTrialEndDate = trialEndDate;
      subscription.freeTrialDaysRemaining = 30;
      await subscription.save();
    }

    const university = await University.findById(universityId);

    // Send free trial welcome email
    try {
      const mailConfig = require('../config/mail.js');
      const transporter = mailConfig.default;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: university.email,
        subject: `🎉 Welcome to Your FREE TRIAL - 30 Days of Full Access!`,
        html: `
          <h2>Welcome to Your Free Trial!</h2>
          <p>Hi ${university.name},</p>
          <p>You have successfully started your <strong>FREE TRIAL</strong> subscription!</p>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #155724;">🎁 Free Trial Details</h3>
            <ul>
              <li><strong>Duration:</strong> 30 Days (${now.toLocaleDateString()} - ${trialEndDate.toLocaleDateString()})</li>
              <li><strong>Free Students:</strong> Up to 100 students with full features</li>
              <li><strong>Features:</strong> Complete access to all core features</li>
              <li><strong>No Credit Card Required!</strong> 💳</li>
              <li><strong>Cost:</strong> Completely FREE</li>
            </ul>
          </div>

          <h3>What You Can Do in Your Free Trial:</h3>
          <ul>
            <li>✅ Add up to 100 students</li>
            <li>✅ Add faculty and staff</li>
            <li>✅ Create classes and assignments</li>
            <li>✅ Track attendance</li>
            <li>✅ Manage fees and invoices</li>
            <li>✅ Send notifications</li>
            <li>✅ View reports and analytics</li>
            <li>✅ Experience all core features</li>
          </ul>

          <h3>After Your Free Trial (30 Days):</h3>
          <p>You can upgrade to any paid plan:</p>
          <ul>
            <li><strong>BASIC:</strong> ₹500 per student/month</li>
            <li><strong>ADVANCED:</strong> ₹750 per student/month</li>
            <li><strong>PREMIUM:</strong> ₹1000 per student/month</li>
          </ul>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/dashboard" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Your Dashboard
            </a>
          </p>

          <p style="color: #666; font-size: 12px;">
            <strong>📅 Trial Expires:</strong> ${trialEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        `
      });
    } catch (emailErr) {
      console.error("Free trial welcome email error:", emailErr);
    }

    res.json({
      message: "Free trial claimed successfully! You have 30 days of full access.",
      subscription: {
        planName: subscription.planName,
        isFreeTrial: true,
        freeTrialStartDate: subscription.freeTrialStartDate,
        freeTrialEndDate: subscription.freeTrialEndDate,
        freeTrialDaysRemaining: 30,
        maxStudents: 100,
        features: "All core features included",
        status: "ACTIVE"
      }
    });
  } catch (error) {
    console.error("Claim Free Trial Error:", error.message);
    res.status(500).json({ message: "Failed to claim free trial" });
  }
};

/* =========================
   UPGRADE FROM FREE TRIAL TO PAID PLAN
========================= */
export const upgradeFromFreeTrial = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { newPlan } = req.body;

    if (!newPlan || !["BASIC", "ADVANCED", "PREMIUM"].includes(newPlan)) {
      return res.status(400).json({ message: "Invalid plan name" });
    }

    const subscription = await Subscription.findOne({ universityId });

    if (!subscription || !subscription.isFreeTrial) {
      return res.status(400).json({ message: "You are not on a free trial plan" });
    }

    // Get new plan details
    const pricing = await Pricing.findOne({ planName: newPlan });
    if (!pricing) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Calculate charges
    const charges = await calculateCharges(universityId, newPlan);

    // Update subscription
    subscription.planName = newPlan;
    subscription.isFreeTrial = false;
    subscription.freeTrialStartDate = undefined;
    subscription.freeTrialEndDate = undefined;
    subscription.freeTrialDaysRemaining = 0;
    subscription.status = "GRACE_PERIOD"; // Start 5-day grace period for payment
    subscription.monthlyCharges = charges.monthlyCharges;

    // Set new grace period (5 days for payment)
    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    subscription.gracePeriodEndDate = gracePeriodEnd;
    subscription.paymentDueDate = gracePeriodEnd;
    subscription.gracePeriodDaysRemaining = 5;

    await subscription.save();

    const university = await University.findById(universityId);

    // Send upgrade email
    try {
      const mailConfig = require('../config/mail.js');
      const transporter = mailConfig.default;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: university.email,
        subject: `✅ Upgrade Confirmed - ${newPlan} Plan Started`,
        html: `
          <h2>Upgrade Successful!</h2>
          <p>Hi ${university.name},</p>
          <p>Your free trial has ended and you've successfully upgraded to the <strong>${newPlan}</strong> plan!</p>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #155724;">Plan Details</h3>
            <ul>
              <li><strong>Plan:</strong> ${newPlan}</li>
              <li><strong>Price per User:</strong> ₹${pricing.pricePerStudent}/month</li>
              <li><strong>Monthly Charge:</strong> ₹${charges.monthlyCharges.toLocaleString()}</li>
              <li><strong>Grace Period:</strong> 5 Days</li>
              <li><strong>Payment Due:</strong> ${gracePeriodEnd.toLocaleDateString()}</li>
            </ul>
          </div>

          <h3>Next Steps:</h3>
          <ol>
            <li>Review all students and faculty added</li>
            <li>Check the total monthly charges</li>
            <li>Complete payment within 5 days</li>
          </ol>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/subscription" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Payment
            </a>
          </p>
        `
      });
    } catch (emailErr) {
      console.error("Upgrade email error:", emailErr);
    }

    res.json({
      message: `Successfully upgraded to ${newPlan} plan! Please complete payment within 5 days.`,
      subscription: {
        planName: newPlan,
        isFreeTrial: false,
        status: "GRACE_PERIOD",
        monthlyCharges: charges.monthlyCharges,
        gracePeriodDaysRemaining: 5,
        paymentDueDate: gracePeriodEnd
      }
    });
  } catch (error) {
    console.error("Upgrade From Free Trial Error:", error.message);
    res.status(500).json({ message: "Failed to upgrade from free trial" });
  }
};


export const confirmPayment = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { amount, transactionId, paymentMethod } = req.body;

    if (!amount || !transactionId) {
      return res.status(400).json({ message: "Amount and transaction ID are required" });
    }

    const subscription = await Subscription.findOne({ universityId }).populate('universityId');

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Update subscription with payment info
    subscription.lastPaymentDate = new Date();
    subscription.lastPaymentAmount = amount;
    subscription.paymentMethod = paymentMethod || "INVOICE";

    // If in grace period and payment made, move to ACTIVE
    if (subscription.status === "GRACE_PERIOD") {
      subscription.status = "ACTIVE";
      subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }

    await subscription.save();

    // Create invoice entry
    try {
      await Invoice.create({
        universityId,
        subscriptionId: subscription._id,
        transactionId,
        amount,
        paymentMethod: paymentMethod || "INVOICE",
        status: "COMPLETED",
        invoiceDate: new Date()
      });
    } catch (invoiceErr) {
      console.error("Invoice creation error:", invoiceErr);
    }

    // Send payment confirmation email
    try {
      const mailConfig = require('../config/mail.js');
      const transporter = mailConfig.default;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: subscription.universityId.email,
        subject: `✅ Payment Received - Subscription Activated`,
        html: `
          <h2>Payment Received Successfully!</h2>
          <p>Hi ${subscription.universityId.name},</p>
          <p>We have received your payment for your <strong>${subscription.planName}</strong> plan.</p>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #155724;">Payment Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Plan:</strong> ${subscription.planName}</li>
              <li><strong>Amount:</strong> ₹${amount.toLocaleString()}</li>
              <li><strong>Transaction ID:</strong> ${transactionId}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Status:</strong> <span style="color: #28a745;">✓ CONFIRMED</span></li>
            </ul>
          </div>

          <h3>What's Next?</h3>
          <ul>
            <li>Your subscription is now <strong>ACTIVE</strong></li>
            <li>All your students and faculty have full access</li>
            <li>Your next billing cycle will be in 30 days</li>
            <li>You can manage your subscription at any time from your dashboard</li>
          </ul>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/university/subscription" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
        `
      });
    } catch (emailErr) {
      console.error("Payment confirmation email error:", emailErr);
    }

    res.json({
      message: "Payment confirmed successfully. Subscription activated!",
      subscription: {
        status: subscription.status,
        planName: subscription.planName,
        lastPaymentDate: subscription.lastPaymentDate,
        lastPaymentAmount: subscription.lastPaymentAmount,
        renewalDate: subscription.renewalDate
      }
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error.message);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};

/* =========================
   GET GRACE PERIOD PROGRESS
========================= */
export const getGracePeriodProgress = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const subscription = await Subscription.findOne({ universityId });

    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    if (subscription.status !== "GRACE_PERIOD") {
      return res.status(400).json({ message: "Subscription is not in grace period" });
    }

    // Get current user counts
    const studentCount = await Student.countDocuments({ universityId });
    const facultyCount = await Faculty.countDocuments({ universityId });
    const totalUsers = studentCount + facultyCount;

    // Calculate days remaining
    const now = new Date();
    const daysRemaining = Math.ceil((subscription.gracePeriodEndDate - now) / (1000 * 60 * 60 * 24));

    // Get pricing
    const pricing = await Pricing.findOne({ planName: subscription.planName });
    const totalCharge = totalUsers * (pricing?.pricePerStudent || 0);

    res.json({
      message: "Grace period progress retrieved",
      gracePeriod: {
        daysRemaining,
        startDate: subscription.acceptedAt,
        endDate: subscription.gracePeriodEndDate,
        status: daysRemaining > 0 ? "ACTIVE" : "EXPIRED"
      },
      progress: {
        students: {
          count: studentCount,
          status: studentCount > 0 ? "completed" : "pending"
        },
        faculty: {
          count: facultyCount,
          status: facultyCount > 0 ? "completed" : "pending"
        },
        payment: {
          amount: totalCharge,
          status: subscription.lastPaymentDate ? "completed" : "pending"
        }
      },
      summary: {
        totalUsers,
        totalCharge,
        allTasksCompleted: studentCount > 0 && totalCharge > 0,
        paymentCompleted: subscription.lastPaymentDate !== undefined
      }
    });
  } catch (error) {
    console.error("Grace Period Progress Error:", error.message);
    res.status(500).json({ message: "Failed to fetch grace period progress" });
  }
};

/* =========================
   EXTEND GRACE PERIOD
   (Admin only - for emergency extensions)
========================= */
export const extendGracePeriod = async (req, res) => {
  try {
    const { universityId, days } = req.body;

    if (!universityId || !days || days < 1) {
      return res.status(400).json({ message: "University ID and extension days (minimum 1) are required" });
    }

    const subscription = await Subscription.findOne({ universityId });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Calculate new end date
    const newEndDate = new Date(subscription.gracePeriodEndDate.getTime() + days * 24 * 60 * 60 * 1000);

    subscription.gracePeriodEndDate = newEndDate;
    subscription.paymentDueDate = newEndDate;
    subscription.gracePeriodDaysRemaining = Math.ceil((newEndDate - new Date()) / (1000 * 60 * 60 * 24));

    await subscription.save();

    // Send email notification
    try {
      const university = await University.findById(universityId);
      const mailConfig = require('../config/mail.js');
      const transporter = mailConfig.default;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: university.email,
        subject: `Grace Period Extended - New Deadline: ${newEndDate.toLocaleDateString()}`,
        html: `
          <h2>Grace Period Extended</h2>
          <p>Hi ${university.name},</p>
          <p>Your grace period has been extended by <strong>${days} days</strong>.</p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>New Deadline:</strong> ${newEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Days Remaining:</strong> ${subscription.gracePeriodDaysRemaining} days</p>
          </div>

          <p>Please ensure you complete all tasks before the new deadline.</p>
        `
      });
    } catch (emailErr) {
      console.error("Extension notification email error:", emailErr);
    }

    res.json({
      message: `Grace period extended by ${days} days`,
      subscription: {
        gracePeriodEndDate: subscription.gracePeriodEndDate,
        gracePeriodDaysRemaining: subscription.gracePeriodDaysRemaining
      }
    });
  } catch (error) {
    console.error("Extend Grace Period Error:", error.message);
    res.status(500).json({ message: "Failed to extend grace period" });
  }
};
