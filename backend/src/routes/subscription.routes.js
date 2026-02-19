import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";

import {
  getPricingPlans,
  getUniversitySubscription,
  changePlan,
  setBillingCycle,
  generateInvoice,
  getInvoices,
  adminGetAllSubscriptions,
  adminUpdateSubscription,
  adminCreatePricingPlan,
  adminUpdatePricingPlan,
  selectPlanAndInitiate,
  acceptSubscription,
  getSubscriptionWithGracePeriod,
  sendGracePeriodReminders,
  confirmPayment,
  getGracePeriodProgress,
  extendGracePeriod,
  claimFreeTrial,
  upgradeFromFreeTrial
} from "../controllers/subscription.controller.js";

const router = express.Router();

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/pricing-plans", getPricingPlans);

// Accept subscription via email token (public, no auth required)
router.post("/accept", acceptSubscription);

/* =========================
   UNIVERSITY ROUTES
========================= */
router.get(
  "/my-subscription",
  auth,
  roleCheck("UNIVERSITY"),
  getUniversitySubscription
);

// NEW: Select plan and initiate subscription (sends email)
router.post(
  "/select-plan",
  auth,
  roleCheck("UNIVERSITY"),
  selectPlanAndInitiate
);

// NEW: Claim free trial (instant activation, no email)
router.post(
  "/claim-free-trial",
  auth,
  roleCheck("UNIVERSITY"),
  claimFreeTrial
);

// NEW: Upgrade from free trial to paid plan
router.post(
  "/upgrade-from-trial",
  auth,
  roleCheck("UNIVERSITY"),
  upgradeFromFreeTrial
);

// NEW: Get subscription with grace period info
router.get(
  "/status/grace-period",
  auth,
  roleCheck("UNIVERSITY"),
  getSubscriptionWithGracePeriod
);

router.post(
  "/change-plan",
  auth,
  roleCheck("UNIVERSITY"),
  changePlan
);

router.post(
  "/set-billing-cycle",
  auth,
  roleCheck("UNIVERSITY"),
  setBillingCycle
);

router.post(
  "/generate-invoice",
  auth,
  roleCheck("UNIVERSITY"),
  generateInvoice
);

router.get(
  "/invoices",
  auth,
  roleCheck("UNIVERSITY"),
  getInvoices
);

// NEW: Confirm Payment
router.post(
  "/confirm-payment",
  auth,
  roleCheck("UNIVERSITY"),
  confirmPayment
);

// NEW: Get grace period progress
router.get(
  "/progress/grace-period",
  auth,
  roleCheck("UNIVERSITY"),
  getGracePeriodProgress
);

/* =========================
   ADMIN ROUTES
========================= */
router.get(
  "/admin/all-subscriptions",
  auth,
  roleCheck("ADMIN"),
  adminGetAllSubscriptions
);

// NEW: Send grace period reminder emails
router.post(
  "/admin/send-reminders",
  auth,
  roleCheck("ADMIN"),
  sendGracePeriodReminders
);

// NEW: Extend grace period (emergency extension)
router.post(
  "/admin/extend-grace-period",
  auth,
  roleCheck("ADMIN"),
  extendGracePeriod
);

router.put(
  "/admin/subscription/:subscriptionId",
  auth,
  roleCheck("ADMIN"),
  adminUpdateSubscription
);

router.post(
  "/admin/pricing-plan",
  auth,
  roleCheck("ADMIN"),
  adminCreatePricingPlan
);

router.put(
  "/admin/pricing-plan/:planName",
  auth,
  roleCheck("ADMIN"),
  adminUpdatePricingPlan
);

export default router;
