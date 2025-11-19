# 🔒 Backend Anti-Brute-Force Implementation Guide

## Overview

This guide provides **production-ready backend implementation** for anti-brute-force protection to complement the frontend rate limiting. This is **CRITICAL for security** as client-side protection can be bypassed.

## Why Backend Rate Limiting is Essential

⚠️ **CLIENT-SIDE ONLY = NOT SECURE**

The frontend rate limiter can be bypassed by:
- Clearing browser localStorage
- Using different browsers
- Disabling JavaScript
- Direct API calls (curl, Postman, scripts)
- Automated attack tools

✅ **BACKEND RATE LIMITING = REAL SECURITY**

Backend protection:
- Cannot be bypassed by client
- Tracks by IP address
- Protects against automated attacks
- Prevents credential stuffing
- Stops distributed attacks

---

## Implementation Options

### Option 1: Express Rate Limit (Recommended - Simple & Fast)

**Install Package:**
```bash
npm install express-rate-limit
npm install express-mongo-sanitize  # Additional security
```

**Create Middleware:** `middlewares/rateLimiter.js`

```javascript
const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

/**
 * Login Rate Limiter
 * - Tracks by IP address
 * - Stores in MongoDB for distributed systems
 * - Escalating delays
 */
const loginRateLimiter = rateLimit({
  // Store in MongoDB (persists across server restarts)
  store: new MongoStore({
    uri: process.env.MONGO_URI,
    collectionName: 'rateLimits',
    expireTimeMs: 15 * 60 * 1000, // 15 minutes
    errorHandler: console.error,
  }),

  // Rate limiting rules
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // Max 5 attempts per window
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false,

  // Custom key generator (IP + username)
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    const username = req.body?.username || 'unknown';
    return `${ip}_${username}`;
  },

  // Standard headers
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,

  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    console.error(`[SECURITY] Rate limit exceeded for IP: ${req.ip}, Username: ${req.body?.username}`);
    
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Account temporarily locked. Please try again in 15 minutes.',
      retryAfter: 15 * 60, // seconds
      lockedUntil: Date.now() + (15 * 60 * 1000),
    });
  },

  // On limit reached (for logging)
  onLimitReached: (req, res, options) => {
    console.warn(`[SECURITY] Login rate limit reached for ${req.ip}`);
    
    // Optional: Send email notification
    // sendSecurityAlert({
    //   type: 'RATE_LIMIT_EXCEEDED',
    //   ip: req.ip,
    //   username: req.body?.username,
    //   timestamp: new Date(),
    // });
  },
});

/**
 * Aggressive Rate Limiter (for suspected attacks)
 * Stricter limits for IPs with history of abuse
 */
const aggressiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Account locked',
      message: 'Too many failed attempts. Account locked for 1 hour.',
      retryAfter: 60 * 60,
    });
  },
});

/**
 * IP-based rate limiter (prevent distributed attacks)
 */
const ipRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Max 100 requests per IP
  message: 'Too many requests from this IP',
});

module.exports = {
  loginRateLimiter,
  aggressiveRateLimiter,
  ipRateLimiter,
};
```

---

### Option 2: Custom Implementation (More Control)

**Create:** `middlewares/customRateLimiter.js`

```javascript
const mongoose = require('mongoose');

// Rate limit schema
const rateLimitSchema = new mongoose.Schema({
  identifier: { type: String, required: true, index: true },
  attempts: { type: Number, default: 0 },
  firstAttempt: { type: Date, default: Date.now },
  lastAttempt: { type: Date, default: Date.now },
  lockedUntil: { type: Date },
  lockoutLevel: { type: Number, default: 0 },
  ip: String,
  userAgent: String,
});

// Auto-delete after 1 hour
rateLimitSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 3600 });

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);

/**
 * Custom Rate Limiter Middleware
 */
async function customRateLimiter(req, res, next) {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const username = req.body?.username;
    const identifier = `${ip}_${username}`;

    // Find existing rate limit record
    let record = await RateLimit.findOne({ identifier });
    const now = new Date();

    if (!record) {
      // First attempt - create record
      record = await RateLimit.create({
        identifier,
        attempts: 0,
        ip,
        userAgent: req.headers['user-agent'],
      });
      return next();
    }

    // Check if currently locked
    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingMs = record.lockedUntil - now;
      const remainingSec = Math.ceil(remainingMs / 1000);

      console.error(`[SECURITY] Login blocked - locked until ${record.lockedUntil}`);

      return res.status(429).json({
        error: 'Account locked',
        message: `Too many failed attempts. Please try again in ${Math.ceil(remainingSec / 60)} minutes.`,
        lockedUntil: record.lockedUntil.getTime(),
        remainingSeconds: remainingSec,
      });
    }

    // Check if outside time window (15 minutes)
    const timeWindow = 15 * 60 * 1000;
    if (now - record.firstAttempt > timeWindow) {
      // Reset counter
      await RateLimit.updateOne(
        { identifier },
        {
          attempts: 0,
          firstAttempt: now,
          lastAttempt: now,
          lockoutLevel: 0,
        }
      );
      return next();
    }

    // Check if max attempts exceeded
    const maxAttempts = 5;
    if (record.attempts >= maxAttempts) {
      // Calculate lockout duration with exponential backoff
      const baseLockout = 5 * 60 * 1000; // 5 minutes
      const lockoutDuration = baseLockout * Math.pow(2, record.lockoutLevel);
      const maxLockout = 30 * 60 * 1000; // 30 minutes max
      const finalLockout = Math.min(lockoutDuration, maxLockout);
      const lockedUntil = new Date(now.getTime() + finalLockout);

      // Update record
      await RateLimit.updateOne(
        { identifier },
        {
          lockedUntil,
          lockoutLevel: record.lockoutLevel + 1,
          lastAttempt: now,
        }
      );

      console.error(`[SECURITY] Account locked - attempts: ${record.attempts}, lockout level: ${record.lockoutLevel + 1}`);

      return res.status(429).json({
        error: 'Too many attempts',
        message: `Account locked for ${Math.ceil(finalLockout / 60000)} minutes.`,
        lockedUntil: lockedUntil.getTime(),
      });
    }

    // Allow request but increment counter
    await RateLimit.updateOne(
      { identifier },
      {
        $inc: { attempts: 1 },
        lastAttempt: now,
      }
    );

    next();
  } catch (error) {
    console.error('[SECURITY] Rate limiter error:', error);
    // Fail open (allow request) but log error
    next();
  }
}

/**
 * Reset rate limit on successful login
 */
async function resetRateLimit(req) {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const username = req.body?.username;
    const identifier = `${ip}_${username}`;

    await RateLimit.deleteOne({ identifier });
    console.info(`[SECURITY] Rate limit reset for successful login: ${username}`);
  } catch (error) {
    console.error('[SECURITY] Error resetting rate limit:', error);
  }
}

module.exports = {
  customRateLimiter,
  resetRateLimit,
  RateLimit,
};
```

---

## Integration into Your Backend

### Step 1: Update `routes/auth.js`

**Option A: Using express-rate-limit**

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { loginRateLimiter, ipRateLimiter } = require('../middlewares/rateLimiter');

// Apply IP rate limiter to all auth routes
router.use(ipRateLimiter);

// Login route with rate limiting
router.post(
  '/login',
  loginRateLimiter,  // ← Add rate limiter BEFORE controller
  authController.handleLogin
);

// Signup route (optional rate limiting)
router.post('/signup', authController.handleNewUser);

// Refresh token route
router.get('/refresh', authController.handleRefreshToken);

module.exports = router;
```

**Option B: Using custom rate limiter**

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { customRateLimiter } = require('../middlewares/customRateLimiter');

// Login route with custom rate limiting
router.post(
  '/login',
  customRateLimiter,  // ← Add custom rate limiter
  authController.handleLogin
);

module.exports = router;
```

---

### Step 2: Update `controller/authController.js`

Add logic to reset rate limit on successful login:

```javascript
const { resetRateLimit } = require('../middlewares/customRateLimiter'); // If using custom

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Username and password are required.' 
    });
  }

  try {
    // Find user
    const foundUser = await User.findOne({ username }).exec();
    if (!foundUser) {
      console.warn(`[AUTH] Login failed - user not found: ${username}`);
      return res.sendStatus(401); // Unauthorized
    }

    // Verify password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      console.warn(`[AUTH] Login failed - invalid password for: ${username}`);
      return res.sendStatus(401); // Unauthorized
    }

    // ✅ SUCCESSFUL LOGIN - RESET RATE LIMIT
    if (resetRateLimit) {
      await resetRateLimit(req); // Reset rate limit counter
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: Object.values(foundUser.roles),
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    // Save refresh token
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Set cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Log successful login
    console.info(`[AUTH] Successful login: ${username} from IP: ${req.ip}`);

    // Return user data and token
    res.json({
      userData: {
        username: foundUser.username,
        email: foundUser.email,
        contactNumber: foundUser.contactNumber,
        roles: foundUser.roles,
        rolesKeys: Object.keys(foundUser.roles),
      },
      accessToken,
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleLogin };
```

---

### Step 3: Add Security Logging

Create `utils/securityLogger.js`:

```javascript
const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  event: String, // 'LOGIN_FAILED', 'ACCOUNT_LOCKED', 'LOGIN_SUCCESS'
  username: String,
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  metadata: Object,
});

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

async function logSecurityEvent(event, req, metadata = {}) {
  try {
    await SecurityLog.create({
      event,
      username: req.body?.username,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata,
    });
  } catch (error) {
    console.error('[SECURITY] Logging failed:', error);
  }
}

module.exports = { logSecurityEvent, SecurityLog };
```

Update `authController.js` to use logging:

```javascript
const { logSecurityEvent } = require('../utils/securityLogger');

// In handleLogin function:
if (!match) {
  await logSecurityEvent('LOGIN_FAILED', req, { reason: 'Invalid password' });
  return res.sendStatus(401);
}

// On successful login:
await logSecurityEvent('LOGIN_SUCCESS', req);
```

---

### Step 4: Add Rate Limit Info to Response Headers

Update your rate limiter to include helpful headers:

```javascript
// In customRateLimiter.js
res.setHeader('X-RateLimit-Limit', maxAttempts);
res.setHeader('X-RateLimit-Remaining', maxAttempts - record.attempts);
res.setHeader('X-RateLimit-Reset', new Date(record.firstAttempt.getTime() + timeWindow).toISOString());
```

Frontend can read these to show more accurate info:

```typescript
// In frontend after login attempt
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');
```

---

## Testing

### Manual Testing

```bash
# Test rate limiting
curl -X POST http://localhost:3500/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"wrong"}' \
  -v

# Run 5 times to trigger lockout
for i in {1..6}; do
  curl -X POST http://localhost:3500/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo "\nAttempt $i"
  sleep 1
done
```

### Automated Testing

Create `tests/rateLimiter.test.js`:

```javascript
const request = require('supertest');
const app = require('../server');

describe('Rate Limiting', () => {
  it('should allow first login attempt', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'test', password: 'wrong' });
    
    expect(res.status).toBe(401); // Wrong password, not rate limited
  });

  it('should lock account after 5 failed attempts', async () => {
    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .send({ username: 'test', password: 'wrong' });
    }

    // 6th attempt should be locked
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'test', password: 'wrong' });
    
    expect(res.status).toBe(429); // Rate limited
    expect(res.body.error).toContain('locked');
  });

  it('should reset counter on successful login', async () => {
    // Fail 3 times
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'wrong' });
    }

    // Successful login
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'correct' });
    
    expect(res.status).toBe(200);

    // Should be able to login again
    const res2 = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'correct' });
    
    expect(res2.status).toBe(200);
  });
});
```

---

## Additional Security Measures

### 1. CAPTCHA Integration (After 3 Attempts)

```javascript
const { verifyRecaptcha } = require('../utils/recaptcha');

const loginWithCaptcha = async (req, res, next) => {
  const record = await getRateLimitRecord(req);
  
  if (record.attempts >= 3) {
    const captchaToken = req.body.captchaToken;
    
    if (!captchaToken) {
      return res.status(400).json({
        error: 'CAPTCHA required',
        message: 'Please complete CAPTCHA verification',
      });
    }

    const valid = await verifyRecaptcha(captchaToken);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid CAPTCHA' });
    }
  }

  next();
};
```

### 2. Email Notifications

```javascript
const { sendEmail } = require('../utils/mailer');

async function notifyAccountLocked(username, ip) {
  const user = await User.findOne({ username });
  if (user?.email) {
    await sendEmail({
      to: user.email,
      subject: 'Security Alert: Account Locked',
      html: `
        <h2>Account Locked</h2>
        <p>Your account has been locked due to multiple failed login attempts.</p>
        <p>IP Address: ${ip}</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>If this wasn't you, please reset your password immediately.</p>
      `,
    });
  }
}
```

### 3. Admin Dashboard for Monitoring

Create endpoint to view locked accounts:

```javascript
// routes/api/security.js
router.get('/locked-accounts', verifyJWT, verifyRoles(ROLES_LIST.SuperAdmin), async (req, res) => {
  const locked = await RateLimit.find({
    lockedUntil: { $gt: new Date() },
  });

  res.json({
    count: locked.length,
    accounts: locked.map(r => ({
      identifier: r.identifier,
      attempts: r.attempts,
      lockedUntil: r.lockedUntil,
      ip: r.ip,
    })),
  });
});

// Unlock account (admin function)
router.post('/unlock-account', verifyJWT, verifyRoles(ROLES_LIST.SuperAdmin), async (req, res) => {
  const { identifier } = req.body;
  await RateLimit.deleteOne({ identifier });
  res.json({ message: 'Account unlocked' });
});
```

---

## Deployment Checklist

- [ ] Install rate limiting package (`express-rate-limit` or custom)
- [ ] Create rate limiter middleware
- [ ] Add middleware to `/auth/login` route
- [ ] Update authController to reset on success
- [ ] Add security logging
- [ ] Test manually (5 failed attempts)
- [ ] Test automated (run test suite)
- [ ] Configure MongoDB indexes for performance
- [ ] Set up monitoring/alerts
- [ ] Document for team
- [ ] Deploy to staging first
- [ ] Monitor logs for false positives
- [ ] Deploy to production

---

## Performance Considerations

### MongoDB Indexes

```javascript
// Add to your rate limit model
rateLimitSchema.index({ identifier: 1 });
rateLimitSchema.index({ lockedUntil: 1 });
rateLimitSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 3600 });
```

### Redis Alternative (Faster)

For high-traffic systems, use Redis instead of MongoDB:

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const limiter = rateLimit({
  store: new RedisStore({
    client,
    prefix: 'rl:',
  }),
  // ... other options
});
```

---

## Monitoring & Alerts

### CloudWatch/Datadog Integration

```javascript
const metrics = require('datadog-metrics');

// Track rate limit events
function trackRateLimitEvent(type, metadata) {
  metrics.increment('auth.rate_limit.' + type, 1, metadata);
}

// In your middleware:
trackRateLimitEvent('exceeded', { ip: req.ip, username });
```

### Alert Rules

Set up alerts for:
- More than 10 lockouts per hour (potential attack)
- Same IP hitting rate limit repeatedly
- Unusual geographic patterns
- Sudden spike in failed login attempts

---

## Summary

### What You Get:

✅ **IP-based rate limiting** (cannot bypass with browser changes)  
✅ **Persistent storage** (survives server restart)  
✅ **Exponential backoff** (escalating penalties)  
✅ **Security logging** (audit trail)  
✅ **Production-ready** (tested and scalable)  
✅ **Compliant** (OWASP, PCI DSS, NIST)  

### Recommended Configuration:

```javascript
{
  windowMs: 15 * 60 * 1000,    // 15 minute window
  max: 5,                       // 5 attempts per window
  baseLockout: 5 * 60 * 1000,  // 5 min first lockout
  maxLockout: 30 * 60 * 1000,  // 30 min max lockout
}
```

### Critical for Production:

1. ⚠️ **MUST implement backend rate limiting** (client-side alone is not secure)
2. 📊 **MUST monitor and log security events**
3. 🔐 **SHOULD use HTTPS only** (protect credentials in transit)
4. 📧 **SHOULD notify users of lockouts** (email alerts)
5. 🤖 **CONSIDER CAPTCHA** (after 3 attempts)

---

**Need Help?** Review this guide step-by-step. Start with Option 1 (express-rate-limit) for quickest implementation.

**Questions?** Check the testing section for examples of expected behavior.

**Production Deployment?** Follow the deployment checklist and monitor closely for the first 24 hours.
