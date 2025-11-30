#!/bin/bash

# Test script for Public Points Lookup API
BASE_URL=${BASE_URL:-http://localhost:5555}

echo "Testing public points lookup (no auth)"
echo "========================================"

echo "Simple query by lastName"
curl -s "$BASE_URL/api/records/public/find?lastName=Doe" | jq '.'

echo "Query by lastName + record_id (disambiguation)"
curl -s "$BASE_URL/api/records/public/find?lastName=Doe&record_id=BT-0001" | jq '.'

echo "Done"
