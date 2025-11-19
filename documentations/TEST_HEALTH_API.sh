#!/bin/bash

# Quick test script for health endpoint
# Usage: ./TEST_HEALTH_API.sh

BASE_URL=${BASE_URL:-http://localhost:5555}

echo "Testing /health endpoint (no DB check)"
echo "================================"
curl -s "$BASE_URL/health" | jq '.'

echo "Testing /health endpoint with DB check (db=true)"
echo "================================"
curl -s "$BASE_URL/health?db=true" | jq '.'

echo "Done"
