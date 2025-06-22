/**
 * 🏥 Medical/Healthcare Configuration for Smart Buffer
 * Optimized for medical consultories, clinics, and healthcare providers
 */

module.exports = {
  name: 'Medical/Healthcare Configuration',
  version: '1.0.0',
  description: 'Semantic patterns and timing optimized for medical consultations',
  
  semantic: {
    patterns: {
      // 🔍 Fragment patterns (messages that likely need more context)
      fragments: [
        // Basic intent starters
        /^(quiero|necesito|puedo|me|cual|como|donde|cuando)$/i,
        /^(para|en|el|la|un|una|por)$/i,
        
        // Medical-specific fragments
        /^(turno|cita|consulta|precio|horario|ubicacion)$/i,
        /^(cancelar|modificar|cambiar|reagendar)$/i,
        /^(doctor|doctora|dr|dra)$/i,
        
        // Incomplete medical queries
        /^(me duele|tengo dolor|siento|me molesta)$/i,
        /^(obra social|prepaga|osde|swiss|galeno)$/i,
        /^(cuanto (cuesta|vale|sale))$/i,
        
        // Time/location fragments
        /^(mañana|tarde|noche|hoy|ayer)$/i,
        /^(lunes|martes|miercoles|jueves|viernes|sabado|domingo)$/i
      ],
      
      // ✅ Complete patterns (process immediately)
      complete: [
        // Complete appointment requests
        /quiero (un turno|una cita|agendar) (para|en|el|la) .+/i,
        /necesito (un turno|una cita) .+/i,
        /puedo (agendar|solicitar) .+ (turno|cita)/i,
        
        // Complete information requests
        /(cual es|cuanto (cuesta|vale|sale)) (el precio|la tarifa|el costo) .+/i,
        /(donde (esta|queda)|cual es la direccion|ubicacion del) consultorio/i,
        /(que|cuales) (horarios|dias) (atiende|trabaja|tiene)/i,
        /(acepta|atiende|toma) (obra social|prepaga|osde|swiss medical)/i,
        
        // Complete modifications
        /necesito (cancelar|modificar|cambiar|reagendar) (mi|el) (turno|cita) .+/i,
        /(quiero|necesito) cambiar (mi turno|la fecha|el horario) .+/i,
        
        // Complete medical queries
        /me duele .+ (desde|hace|por)/i,
        /tengo (dolor|molestia|problema) (en|de) .+/i,
        
        // Greetings/farewells (always complete)
        /^(hola|buenos dias|buenas tardes|buenas noches)( doctor| doctora)?$/i,
        /^(gracias|muchas gracias|perfecto|excelente|listo|ok)$/i,
        /^(hasta luego|nos vemos|que tenga buen dia|chau|adios)$/i,
        
        // Questions (grammatically complete)
        /.+\?$/
      ],
      
      // 🎯 Intent classification patterns
      intents: {
        appointment: /turno|cita|agendar|reservar|solicitar|pedir/i,
        cancellation: /cancelar|anular|eliminar|quitar/i,
        modification: /cambiar|modificar|reagendar|mover|reprogramar/i,
        information: /precio|costo|tarifa|horario|ubicacion|direccion|obras? social|prepaga/i,
        medical_query: /dolor|duele|molestia|sintoma|enferm|salud|medicina/i,
        greeting: /hola|buenos|buenas|buen dia/i,
        farewell: /gracias|chau|hasta luego|adios|nos vemos/i,
        confirmation: /si|ok|perfecto|excelente|listo|bien|dale/i,
        negation: /no|nunca|jamas|para nada|de ninguna manera/i
      },
      
      // 📊 Entity extraction patterns
      entities: {
        dni: /\b\d{7,8}\b/g,
        date: /\b\d{1,2}[\/\-]\d{1,2}[\/\-](\d{2}|\d{4})\b/g,
        time: /\b\d{1,2}:\d{2}(\s*(am|pm))?\b/gi,
        phone: /\b(\+54\s?)?(\d{2,4}[-\s]?)?\d{6,8}\b/g,
        age: /\b\d{1,3}\s*(años?|year|years old)\b/gi,
        
        // Medical-specific entities
        insurance: /\b(osde|swiss medical|galeno|medicus|sancor|federada|ioma|pami)\b/gi,
        specialties: /\b(clinica|cardiolog|dermatolog|ginecolog|pediatr|psicolog|traumatolog|oftalmolog)\w*/gi,
        symptoms: /\b(dolor|fiebre|tos|dolor de cabeza|nauseas|mareo)\b/gi
      }
    }
  },
  
  timing: {
    profiles: {
      // ⚡ Aggressive (fastest response)
      aggressive: {
        urgent: 1500,      // 1.5s for appointments/cancellations
        simple: 2000,      // 2s for info/greetings
        complex: 3000,     // 3s for complex medical queries
        maxBuffer: 2       // Max 2 messages before processing
      },
      
      // ⚖️ Balanced (default - good for most cases)
      balanced: {
        urgent: 2000,      // 2s for appointments/cancellations
        simple: 3000,      // 3s for info/greetings
        complex: 4000,     // 4s for complex medical queries
        maxBuffer: 3       // Max 3 messages before processing
      },
      
      // 🐌 Conservative (more buffering, better aggregation)
      conservative: {
        urgent: 3000,      // 3s for appointments/cancellations
        simple: 4000,      // 4s for info/greetings
        complex: 6000,     // 6s for complex medical queries
        maxBuffer: 4       // Max 4 messages before processing
      }
    }
  },
  
  buffer: {
    ttl: 300,             // 5 minutes buffer TTL
    maxSize: 10,          // Max 10 messages per buffer
    maxSizeKB: 50,        // Max 50KB per buffer
    cleanupInterval: 60,  // Cleanup every minute
    slidingTTL: true      // Extend TTL on new messages
  },
  
  circuitBreaker: {
    redis: {
      threshold: 3,       // 3 failures to open circuit
      timeout: 30000,     // 30s timeout before retry
      resetTimeout: 60000 // 1min before attempting reset
    },
    ml: {
      threshold: 2,       // 2 failures to open circuit
      timeout: 60000,     // 1min timeout before retry
      resetTimeout: 300000 // 5min before attempting reset
    }
  },
  
  metrics: {
    retention: {
      realtime: 300,      // 5min for real-time metrics
      aggregated: 604800, // 1 week for aggregated metrics
      alerts: 86400       // 24h for alert history
    },
    
    tracking: {
      // What metrics to track
      responseTime: true,
      bufferUtilization: true,
      intentDistribution: true,
      entityExtraction: true,
      fallbackUsage: true,
      
      // Sampling rate (1.0 = 100%, 0.1 = 10%)
      samplingRate: 1.0
    },
    
    alerts: {
      enabled: true,
      webhook: process.env.ALERT_WEBHOOK_URL,
      
      triggers: [
        {
          name: 'redis_down',
          condition: 'redis_failures > 3 in 3min',
          severity: 'critical'
        },
        {
          name: 'high_buffer_overflow',
          condition: 'buffer_overflow_rate > 5% in 5min',
          severity: 'warning'
        },
        {
          name: 'high_fallback_rate',
          condition: 'fallback_rate > 10% in 10min',
          severity: 'warning'
        },
        {
          name: 'slow_response_time',
          condition: 'avg_response_time > 10s in 5min',
          severity: 'warning'
        }
      ]
    }
  },
  
  // 🧠 ML Integration (future-ready)
  ml: {
    enabled: false,
    fallbackToRegex: true,
    
    endpoints: {
      intent: process.env.ML_INTENT_ENDPOINT,
      entity: process.env.ML_ENTITY_ENDPOINT,
      sentiment: process.env.ML_SENTIMENT_ENDPOINT
    },
    
    timeouts: {
      intent: 2000,       // 2s timeout for intent classification
      entity: 1500,       // 1.5s timeout for entity extraction
      sentiment: 1000     // 1s timeout for sentiment analysis
    },
    
    confidence: {
      minThreshold: 0.7,  // Minimum confidence to trust ML
      fallbackThreshold: 0.5 // Below this, use regex fallback
    }
  },
  
  // 🔒 Security settings
  security: {
    rateLimiting: {
      enabled: true,
      windowMs: 60000,    // 1 minute window
      maxRequests: 30,    // 30 requests per user per minute
      skipSuccessfulRequests: false
    },
    
    dataRetention: {
      bufferData: 86400,  // 24h for buffer data
      metrics: 604800,    // 1 week for metrics
      logs: 259200        // 3 days for logs
    }
  },
  
  // 📋 Validation rules
  validation: {
    required: ['redis.url'],
    
    rules: {
      'timing.profiles.balanced.urgent': {
        type: 'number',
        min: 1000,
        max: 10000
      },
      'buffer.ttl': {
        type: 'number',
        min: 60,
        max: 3600
      },
      'buffer.maxSize': {
        type: 'number',
        min: 1,
        max: 20
      }
    }
  }
};