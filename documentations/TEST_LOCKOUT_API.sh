#!/bin/bash

# Test script for Lockout Status API
# Run this to verify the endpoint is working correctly

BASE_URL="http://localhost:5555/api/auth"
USERNAME="testuser"

echo "🧪 Testing Lockout Status API"
echo "================================"
echo ""

# Test 1: Check status for non-existent user
echo "Test 1: Check status for user with no failed attempts"
curl -s "${BASE_URL}/lockout-status/${USERNAME}" | jq '.'
echo ""
echo ""

# Test 2: Invalid username (too short)
echo "Test 2: Invalid username (too short)"
curl -s "${BASE_URL}/lockout-status/ab" | jq '.'
echo ""
echo ""

# Test 3: Invalid username (special characters)
echo "Test 3: Invalid username (special characters)"
curl -s "${BASE_URL}/lockout-status/test@user" | jq '.'
echo ""
echo ""

# Test 4: Trigger failed login attempts
echo "Test 4: Trigger 5 failed login attempts"
for i in {1..5}; do
  echo "  Attempt $i/5..."
  curl -s -X POST "${BASE_URL}/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${USERNAME}\",\"password\":\"wrongpassword\"}" \
    > /dev/null
done
echo "  Done!"
echo ""

# Test 5: Check lockout status (should be locked)
echo "Test 5: Check lockout status (should be locked now)"
curl -s "${BASE_URL}/lockout-status/${USERNAME}" | jq '.'
echo ""
echo ""

# Test 6: Test rate limiter (send 11 requests rapidly)
echo "Test 6: Test rate limiter (sending 11 requests - last one should be rate limited)"
for i in {1..11}; do
  if [ $i -eq 11 ]; then
    echo "  Request $i (should be rate limited):"
    curl -s "${BASE_URL}/lockout-status/${USERNAME}" | jq '.'
  else
    curl -s "${BASE_URL}/lockout-status/${USERNAME}" > /dev/null
  fi
done
echo ""

echo "✅ Tests complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check the responses above"
echo "  2. Verify MongoDB has RateLimit documents: db.ratelimits.find()"
echo "  3. Check security logs: db.securitylogs.find({'metadata.action': 'LOCKOUT_STATUS_CHECK'})"
echo "  4. Test frontend integration"
