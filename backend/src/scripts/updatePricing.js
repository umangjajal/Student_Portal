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

async function updatePricing() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Update pricing for each plan
    const updates = [
      { planName: 'BASIC', pricePerStudent: 50 },
      { planName: 'ADVANCED', pricePerStudent: 80 },
      { planName: 'PREMIUM', pricePerStudent: 120 }
    ];

    for (const update of updates) {
      const result = await Pricing.findOneAndUpdate(
        { planName: update.planName },
        { pricePerStudent: update.pricePerStudent },
        { new: true }
      );
      
      if (result) {
        console.log(`✅ ${update.planName}: Updated to ₹${update.pricePerStudent}/user`);
      } else {
        console.log(`⚠️  ${update.planName}: Plan not found`);
      }
    }

    console.log('\n✅ All pricing updated successfully!');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating pricing:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

updatePricing();
