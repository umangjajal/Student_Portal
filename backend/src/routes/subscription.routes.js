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
  sendGracePeriodReminders
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
