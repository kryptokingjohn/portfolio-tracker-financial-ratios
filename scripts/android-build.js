#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('📱 Starting Android build process...\n');

// Check if Android development environment is set up
function checkAndroidEnvironment() {
  try {
    execSync('java -version', { stdio: 'pipe' });
    console.log('✅ Java found');
  } catch (error) {
    console.error('❌ Java not found. Please install Java 11 or higher.');
    return false;
  }

  try {
    execSync('npx cap doctor android', { stdio: 'pipe' });
    console.log('✅ Android environment configured');
  } catch (error) {
    console.warn('⚠️  Android environment may need configuration');
  }

  return true;
}

try {
  // Check environment
  if (!checkAndroidEnvironment()) {
    console.log('\n📋 Android Setup Requirements:');
    console.log('1. Install Java 11 or higher');
    console.log('2. Install Android Studio');
    console.log('3. Set ANDROID_HOME environment variable');
    console.log('4. Add Android SDK tools to PATH');
    process.exit(1);
  }

  // Build web app
  console.log('🏗️  Building web application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  // Copy assets
  console.log('📋 Copying assets...');
  execSync('npx cap copy android', { stdio: 'inherit' });

  console.log('\n✅ Android build preparation completed!');
  console.log('\n📱 Next steps for Play Store:');
  console.log('1. Run: npx cap open android');
  console.log('2. In Android Studio:');
  console.log('   • Generate signed bundle (Build > Generate Signed Bundle)');
  console.log('   • Create keystore for release signing');
  console.log('   • Build release AAB file');
  console.log('3. Upload AAB to Google Play Console');
  console.log('\n🔑 Don\'t forget to:');
  console.log('   • Update version code in android/app/build.gradle');
  console.log('   • Add app screenshots and descriptions');
  console.log('   • Complete Play Store listing');

} catch (error) {
  console.error('❌ Android build failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('• Ensure Android Studio is installed');
  console.log('• Check ANDROID_HOME environment variable');
  console.log('• Run: npx cap doctor');
  process.exit(1);
}