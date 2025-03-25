#!/usr/bin/env node

/**
 * Script to seed the database with mock data
 * Run with: node scripts/seed.js
 */

// Import the seed function directly - environment loading is handled in seed.js
const { seedDatabase } = require('../lib/db/seed.js');

async function run() {
  try {
    console.log('Starting database seeding...');
    await seedDatabase();
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

run();
