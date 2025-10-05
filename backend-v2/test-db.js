#!/usr/bin/env node

/**
 * Test database connection and tables
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test if tables exist
    console.log('🔍 Testing if tables exist...');
    
    // Test reservations table
    const reservationCount = await prisma.reservations.count();
    console.log(`✅ Reservations table exists, count: ${reservationCount}`);
    
    // Test properties table
    const propertyCount = await prisma.properties.count();
    console.log(`✅ Properties table exists, count: ${propertyCount}`);
    
    // Test system_settings table
    const settingsCount = await prisma.system_settings.count();
    console.log(`✅ System_settings table exists, count: ${settingsCount}`);
    
    // Test audit_logs table
    const auditCount = await prisma.audit_logs.count();
    console.log(`✅ Audit_logs table exists, count: ${auditCount}`);
    
    // Test transactions table
    const transactionCount = await prisma.transactions.count();
    console.log(`✅ Transactions table exists, count: ${transactionCount}`);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection().catch(console.error);
}

module.exports = { testDatabaseConnection };
