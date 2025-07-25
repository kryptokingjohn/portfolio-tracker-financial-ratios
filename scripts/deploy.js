#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting deployment process...\n');

// Check if .env file exists
if (!existsSync('.env')) {
  console.error('❌ Error: .env file not found!');
  console.log('Please create a .env file with your production environment variables:');
  console.log('VITE_SUPABASE_URL=your_production_supabase_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key');
  process.exit(1);
}

// Read environment variables
const envContent = readFileSync('.env', 'utf8');
const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');

if (!hasSupabaseUrl || !hasSupabaseKey) {
  console.error('❌ Error: Missing required environment variables!');
  console.log('Please ensure your .env file contains:');
  console.log('VITE_SUPABASE_URL=your_production_supabase_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key');
  process.exit(1);
}

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Run linting
  console.log('🔍 Running linter...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Linting warnings found, but continuing...');
  }

  // Build the project
  console.log('🏗️  Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify build output
  if (!existsSync('dist/index.html')) {
    throw new Error('Build failed - index.html not found in dist folder');
  }

  console.log('✅ Build completed successfully!');
  console.log('\n📁 Build output in ./dist folder');
  console.log('\n🌐 Ready for deployment!');
  console.log('\n📋 Netlify Deployment Options:');
  console.log('   Option 1 - Drag & Drop:');
  console.log('     • Go to https://app.netlify.com/drop');
  console.log('     • Drag the CONTENTS of the dist folder (not the folder itself)');
  console.log('     • Select all files INSIDE dist/ and drag them');
  console.log('   Option 2 - Netlify CLI:');
  console.log('     • Run: npm install -g netlify-cli');
  console.log('     • Run: netlify deploy --prod --dir=dist');
  console.log('\n🔧 Other Options:');
  console.log('   • Vercel: Run "vercel --prod" in project root');
  console.log('   • Other hosts: Upload dist folder contents');

} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}