const RateLimit = require("../model/RateLimit");
const { ipKeyGenerator } = require("express-rate-limit");

// Default policy values — keep in sync with middlewares/rateLimiter.js
const DEFAULTS = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_ATTEMPTS: 5,
  LOCK_DURATION_MS: 15 * 60 * 1000,
};

function getIdentifier(req, username) {
  const ip =
    ipKeyGenerator(req) || req.ip || req.connection?.remoteAddress || "unknown";
  const user = username || req.body?.username || "unknown";
  return `${ip}_${user}`;
}

async function incrementFailedAttempt(identifier, options = {}) {
  const windowMs = options.windowMs || DEFAULTS.WINDOW_MS;
  const maxAttempts = options.maxAttempts || DEFAULTS.MAX_ATTEMPTS;
  const lockDurationMs = options.lockDurationMs || DEFAULTS.LOCK_DURATION_MS;

  const now = new Date();
  const doc = await RateLimit.findOne({ identifier }).exec();

  if (!doc) {
    const newDoc = await RateLimit.create({
      identifier,
      attempts: 1,
      lastAttempt: now,
    });
    return newDoc;
  }

  // If currently locked, just return current doc
  if (doc.lockedUntil && now < doc.lockedUntil) {
    return doc;
  }

  // If last attempt was outside the window, reset attempts
  if (!doc.lastAttempt || now - doc.lastAttempt > windowMs) {
    doc.attempts = 1;
  } else {
    doc.attempts = (doc.attempts || 0) + 1;
  }

  doc.lastAttempt = now;

  if (doc.attempts >= maxAttempts) {
    doc.lockedUntil = new Date(now.getTime() + lockDurationMs);
  }

  await doc.save();
  return doc;
}

async function resetAttempts(identifier) {
  const doc = await RateLimit.findOne({ identifier }).exec();
  if (!doc) return null;
  doc.attempts = 0;
  doc.lockedUntil = null;
  doc.lastAttempt = new Date();
  await doc.save();
  return doc;
}

async function getStatus(identifier) {
  const doc = await RateLimit.findOne({ identifier }).lean().exec();
  if (!doc) {
    return {
      isLocked: false,
      attemptCount: 0,
      remainingAttempts: DEFAULTS.MAX_ATTEMPTS,
      lockedUntil: null,
      lastAttemptAt: null,
    };
  }

  const now = Date.now();
  const isLocked = doc.lockedUntil && now < new Date(doc.lockedUntil).getTime();
  return {
    isLocked: !!isLocked,
    attemptCount: doc.attempts || 0,
    remainingAttempts: Math.max(0, DEFAULTS.MAX_ATTEMPTS - (doc.attempts || 0)),
    lockedUntil: isLocked ? doc.lockedUntil : null,
    lastAttemptAt: doc.lastAttempt || null,
  };
}

module.exports = {
  getIdentifier,
  incrementFailedAttempt,
  resetAttempts,
  getStatus,
  DEFAULTS,
};
