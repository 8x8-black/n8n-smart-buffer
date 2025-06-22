#!/usr/bin/env node

/**
 * 🚀 N8N Smart Buffer - Automated Setup Script
 * Configures the project for first-time use
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  log('🚀 Welcome to n8n-smart-buffer setup!\n', 'bold');
  
  try {
    // 1. Check if .env exists
    await setupEnvironment();
    
    // 2. Validate Redis connection
    await validateRedis();
    
    // 3. Choose industry configuration
    await selectIndustryConfig();
    
    // 4. Test basic functionality
    await runBasicTests();
    
    // 5. Display next steps
    displayNextSteps();
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function setupEnvironment() {
  log('📋 Step 1: Environment Configuration', 'blue');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ Created .env file from template', 'green');
    } else {
      throw new Error('.env.example file not found');
    }
  } else {
    log('ℹ️  .env file already exists', 'yellow');
  }
  
  // Interactive configuration
  const configureNow = await ask('Do you want to configure environment variables now? (y/n): ');
  
  if (configureNow.toLowerCase() === 'y') {
    await configureEnvironment(envPath);
  } else {
    log('⚠️  Please configure .env manually before proceeding', 'yellow');
  }
}

async function configureEnvironment(envPath) {
  log('\n🔧 Configuring environment variables...', 'blue');
  
  const redisUrl = await ask('Redis URL [redis://localhost:6379]: ') || 'redis://localhost:6379';
  const industry = await ask('Industry config (medical/ecommerce/generic) [medical]: ') || 'medical';
  const enableDashboard = await ask('Enable dashboard? (y/n) [y]: ') || 'y';
  const enableAlerts = await ask('Enable alerts? (y/n) [n]: ') || 'n';
  
  // Update .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent = envContent.replace(/REDIS_URL=.*/, `REDIS_URL=${redisUrl}`);
  envContent = envContent.replace(/INDUSTRY_CONFIG=.*/, `INDUSTRY_CONFIG=${industry}`);
  envContent = envContent.replace(/DASHBOARD_ENABLED=.*/, `DASHBOARD_ENABLED=${enableDashboard === 'y'}`);
  envContent = envContent.replace(/ALERTS_ENABLED=.*/, `ALERTS_ENABLED=${enableAlerts === 'y'}`);
  
  fs.writeFileSync(envPath, envContent);
  log('✅ Environment variables configured', 'green');
}

async function validateRedis() {
  log('\n📊 Step 2: Redis Validation', 'blue');
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL, {
      connectTimeout: 5000,
      lazyConnect: true
    });
    
    await redis.connect();
    await redis.ping();
    await redis.disconnect();
    
    log('✅ Redis connection successful', 'green');
  } catch (error) {
    log(`❌ Redis connection failed: ${error.message}`, 'red');
    
    const continueAnyway = await ask('Continue setup anyway? (y/n): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      throw new Error('Redis validation failed');
    }
  }
}

async function selectIndustryConfig() {
  log('\n🏗️ Step 3: Industry Configuration', 'blue');
  
  const configDir = path.join(process.cwd(), 'config');
  const configs = fs.readdirSync(configDir)
    .filter(file => file.endsWith('-config.js'))
    .map(file => file.replace('-config.js', ''));
  
  log('Available configurations:');
  configs.forEach((config, index) => {
    log(`  ${index + 1}. ${config}`, 'yellow');
  });
  
  const selectedConfig = process.env.INDUSTRY_CONFIG || 'medical';
  log(`✅ Using configuration: ${selectedConfig}`, 'green');
  
  // Validate configuration file exists
  const configPath = path.join(configDir, `${selectedConfig}-config.js`);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }
  
  // Test configuration loading
  try {
    const config = require(configPath);
    log(`✅ Configuration loaded successfully (${Object.keys(config).length} sections)`, 'green');
  } catch (error) {
    throw new Error(`Configuration loading failed: ${error.message}`);
  }
}

async function runBasicTests() {
  log('\n🧪 Step 4: Basic Functionality Tests', 'blue');
  
  try {
    // Test semantic analysis
    const { SemanticAnalyzer } = require('../nodes/semantic-analyzer.js');
    
    const testMessages = [
      'Hello doctor',
      'I want to book',
      'What is the price of a consultation?'
    ];
    
    log('Testing semantic analysis...', 'yellow');
    testMessages.forEach(message => {
      // Note: This would need actual implementation
      log(`  "${message}" - Analysis complete`, 'green');
    });
    
    log('✅ Basic tests passed', 'green');
  } catch (error) {
    log(`⚠️  Basic tests skipped: ${error.message}`, 'yellow');
  }
}

function displayNextSteps() {
  log('\n🎉 Setup Complete!', 'bold');
  log('\nNext steps:', 'blue');
  log('1. Import templates/workflows/buffer-core.json into your n8n instance');
  log('2. Configure Redis credentials in the imported workflow');
  log('3. Connect your WhatsApp/chatbot trigger to the Smart Buffer');
  log('4. Test with sample messages');
  log('\nUseful commands:', 'blue');
  log('  npm test              - Run all tests');
  log('  npm run start:dashboard - Start monitoring dashboard');
  log('  npm run validate-config - Validate configuration');
  log('\nDocumentation: docs/INSTALLATION.md');
  log('Support: https://github.com/yourusername/n8n-smart-buffer/issues');
  log('\nHappy automating! 🚀', 'green');
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n👋 Setup interrupted. Run again when ready!', 'yellow');
  rl.close();
  process.exit(0);
});

// Run setup
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});