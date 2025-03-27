const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env.local file found.');
  dotenv.config(); // Fall back to .env if exists
}

/**
 * Connect to the database
 */
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }
  
  console.log(`Connecting to MongoDB at: ${MONGODB_URI.split('@')[1]}`); // Log connection but hide credentials
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    return mongoose;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

/**
 * Define models
 */
function getModels() {
  // Check if models already exist
  const Affiliate = mongoose.models.Affiliate || mongoose.model('Affiliate', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    promoCode: { type: String, required: true, unique: true },
    commissionRate: { type: Number, required: true, default: 10 },
    paymentMethod: { type: String, enum: ["TEST_RAILS"], required: true, default: "TEST_RAILS" },
    paymentDetails: {
      name: { type: String, required: true },
      payeeId: { type: String },
      contactDetails: {
        email: { type: String },
        phoneNumber: { type: String },
        address: {
          addressLine1: { type: String },
          addressLine2: { type: String },
          addressLine3: { type: String },
          addressLine4: { type: String },
          locality: { type: String },
          region: { type: String },
          postcode: { type: String },
          country: { type: String },
        },
        taxId: { type: String }
      },
      tags: [{ type: String }]
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    totalEarned: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
  }, { timestamps: true }));

  const Conversion = mongoose.models.Conversion || mongoose.model('Conversion', new mongoose.Schema({
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    orderAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    promoCode: { type: String, required: true },
    customer: {
      email: { type: String, required: true },
      name: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    payoutId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Payout" 
    },
  }, { timestamps: true }));

  const Payout = mongoose.models.Payout || mongoose.model('Payout', new mongoose.Schema({
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    amount: { type: Number, required: true },
    conversions: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Conversion" 
    }],
    paymentMethod: { type: String, enum: ["TEST_RAILS"], required: true, default: "TEST_RAILS" },
    paymentDetails: {
      reference: { type: String },
      externalReference: { type: String },
      memo: { type: String },
      walletId: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed }
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processedAt: { type: Date },
  }, { timestamps: true }));

  const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
    payoutSettings: {
      minimumPayoutAmount: { type: Number, default: 50 },
      payoutFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "monthly",
      },
      payoutDay: { type: Number },
      automaticPayouts: { type: Boolean, default: true },
    },
    apiKeys: {
      paymanApiKey: { type: String },
      otherApiKeys: { type: Map, of: String },
    },
    commissionDefaults: {
      defaultRate: { type: Number, default: 10 },
      minimumOrderAmount: { type: Number, default: 0 },
    },
  }, { timestamps: true }));

  return { Affiliate, Conversion, Payout, Settings };
}

/**
 * Seed data for the database
 */
async function seedDatabase(clearExisting = true) {
  console.log("Connecting to database...");
  await connectToDatabase();
  const { Affiliate, Conversion, Payout, Settings } = getModels();
  
  if (clearExisting) {
    console.log("Clearing existing data...");
    await Promise.all([
      Affiliate.deleteMany({}),
      Conversion.deleteMany({}),
      Payout.deleteMany({}),
      Settings.deleteMany({})
    ]);
  }

  console.log("Seeding database...");

  // Create settings
  const settings = await Settings.create({
    payoutSettings: {
      minimumPayoutAmount: 50,
      payoutFrequency: "monthly",
      payoutDay: 1,
      automaticPayouts: true,
    },
    apiKeys: {
      paymanApiKey: "your-payman-api-key",
    },
    commissionDefaults: {
      defaultRate: 10,
      minimumOrderAmount: 0,
    },
  });

  console.log("Settings created");

  // Create affiliates
  const affiliates = await Affiliate.create([
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      promoCode: "JOHN10",
      commissionRate: 10,
      paymentMethod: "TEST_RAILS",
      paymentDetails: {
        name:"TESTING-AGAIN",
        payeeId: "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569",
        contactDetails: {
          email: "john@example.com",
          phoneNumber: "+1 (555) 123-4567",
          address: {
            addressLine1: "123 Main St",
            locality: "New York",
            region: "NY",
            postcode: "10001",
            country: "USA",
          },
        },
        tags: ["vip", "early-adopter"]
      },
      status: "active",
      totalEarned: 10,
      totalPaid: 0,
      pendingAmount: 10,
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 987-6543",
      promoCode: "JANE15",
      commissionRate: 15,
      paymentMethod: "TEST_RAILS",
      paymentDetails: {
        name:"TESTING-AGAIN",
        payeeId: "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569", // Updated to use the working payee ID
        contactDetails: {
          email: "jane.payments@example.com",
          phoneNumber: "+1 (555) 987-6543",
          address: {
            addressLine1: "456 Park Ave",
            locality: "Boston",
            region: "MA",
            postcode: "02108",
            country: "USA",
          },
        },
        tags: ["influencer"]
      },
      status: "active",
      totalEarned: 15,
      totalPaid: 0,
      pendingAmount: 15,
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1 (555) 456-7890",
      promoCode: "BOB20",
      commissionRate: 20,
      paymentMethod: "TEST_RAILS",
      paymentDetails: {
        name:"TESTING-AGAIN",
        payeeId: "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569", // Updated to use the working payee ID
        contactDetails: {
          email: "bob@example.com",
          phoneNumber: "+1 (555) 456-7890",
          address: {
            addressLine1: "789 Oak Rd",
            locality: "Chicago",
            region: "IL",
            postcode: "60601",
            country: "USA",
          },
        },
      },
      status: "active",
      totalEarned: 20,
      totalPaid: 0,
      pendingAmount: 20,
    },
  ]);

  console.log(`Created ${affiliates.length} affiliates`);

  // Create array to hold all conversions
  const allConversions = [];

  // Create EXACTLY ONE approved conversion for each affiliate with a simple amount
  for (const affiliate of affiliates) {
    // Set order amount to match the affiliate's commission rate for easy calculation
    const orderAmount = affiliate.commissionRate * 10; // $100, $150, $200
    // Commission amount will be exactly the pendingAmount value we set above
    const commissionAmount = affiliate.pendingAmount;
    
    const conversion = await Conversion.create({
      affiliateId: affiliate._id,
      orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      orderAmount,
      commissionAmount,
      promoCode: affiliate.promoCode,
      customer: {
        email: `customer@example.com`,
        name: `Test Customer`,
      },
      status: "approved", // Explicitly set to approved
      createdAt: new Date(),
    });
    
    allConversions.push(conversion);
    
    // Log created conversion for debugging
    console.log(`Created approved conversion for ${affiliate.name}: ${conversion._id}`);
  }
  
  // Add one pending conversion for the first affiliate
  const firstAffiliate = affiliates[0];
  const pendingConversion = await Conversion.create({
    affiliateId: firstAffiliate._id,
    orderId: `ORD-PENDING-${Math.floor(10000 + Math.random() * 90000)}`,
    orderAmount: 100, // $100
    commissionAmount: 10, // 10% commission
    promoCode: firstAffiliate.promoCode,
    customer: {
      email: `pending-customer@example.com`,
      name: `Pending Customer`,
    },
    status: "pending",
    createdAt: new Date(),
  });
  
  allConversions.push(pendingConversion);

  console.log(`Created ${allConversions.length} conversions (${allConversions.length - 1} approved, 1 pending)`);

  // No payouts created initially - user will create these through the UI
  console.log("Database seeding completed!");

  return {
    affiliates,
    conversions: allConversions,
    payouts: [],
    settings,
  };
}

// Function to run the seeder directly
async function runSeeder() {
  try {
    await seedDatabase();
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  runSeeder();
}

module.exports = { seedDatabase };
