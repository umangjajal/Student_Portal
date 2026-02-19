import mongoose from 'mongoose';
import Pricing from '../models/Pricing.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupFreeTrial() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if FREE_TRIAL already exists
    const existingFreeTrial = await Pricing.findOne({ planName: 'FREE_TRIAL' });
    if (existingFreeTrial) {
      console.log('⚠️  FREE_TRIAL plan already exists. Skipping creation.');
      process.exit(0);
    }

    // Create FREE_TRIAL plan
    const freeTrialPlan = await Pricing.create({
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
    });

    console.log('✅ FREE_TRIAL plan created successfully');
    console.log('Plan Details:', freeTrialPlan);

    console.log('\n✅ Free Trial Setup Complete!');
    console.log('Users can now claim the free trial from the pricing page.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up free trial:', error);
    process.exit(1);
  }
}

setupFreeTrial();
