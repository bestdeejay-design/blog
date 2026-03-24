#!/usr/bin/env node

/**
 * First User Setup Script
 * Creates the first super admin user via Supabase Auth API
 * 
 * Usage:
 * 1. npm install -g @supabase/supabase-js
 * 2. node create-first-user.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Please copy .env.local.example to .env.local and fill in your values');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Blog System - First User Setup\n');
console.log('This script will create the first super admin user.\n');

rl.question('Username (e.g., admin): ', async (username) => {
  rl.question('Email (optional, can be fake for local dev): ', async (email) => {
    rl.question('Password (min 6 characters): ', async (password) => {
      rl.question('Full Name (optional): ', async (fullName) => {
        try {
          // Generate random email if not provided
          const finalEmail = email || `${username}@localhost`;
          
          // Sign up user via Supabase Auth
          console.log('\n⏳ Creating user...');
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: finalEmail,
            password: password,
            options: {
              data: {
                username: username,
                full_name: fullName || username
              }
            }
          });

          if (authError) {
            throw new Error(`Auth error: ${authError.message}`);
          }

          const userId = authData.user.id;

          // Create user profile with super_admin role
          console.log('⏳ Creating user profile...');
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              username: username,
              full_name: fullName || username,
              role: 'super_admin'
            });

          if (profileError) {
            throw new Error(`Profile error: ${profileError.message}`);
          }

          console.log('\n✅ SUCCESS! First user created:\n');
          console.log(`   Username: ${username}`);
          console.log(`   Password: ${'*'.repeat(password.length)}`);
          console.log(`   Role: Super Admin`);
          console.log(`   User ID: ${userId}\n`);
          console.log('📝 Next steps:');
          console.log('   1. Run: npm run dev');
          console.log(`   2. Visit: http://localhost:3000/login`);
          console.log(`   3. Login with your credentials\n`);
          console.log('⚠️  IMPORTANT: Save these credentials securely!\n');

        } catch (error) {
          console.error('\n❌ Error creating user:', error.message);
          console.error('\nTroubleshooting:');
          console.error('   1. Check your Supabase credentials in .env.local');
          console.error('   2. Make sure you ran supabase/schema.sql');
          console.error('   3. Verify your Supabase project is active\n');
        } finally {
          rl.close();
        }
      });
    });
  });
});
