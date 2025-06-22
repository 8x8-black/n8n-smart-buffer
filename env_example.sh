# ==============================================
# N8N SMART BUFFER - ENVIRONMENT CONFIGURATION
# ==============================================

# Redis Configuration (REQUIRED)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# Alternative Redis configuration
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_USERNAME=
# REDIS_PASSWORD=

# N8N Configuration
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http

# Smart Buffer Configuration
SMART_BUFFER_CONFIG=medical
SMART_BUFFER_DEBUG=false

# Buffer Settings
BUFFER_TTL=300
BUFFER_MAX_SIZE=3
BUFFER_MAX_SIZE_KB=50

# Timing Configuration (milliseconds)
TIMING_URGENT=2000
TIMING_SIMPLE=3000
TIMING_COMPLEX=4000

# Circuit Breaker Settings
CIRCUIT_BREAKER_REDIS_THRESHOLD=3
CIRCUIT_BREAKER_REDIS_TIMEOUT=30000
CIRCUIT_BREAKER_ML_THRESHOLD=2
CIRCUIT_BREAKER_ML_TIMEOUT=60000

# ML Integration (Optional)
ML_ENABLED=false
ML_SERVICE_URL=
ML_API_KEY=
ML_MODEL_NAME=consultorio-intent-v1
ML_TIMEOUT=2000

# Monitoring & Alerts
METRICS_ENABLED=true
METRICS_RETENTION_REALTIME=300
METRICS_RETENTION_AGGREGATED=604800

# Alert Configuration
ALERTS_ENABLED=true
ALERT_WEBHOOK_URL=
ALERT_SLACK_TOKEN=
ALERT_TELEGRAM_BOT_TOKEN=
ALERT_TELEGRAM_CHAT_ID=

# Dashboard Configuration  
DASHBOARD_ENABLED=true
DASHBOARD_PORT=3000
DASHBOARD_AUTH_REQUIRED=false
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=

# Development & Testing
NODE_ENV=development
LOG_LEVEL=info
DEBUG_SEMANTIC_ANALYSIS=false
DEBUG_TIMING_DECISIONS=false
DEBUG_BUFFER_OPERATIONS=false

# Performance Tuning
MAX_CONCURRENT_BUFFERS=100
CLEANUP_INTERVAL=60000
HEALTH_CHECK_INTERVAL=30000

# Security
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Industry-specific Configuration
# Options: medical, ecommerce, generic, custom
INDUSTRY_CONFIG=medical

# Custom Configuration Path (if INDUSTRY_CONFIG=custom)
CUSTOM_CONFIG_PATH=./config/my-custom-config.js

# ==============================================
# EXAMPLE VALUES FOR DIFFERENT ENVIRONMENTS
# ==============================================

# Development
# REDIS_URL=redis://localhost:6379
# N8N_HOST=localhost
# ML_ENABLED=false
# DASHBOARD_ENABLED=true

# Production
# REDIS_URL=redis://prod-redis.example.com:6379
# N8N_HOST=n8n.yourcompany.com
# ML_ENABLED=true
# ALERTS_ENABLED=true

# Testing
# REDIS_URL=redis://localhost:6380
# NODE_ENV=test
# LOG_LEVEL=error