#!/usr/bin/env node

/**
 * 🔍 N8N Smart Buffer - Configuration Validator
 * Validates configuration files and environment setup
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

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

class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = 0;
    this.passed = 0;
  }

  check(condition, successMsg, errorMsg, isWarning = false) {
    this.checks++;
    
    if (condition) {
      this.passed++;
      log(`✅ ${successMsg}`, 'green');
      return true;
    } else {
      if (isWarning) {
        this.warnings.push(errorMsg);
        log(`⚠️  ${errorMsg}`, 'yellow');
      } else {
        this.errors.push(errorMsg);
        log(`❌ ${errorMsg}`, 'red');
      }
      return false;
    }
  }

  async validateEnvironment() {
    log('\n🔍 Validating Environment Configuration...', 'blue');
    
    // Check .env file exists
    const envPath = path.join(process.cwd(), '.env');
    this.check(
      fs.existsSync(envPath),
      '.env file found',
      '.env file is missing (copy from .env.example)'
    );

    // Validate required environment variables
    const requiredVars = [
      'REDIS_URL',
      'INDUSTRY_CONFIG'
    ];

    requiredVars.forEach(varName => {
      this.check(
        process.env[varName],
        `${varName} is set`,
        `${varName} is missing in .env file`
      );
    });

    // Validate Redis URL format
    if (process.env.REDIS_URL) {
      const redisUrlPattern = /^redis:\/\/.*:\d+$/;
      this.check(
        redisUrlPattern.test(process.env.REDIS_URL),
        'Redis URL format is valid',
        'Redis URL format is invalid (should be redis://host:port)',
        true
      );
    }

    // Validate numeric environment variables
    const numericVars = [
      'BUFFER_TTL',
      'TIMING_URGENT',
      'TIMING_SIMPLE',
      'TIMING_COMPLEX'
    ];

    numericVars.forEach(varName => {
      if (process.env[varName]) {
        const value = parseInt(process.env[varName]);
        this.check(
          !isNaN(value) && value > 0,
          `${varName} is a valid number (${value})`,
          `${varName} is not a valid positive number`,
          true
        );
      }
    });
  }

  async validateRedisConnection() {
    log('\n📊 Validating Redis Connection...', 'blue');
    
    if (!process.env.REDIS_URL) {
      this.check(false, '', 'Cannot test Redis - REDIS_URL not configured');
      return;
    }

    try {
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL, {
        connectTimeout: 5000,
        lazyConnect: true
      });

      await redis.connect();
      
      // Test basic operations
      await redis.set('smart-buffer:test', 'validation');
      const testValue = await redis.get('smart-buffer:test');
      await redis.del('smart-buffer:test');
      
      this.check(
        testValue === 'validation',
        'Redis connection and operations work correctly',
        'Redis operations failed'
      );

      // Test TTL functionality
      await redis.setex('smart-buffer:ttl-test', 1, 'test');
      const hasTtl = await redis.ttl('smart-buffer:ttl-test');
      
      this.check(
        hasTtl > 0,
        'Redis TTL functionality works',
        'Redis TTL functionality failed'
      );

      await redis.disconnect();
      
    } catch (error) {
      this.check(
        false,
        '',
        `Redis connection failed: ${error.message}`
      );
    }
  }

  async validateConfiguration() {
    log('\n⚙️ Validating Configuration Files...', 'blue');
    
    const industryConfig = process.env.INDUSTRY_CONFIG || 'medical';
    const configPath = path.join(process.cwd(), 'config', `${industryConfig}-config.js`);
    
    // Check config file exists
    this.check(
      fs.existsSync(configPath),
      `Configuration file found: ${industryConfig}-config.js`,
      `Configuration file not found: ${configPath}`
    );

    if (!fs.existsSync(configPath)) {
      return;
    }

    try {
      // Load and validate configuration
      const config = require(configPath);
      
      // Check main sections
      const requiredSections = [
        'semantic',
        'timing', 
        'buffer',
        'circuitBreaker'
      ];

      requiredSections.forEach(section => {
        this.check(
          config[section],
          `Configuration section '${section}' is present`,
          `Configuration section '${section}' is missing`
        );
      });

      // Validate semantic patterns
      if (config.semantic && config.semantic.patterns) {
        this.check(
          Array.isArray(config.semantic.patterns.fragments),
          'Fragment patterns are defined as array',
          'Fragment patterns should be an array'
        );

        this.check(
          Array.isArray(config.semantic.patterns.complete),
          'Complete patterns are defined as array',
          'Complete patterns should be an array'
        );

        // Test pattern compilation
        let validPatterns = true;
        config.semantic.patterns.fragments.forEach((pattern, index) => {
          try {
            new RegExp(pattern);
          } catch (error) {
            validPatterns = false;
            this.errors.push(`Invalid regex in fragments[${index}]: ${error.message}`);
          }
        });

        this.check(
          validPatterns,
          'All fragment patterns are valid regex',
          'Some fragment patterns have invalid regex syntax'
        );
      }

      // Validate timing configuration
      if (config.timing && config.timing.profiles) {
        const profiles = Object.keys(config.timing.profiles);
        
        this.check(
          profiles.length > 0,
          `Found ${profiles.length} timing profiles`,
          'No timing profiles defined'
        );

        profiles.forEach(profileName => {
          const profile = config.timing.profiles[profileName];
          
          ['urgent', 'simple', 'complex'].forEach(timing => {
            this.check(
              typeof profile[timing] === 'number' && profile[timing] > 0,
              `Timing '${timing}' in profile '${profileName}' is valid`,
              `Timing '${timing}' in profile '${profileName}' is invalid`
            );
          });
        });
      }

      // Validate buffer configuration
      if (config.buffer) {
        this.check(
          typeof config.buffer.ttl === 'number' && config.buffer.ttl > 0,
          `Buffer TTL is valid (${config.buffer.ttl}s)`,
          'Buffer TTL is invalid'
        );

        this.check(
          typeof config.buffer.maxSize === 'number' && config.buffer.maxSize > 0,
          `Buffer max size is valid (${config.buffer.maxSize})`,
          'Buffer max size is invalid'
        );
      }

    } catch (error) {
      this.check(
        false,
        '',
        `Configuration loading failed: ${error.message}`
      );
    }
  }

  async validateTemplates() {
    log('\n📋 Validating Workflow Templates...', 'blue');
    
    const templatesDir = path.join(process.cwd(), 'templates', 'workflows');
    
    this.check(
      fs.existsSync(templatesDir),
      'Templates directory exists',
      'Templates directory not found'
    );

    if (!fs.existsSync(templatesDir)) {
      return;
    }

    const coreTemplate = path.join(templatesDir, 'buffer-core.json');
    
    this.check(
      fs.existsSync(coreTemplate),
      'Core buffer template found',
      'Core buffer template (buffer-core.json) not found'
    );

    if (fs.existsSync(coreTemplate)) {
      try {
        const template = JSON.parse(fs.readFileSync(coreTemplate, 'utf8'));
        
        this.check(
          template.nodes && Array.isArray(template.nodes),
          `Template has ${template.nodes.length} nodes`,
          'Template structure is invalid'
        );

        this.check(
          template.connections && typeof template.connections === 'object',
          'Template has node connections defined',
          'Template connections are missing'
        );

        // Check for key nodes
        const nodeNames = template.nodes.map(node => node.name || node.id);
        const requiredNodes = [
          'Semantic Analyzer',
          'Smart Orchestrator', 
          'Buffer Manager'
        ];

        requiredNodes.forEach(nodeName => {
          const hasNode = nodeNames.some(name => 
            name.toLowerCase().includes(nodeName.toLowerCase())
          );
          
          this.check(
            hasNode,
            `Found required node: ${nodeName}`,
            `Missing required node: ${nodeName}`,
            true
          );
        });

      } catch (error) {
        this.check(
          false,
          '',
          `Template parsing failed: ${error.message}`
        );
      }
    }
  }

  async validateDependencies() {
    log('\n📦 Validating Dependencies...', 'blue');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    
    this.check(
      fs.existsSync(packagePath),
      'package.json found',
      'package.json not found'
    );

    if (!fs.existsSync(packagePath)) {
      return;
    }

    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check required dependencies
      const requiredDeps = ['ioredis', 'dotenv'];
      const dependencies = {...pkg.dependencies, ...pkg.devDependencies};
      
      requiredDeps.forEach(dep => {
        this.check(
          dependencies[dep],
          `Dependency '${dep}' is installed`,
          `Missing dependency: ${dep}`,
          true
        );
      });

      // Check if node_modules exists
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      this.check(
        fs.existsSync(nodeModulesPath),
        'node_modules directory exists',
        'Dependencies not installed (run: npm install)',
        true
      );

    } catch (error) {
      this.check(
        false,
        '',
        `package.json parsing failed: ${error.message}`
      );
    }
  }

  displaySummary() {
    log('\n📊 Validation Summary', 'bold');
    log('═'.repeat(50), 'blue');
    
    log(`Total checks: ${this.checks}`, 'blue');
    log(`Passed: ${this.passed}`, 'green');
    log(`Warnings: ${this.warnings.length}`, 'yellow');
    log(`Errors: ${this.errors.length}`, 'red');
    
    const successRate = Math.round((this.passed / this.checks) * 100);
    log(`Success rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');

    if (this.warnings.length > 0) {
      log('\n⚠️  Warnings:', 'yellow');
      this.warnings.forEach(warning => log(`  • ${warning}`, 'yellow'));
    }

    if (this.errors.length > 0) {
      log('\n❌ Errors:', 'red');
      this.errors.forEach(error => log(`  • ${error}`, 'red'));
      log('\nPlease fix these errors before proceeding.', 'red');
      return false;
    }

    if (this.warnings.length === 0 && this.errors.length === 0) {
      log('\n🎉 All validations passed! Your setup is ready.', 'green');
    } else {
      log('\n✅ Validation completed with warnings. Setup should work.', 'yellow');
    }

    return true;
  }
}

async function main() {
  log('🔍 N8N Smart Buffer - Configuration Validator\n', 'bold');
  
  const validator = new ConfigValidator();
  
  try {
    await validator.validateEnvironment();
    await validator.validateRedisConnection();
    await validator.validateConfiguration();
    await validator.validateTemplates();
    await validator.validateDependencies();
    
    const isValid = validator.displaySummary();
    
    if (!isValid) {
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ Validation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run validation
main();