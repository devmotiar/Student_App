#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('\n🔍 Firebase Configuration Verification\n');
console.log('=====================================\n');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let allValid = true;
const issues = [];

// Check .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('❌ .env.local NOT FOUND\n');
  console.log('Create .env.local with your Firebase credentials:');
  console.log('  1. Copy .env.example to .env.local');
  console.log('  2. Fill in values from Firebase Console\n');
  allValid = false;
} else {
  console.log('✅ .env.local file exists\n');
}

// Check each required variable
console.log('Checking Firebase variables:\n');
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  
  if (!value) {
    console.log(`❌ ${varName}`);
    console.log(`   Status: NOT SET\n`);
    issues.push(`Missing: ${varName}`);
    allValid = false;
    return;
  }

  if (value.includes('...') || value.includes('YOUR_') || value === 'demo' || value.includes('Demo')) {
    console.log(`❌ ${varName}`);
    console.log(`   Status: PLACEHOLDER (needs real value)\n`);
    issues.push(`Placeholder: ${varName}`);
    allValid = false;
    return;
  }

  // Special checks for API key
  if (varName === 'NEXT_PUBLIC_FIREBASE_API_KEY') {
    if (!value.startsWith('AIza')) {
      console.log(`❌ ${varName}`);
      console.log(`   Status: INVALID FORMAT (should start with 'AIza')\n`);
      issues.push('Invalid API key format');
      allValid = false;
      return;
    }
    if (value.length < 30) {
      console.log(`❌ ${varName}`);
      console.log(`   Status: TOO SHORT (API key seems incomplete)\n`);
      issues.push('API key too short');
      allValid = false;
      return;
    }
  }

  console.log(`✅ ${varName}`);
  console.log(`   Status: VALID (${value.substring(0, 20)}...)\n`);
});

// Summary
console.log('=====================================\n');

if (allValid) {
  console.log('✅ All Firebase credentials are valid!\n');
  console.log('Next steps:');
  console.log('  1. Run: pnpm dev');
  console.log('  2. Open: http://localhost:3000');
  console.log('  3. Sign up or log in\n');
} else {
  console.log('❌ Firebase configuration issues found:\n');
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
  console.log('\nTo fix:');
  console.log('  1. Open Firebase Console: https://console.firebase.google.com');
  console.log('  2. Go to Project Settings → General');
  console.log('  3. Copy complete Firebase config');
  console.log('  4. Update .env.local with full credentials');
  console.log('  5. Run: pnpm dev\n');
}

process.exit(allValid ? 0 : 1);
