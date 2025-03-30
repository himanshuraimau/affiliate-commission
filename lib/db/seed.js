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
  
  console.log(`MongoDB URI: ${MONGODB_URI}`);
  
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
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  }, { timestamps: true }));

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

  return { User, Affiliate, Conversion, Payout, Settings };
}

/**
 * Seed data for the database
 */
async function seedDatabase(clearExisting = true) {
  console.log("Connecting to database...");
  await connectToDatabase();
  const { User, Affiliate, Conversion, Payout, Settings } = getModels();
  
  if (clearExisting) {
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Affiliate.deleteMany({}),
      Conversion.deleteMany({}),
      Payout.deleteMany({}),
      Settings.deleteMany({})
    ]);
  }

  console.log("Seeding database...");

  // Create users with plain password
  const users = await User.create([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "password123", // Plain text password
    },
    {
      name: "Support Manager",
      email: "support@example.com",
      password: "password123",
    },
    {
      name: "Finance Manager",
      email: "finance@example.com",
      password: "password123",
    },
    {
      name: "Marketing Lead",
      email: "marketing@example.com",
      password: "password123",
    }
  ]);

  console.log(`Created ${users.length} users`);

  // Create settings
  const settings = await Settings.create({
    payoutSettings: {
      minimumPayoutAmount: 50,
      payoutFrequency: "monthly",
      payoutDay: 1,
      automaticPayouts: true,
    },
    apiKeys: {
      paymanApiKey: process.env.PAYMANT_API_KEY || "DEFAULT_KEY_REPLACE_ME",
    },
    commissionDefaults: {
      defaultRate: 10,
      minimumOrderAmount: 0,
    },
  });

  if (!process.env.PAYMAN_API_KEY) {
    console.warn("Warning: PAYMAN_API_KEY environment variable not set. Using placeholder value.");
    console.warn("Be sure to update this in your .env.local file with your actual API key.");
  }

  console.log("Settings created");

  // Common payment details to use for all affiliates
  const commonPaymentDetails = {
    name: "TESTING-AGAIN",
    payeeId: "pd-1f00acb2-fba4-6983-b0fd-d7b9ea207569",
    contactDetails: {
      email: "affiliate@example.com",
      phoneNumber: "+1 (555) 123-4567",
      address: {
        addressLine1: "123 Main St",
        locality: "New York",
        region: "NY",
        postcode: "10001",
        country: "USA",
      },
    },
    tags: ["affiliate", "program-member"]
  };

  // Create more affiliates
  const affiliatesData = [
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      promoCode: "JOHN10",
      commissionRate: 10,
      status: "active",
      totalEarned: 1025.50,
      totalPaid: 950.00,
      pendingAmount: 75.50,
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 987-6543",
      promoCode: "JANE15",
      commissionRate: 15,
      status: "active",
      totalEarned: 2150.75,
      totalPaid: 2000.00,
      pendingAmount: 150.75,
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1 (555) 456-7890",
      promoCode: "BOB20",
      commissionRate: 20,
      status: "active",
      totalEarned: 3250.25,
      totalPaid: 3000.00,
      pendingAmount: 250.25,
    },
    {
      name: "Alice Williams",
      email: "alice@example.com",
      phone: "+1 (555) 222-3333",
      promoCode: "ALICE12",
      commissionRate: 12,
      status: "active",
      totalEarned: 1890.40,
      totalPaid: 1700.00,
      pendingAmount: 190.40,
    },
    {
      name: "David Brown",
      email: "david@example.com",
      phone: "+1 (555) 444-5555",
      promoCode: "DAVID18",
      commissionRate: 18,
      status: "active",
      totalEarned: 2750.80,
      totalPaid: 2500.00,
      pendingAmount: 250.80,
    },
    {
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+1 (555) 666-7777",
      promoCode: "EMILY15",
      commissionRate: 15,
      status: "inactive",
      totalEarned: 1550.20,
      totalPaid: 1550.20,
      pendingAmount: 0,
    },
    {
      name: "Michael Wilson",
      email: "michael@example.com",
      phone: "+1 (555) 888-9999",
      promoCode: "MIKE10",
      commissionRate: 10,
      status: "active",
      totalEarned: 975.60,
      totalPaid: 900.00,
      pendingAmount: 75.60,
    },
    {
      name: "Sarah Taylor",
      email: "sarah@example.com",
      phone: "+1 (555) 111-2222",
      promoCode: "SARAH20",
      commissionRate: 20,
      status: "active",
      totalEarned: 3450.75,
      totalPaid: 3200.00,
      pendingAmount: 250.75,
    },
    {
      name: "James Anderson",
      email: "james@example.com",
      phone: "+1 (555) 333-4444",
      promoCode: "JAMES10",
      commissionRate: 10,
      status: "pending",
      totalEarned: 0,
      totalPaid: 0,
      pendingAmount: 0,
    },
    {
      name: "Jennifer Martinez",
      email: "jennifer@example.com",
      phone: "+1 (555) 555-6666",
      promoCode: "JENN15",
      commissionRate: 15,
      status: "active",
      totalEarned: 2250.30,
      totalPaid: 2000.00,
      pendingAmount: 250.30,
    },
    {
      name: "Robert Garcia",
      email: "robert@example.com",
      phone: "+1 (555) 777-8888",
      promoCode: "ROB18",
      commissionRate: 18,
      status: "active",
      totalEarned: 2850.45,
      totalPaid: 2600.00,
      pendingAmount: 250.45,
    },
    {
      name: "Lisa Rodriguez",
      email: "lisa@example.com",
      phone: "+1 (555) 999-0000",
      promoCode: "LISA12",
      commissionRate: 12,
      status: "active",
      totalEarned: 1650.25,
      totalPaid: 1500.00,
      pendingAmount: 150.25,
    }
  ];

  // Create affiliates with common payment details
  const affiliates = await Affiliate.create(
    affiliatesData.map(affiliate => ({
      ...affiliate,
      paymentMethod: "TEST_RAILS",
      paymentDetails: {
        ...commonPaymentDetails,
        contactDetails: {
          ...commonPaymentDetails.contactDetails,
          email: affiliate.email, // Use affiliate's email for contact email
        }
      }
    }))
  );

  console.log(`Created ${affiliates.length} affiliates`);

  // Create array to hold all conversions
  const allConversions = [];

  // Generate dates spanning the last 6 months
  const getRandomDate = () => {
    const now = new Date();
    const monthsAgo = Math.floor(Math.random() * 6); // 0-6 months ago
    const daysAgo = Math.floor(Math.random() * 30); // 0-30 days within that month
    now.setMonth(now.getMonth() - monthsAgo);
    now.setDate(now.getDate() - daysAgo);
    return now;
  };

  // Generate conversions for each affiliate
  for (const affiliate of affiliates) {
    // Generate 5-20 conversions per affiliate
    const numConversions = 5 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < numConversions; i++) {
      // Generate random order amount between $50 and $500
      const orderAmount = 50 + Math.random() * 450;
      const commissionAmount = (orderAmount * affiliate.commissionRate / 100).toFixed(2);
      
      // Determine status with weighted probabilities
      let status;
      const statusRoll = Math.random();
      if (statusRoll < 0.6) status = "approved";
      else if (statusRoll < 0.8) status = "pending";
      else if (statusRoll < 0.9) status = "rejected";
      else status = "paid";
      
      const conversion = await Conversion.create({
        affiliateId: affiliate._id,
        orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}-${i}`,
        orderAmount,
        commissionAmount,
        promoCode: affiliate.promoCode,
        customer: {
          email: `customer${Math.floor(Math.random() * 10000)}@example.com`,
          name: `Customer ${Math.floor(Math.random() * 10000)}`,
        },
        status: status,
        createdAt: getRandomDate(),
      });
      
      allConversions.push(conversion);
    }
  }

  console.log(`Created ${allConversions.length} conversions`);

  // Create some payouts
  const payouts = [];
  const paidStatuses = ["pending", "processing", "completed", "failed"];
  
  // Create 1-3 payouts for each active affiliate
  for (const affiliate of affiliates.filter(a => a.status === "active")) {
    const numPayouts = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numPayouts; i++) {
      // Get some approved conversions for this affiliate
      const affiliateConversions = allConversions.filter(
        c => c.affiliateId.toString() === affiliate._id.toString() && 
        c.status === "approved" &&
        !c.payoutId
      ).slice(0, 5); // Take up to 5 conversions
      
      if (affiliateConversions.length > 0) {
        const totalAmount = affiliateConversions.reduce(
          (sum, conv) => sum + parseFloat(conv.commissionAmount), 0
        );
        
        const status = paidStatuses[Math.floor(Math.random() * paidStatuses.length)];
        const processedAt = status === "completed" ? new Date() : null;
        
        const payout = await Payout.create({
          affiliateId: affiliate._id,
          amount: totalAmount,
          conversions: affiliateConversions.map(c => c._id),
          paymentMethod: "TEST_RAILS",
          paymentDetails: {
            reference: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
            externalReference: `EXT-${Math.floor(100000 + Math.random() * 900000)}`,
            memo: `Payout for ${affiliate.name}`,
            walletId: `wallet-${Math.floor(100000 + Math.random() * 900000)}`,
            metadata: { batch: `Q${1 + Math.floor(Math.random() * 4)}-2023` }
          },
          status: status,
          processedAt: processedAt,
          createdAt: getRandomDate(),
        });
        
        payouts.push(payout);
        
        // Update conversions to link to this payout and change status if completed
        if (status === "completed") {
          await Promise.all(affiliateConversions.map(conv => 
            Conversion.findByIdAndUpdate(conv._id, { 
              payoutId: payout._id,
              status: "paid"
            })
          ));
        } else {
          await Promise.all(affiliateConversions.map(conv => 
            Conversion.findByIdAndUpdate(conv._id, { 
              payoutId: payout._id
            })
          ));
        }
      }
    }
  }

  console.log(`Created ${payouts.length} payouts`);
  console.log("Database seeding completed!");

  return {
    users,
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
