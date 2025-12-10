#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are present
 * before building or deploying the application. It should be run in CI/CD
 * pipelines and local builds to catch configuration errors early.
 * 
 * Usage:
 *   node scripts/validate-env.js
 * 
 * Exit codes:
 *   0 - All required variables are present
 *   1 - One or more required variables are missing
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const optionalEnvVars = [
  'NODE_ENV',
  'VITE_APP_ENV'
];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvironment() {
  log('\n🔍 Validating environment configuration...\n', 'cyan');

  const missing = [];
  const present = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      missing.push(varName);
      log(`❌ ${varName}: MISSING`, 'red');
    } else {
      present.push(varName);
      
      // Perform additional validation
      if (varName === 'VITE_SUPABASE_URL') {
        if (!value.startsWith('https://')) {
          warnings.push(`${varName} should use HTTPS protocol`);
          log(`⚠️  ${varName}: Present but not using HTTPS`, 'yellow');
        } else if (!value.includes('.supabase.co')) {
          warnings.push(`${varName} doesn't appear to be a valid Supabase URL`);
          log(`⚠️  ${varName}: Present but may not be a valid Supabase URL`, 'yellow');
        } else {
          log(`✅ ${varName}: Present`, 'green');
        }
      } else if (varName === 'VITE_SUPABASE_ANON_KEY') {
        // Basic JWT format validation (should start with 'eyJ')
        if (!value.startsWith('eyJ')) {
          warnings.push(`${varName} doesn't appear to be a valid JWT token`);
          log(`⚠️  ${varName}: Present but doesn't look like a valid JWT`, 'yellow');
        } else {
          log(`✅ ${varName}: Present`, 'green');
        }
      } else {
        log(`✅ ${varName}: Present`, 'green');
      }
    }
  }

  // Check optional variables
  log('\n📋 Optional environment variables:', 'cyan');
  for (const varName of optionalEnvVars) {
    const value = process.env[varName];
    if (value) {
      log(`  ${varName}: ${value}`, 'blue');
    } else {
      log(`  ${varName}: Not set (using defaults)`, 'blue');
    }
  }

  // Security check: Warn if using production URL in non-production
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (supabaseUrl && nodeEnv !== 'production') {
    // This is a simplified check - production URL detection
    // Real implementation is in src/config/env.ts
    log('\n🔒 Security check:', 'cyan');
    log(`  Environment: ${nodeEnv}`, 'blue');
    log('  Note: Ensure you are not using production Supabase URL in development', 'yellow');
  }

  // Print summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Summary:', 'cyan');
  log(`  Required variables: ${present.length}/${requiredEnvVars.length} present`, 
    present.length === requiredEnvVars.length ? 'green' : 'red');
  
  if (warnings.length > 0) {
    log(`  Warnings: ${warnings.length}`, 'yellow');
    warnings.forEach(w => log(`    - ${w}`, 'yellow'));
  }

  // Exit with appropriate code
  if (missing.length > 0) {
    log('\n❌ Validation FAILED', 'red');
    log('\nMissing required environment variables:', 'red');
    missing.forEach(v => log(`  - ${v}`, 'red'));
    log('\nPlease set these variables in your .env file or deployment platform.', 'red');
    log('See README.md for setup instructions.\n', 'red');
    process.exit(1);
  }

  if (warnings.length > 0) {
    log('\n⚠️  Validation PASSED with warnings', 'yellow');
    log('Please review the warnings above.\n', 'yellow');
    process.exit(0);
  }

  log('\n✅ Validation PASSED', 'green');
  log('All required environment variables are present and valid.\n', 'green');
  process.exit(0);
}

// Run validation
try {
  validateEnvironment();
} catch (error) {
  log('\n💥 Validation script error:', 'red');
  log(error.message, 'red');
  log('\nStack trace:', 'red');
  console.error(error.stack);
  process.exit(1);
}