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
    paymentMethod: { type: String, enum: ["ACH", "USDC"], required: true },
    paymentDetails: {
      achAccount: {
        accountNumber: { type: String },
        routingNumber: { type: String },
        accountName: { type: String },
      },
      usdcWallet: { type: String },
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
    paymentMethod: { type: String, enum: ["ACH", "USDC"], required: true },
    paymentDetails: {
      transactionId: { type: String },
      txHash: { type: String },
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
      paymanApiKey: "test_api_key_12345",
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
      paymentMethod: "ACH",
      paymentDetails: {
        achAccount: {
          accountNumber: "123456789",
          routingNumber: "987654321",
          accountName: "John Doe",
        },
      },
      status: "active",
      totalEarned: 1250.6,
      totalPaid: 1125.2,
      pendingAmount: 125.4,
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 987-6543",
      promoCode: "JANE15",
      commissionRate: 15,
      paymentMethod: "USDC",
      paymentDetails: {
        usdcWallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      },
      status: "active",
      totalEarned: 980.25,
      totalPaid: 882.25,
      pendingAmount: 98.0,
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1 (555) 456-7890",
      promoCode: "BOB20",
      commissionRate: 20,
      paymentMethod: "ACH",
      paymentDetails: {
        achAccount: {
          accountNumber: "567891234",
          routingNumber: "123789456",
          accountName: "Bob Johnson",
        },
      },
      status: "active",
      totalEarned: 750.5,
      totalPaid: 675.5,
      pendingAmount: 75.0,
    },
    {
      name: "Alice Brown",
      email: "alice@example.com",
      phone: "+1 (555) 321-6547",
      promoCode: "ALICE5",
      commissionRate: 5,
      paymentMethod: "USDC",
      paymentDetails: {
        usdcWallet: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      },
      status: "inactive",
      totalEarned: 520.75,
      totalPaid: 468.75,
      pendingAmount: 52.0,
    },
    {
      name: "Charlie Wilson",
      email: "charlie@example.com",
      phone: "+1 (555) 741-8523",
      promoCode: "CHARLIE",
      commissionRate: 10,
      paymentMethod: "ACH",
      paymentDetails: {
        achAccount: {
          accountNumber: "987123654",
          routingNumber: "654789123",
          accountName: "Charlie Wilson",
        },
      },
      status: "pending",
      totalEarned: 320.3,
      totalPaid: 288.3,
      pendingAmount: 32.0,
    },
  ]);

  console.log(`Created ${affiliates.length} affiliates`);

  // Create array to hold all conversions
  const allConversions = [];

  // Create conversions for each affiliate
  for (const affiliate of affiliates) {
    // Create between 5-15 conversions per affiliate
    const numConversions = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < numConversions; i++) {
      // Generate random date in the past 30 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
      
      // Random order amount between $50 and $500
      const orderAmount = parseFloat((Math.random() * 450 + 50).toFixed(2));
      const commissionAmount = parseFloat((orderAmount * (affiliate.commissionRate / 100)).toFixed(2));
      
      // Random status weighted towards 'approved'
      const statuses = ["pending", "approved", "approved", "approved", "rejected"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const conversion = await Conversion.create({
        affiliateId: affiliate._id,
        orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        orderAmount,
        commissionAmount,
        promoCode: affiliate.promoCode,
        customer: {
          email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
          name: `Customer ${Math.floor(Math.random() * 1000)}`,
        },
        status,
        createdAt,
      });
      
      allConversions.push(conversion);
    }
  }

  console.log(`Created ${allConversions.length} conversions`);

  // Create payouts
  // Group some approved conversions by affiliate for payouts
  const approvedConversions = allConversions.filter(c => c.status === "approved");
  const conversionsByAffiliate = {};
  
  approvedConversions.forEach(conversion => {
    const key = conversion.affiliateId.toString();
    if (!conversionsByAffiliate[key]) {
      conversionsByAffiliate[key] = [];
    }
    conversionsByAffiliate[key].push(conversion);
  });

  // Create payouts for each affiliate with approved conversions
  const payouts = [];
  for (const [affiliateId, conversions] of Object.entries(conversionsByAffiliate)) {
    // Only create payouts for affiliates with enough conversions
    if (conversions.length >= 3) {
      const affiliate = affiliates.find(a => a._id.toString() === affiliateId);
      if (affiliate) {
        // Take a subset of conversions for this payout
        const payoutConversions = conversions.slice(0, 3);
        const amount = payoutConversions.reduce((sum, c) => sum + c.commissionAmount, 0);
        
        // Create different payout statuses
        const statuses = ["pending", "processing", "completed", "failed"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Set processedAt date for completed or failed payouts
        const processedAt = ["completed", "failed"].includes(status) ? new Date() : undefined;
        
        // Create payout details based on payment method
        const paymentDetails = {};
        if (status === "completed") {
          if (affiliate.paymentMethod === "ACH") {
            paymentDetails.transactionId = `ach_${Math.random().toString(36).substring(2, 15)}`;
          } else {
            paymentDetails.txHash = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
          }
        }
        
        const payout = await Payout.create({
          affiliateId,
          amount,
          conversions: payoutConversions.map(c => c._id),
          paymentMethod: affiliate.paymentMethod,
          paymentDetails,
          status,
          processedAt,
          createdAt: new Date(),
        });
        
        payouts.push(payout);
        
        // Update conversions with payoutId if payout is completed
        if (status === "completed") {
          await Conversion.updateMany(
            { _id: { $in: payoutConversions.map(c => c._id) } },
            { status: "paid", payoutId: payout._id }
          );
        }
      }
    }
  }

  console.log(`Created ${payouts.length} payouts`);
  console.log("Database seeding completed!");

  return {
    affiliates,
    conversions: allConversions,
    payouts,
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
