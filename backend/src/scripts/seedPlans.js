import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import model
import Pricing from '../models/Pricing.js';

async function seedPlans() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check and create plans
    const plans = [
      {
        planName: 'FREE_TRIAL',
        pricePerStudent: 0,
        isFreeTrial: true,
        freeTrialDays: 30,
        freeTrialMaxStudents: 100,
        description: '30-day free trial with 100 free students',
        features: {
          studentManagement: true,
          attendanceTracking: true,
          notificationSystem: true,
          feeManagement: true,
          basicReports: true,
          advancedAnalytics: false,
          customReports: false,
          bulkUpload: true,
          apiAccess: false,
          prioritySupport: false,
          aiInsights: false,
          advancedFeeTracking: false,
          customIntegrations: false,
          dedicatedAccountManager: false,
          sso: false,
          dataExport: false,
          whiteLabel: false
        },
        maxStudents: 100,
        maxFaculty: null,
        storageGB: 10,
        color: '#10b981',
        badge: '🎁 FREE',
        isActive: true
      },
      {
        planName: 'BASIC',
        pricePerStudent: 500,
        isFreeTrial: false,
        description: 'Perfect for small institutions',
        features: {
          studentManagement: true,
          attendanceTracking: true,
          notificationSystem: true,
          feeManagement: true,
          basicReports: true,
          advancedAnalytics: false,
          customReports: false,
          bulkUpload: true,
          apiAccess: false,
          prioritySupport: false,
          aiInsights: false,
          advancedFeeTracking: false,
          customIntegrations: false,
          dedicatedAccountManager: false,
          sso: false,
          dataExport: false,
          whiteLabel: false
        },
        maxStudents: 500,
        maxFaculty: 50,
        storageGB: 50,
        color: '#3b82f6',
        badge: '⭐ BASIC',
        isActive: true
      },
      {
        planName: 'ADVANCED',
        pricePerStudent: 750,
        isFreeTrial: false,
        description: 'Advanced features for growing institutions',
        features: {
          studentManagement: true,
          attendanceTracking: true,
          notificationSystem: true,
          feeManagement: true,
          basicReports: true,
          advancedAnalytics: true,
          customReports: true,
          bulkUpload: true,
          apiAccess: true,
          prioritySupport: true,
          aiInsights: false,
          advancedFeeTracking: true,
          customIntegrations: false,
          dedicatedAccountManager: false,
          sso: false,
          dataExport: true,
          whiteLabel: false
        },
        maxStudents: 2000,
        maxFaculty: 200,
        storageGB: 200,
        color: '#8b5cf6',
        badge: '🚀 ADVANCED',
        isActive: true
      },
      {
        planName: 'PREMIUM',
        pricePerStudent: 1000,
        isFreeTrial: false,
        description: 'Ultimate solution for large enterprises',
        features: {
          studentManagement: true,
          attendanceTracking: true,
          notificationSystem: true,
          feeManagement: true,
          basicReports: true,
          advancedAnalytics: true,
          customReports: true,
          bulkUpload: true,
          apiAccess: true,
          prioritySupport: true,
          aiInsights: true,
          advancedFeeTracking: true,
          customIntegrations: true,
          dedicatedAccountManager: true,
          sso: true,
          dataExport: true,
          whiteLabel: true
        },
        maxStudents: null,
        maxFaculty: null,
        storageGB: 1000,
        color: '#f59e0b',
        badge: '👑 PREMIUM',
        isActive: true
      }
    ];

    // Create or update each plan
    for (const plan of plans) {
      const exists = await Pricing.findOne({ planName: plan.planName });
      if (exists) {
        console.log(`⚠️  ${plan.planName} plan already exists. Updating...`);
        await Pricing.updateOne({ planName: plan.planName }, plan);
      } else {
        console.log(`📝 Creating ${plan.planName} plan...`);
        await Pricing.create(plan);
      }
    }

    console.log('\n✅ All pricing plans seeded successfully!');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

seedPlans();
