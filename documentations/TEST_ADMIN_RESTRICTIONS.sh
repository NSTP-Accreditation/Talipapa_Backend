#!/bin/bash

# Backend Admin Permission Restriction - Testing Script
# This script tests the new Admin permission restrictions

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password}"
SUPERADMIN_USERNAME="${SUPERADMIN_USERNAME:-superadmin}"
SUPERADMIN_PASSWORD="${SUPERADMIN_PASSWORD:-password}"

echo "========================================================================"
echo "BACKEND ADMIN PERMISSION RESTRICTION - TEST SCRIPT"
echo "========================================================================"
echo ""
echo "API Base URL: $API_BASE_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local token=$3
    local expected_status=$4
    local description=$5
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X "$method" \
        -H "Authorization: Bearer $token" \
        "$API_BASE_URL$endpoint")
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
        return 1
    fi
}

# Login function
login() {
    local username=$1
    local password=$2
    
    response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    token=$(echo "$response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo -e "${RED}Login failed for $username${NC}"
        return 1
    fi
    
    echo "$token"
}

# Test Admin Login
echo "========================================================================"
echo "1. ADMIN LOGIN"
echo "========================================================================"
echo ""

ADMIN_TOKEN=$(login "$ADMIN_USERNAME" "$ADMIN_PASSWORD")

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Failed to login as Admin. Please check credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Successfully logged in as Admin${NC}"
echo ""

# Test Admin Access to Home Editables (Should Succeed)
echo "========================================================================"
echo "2. ADMIN ACCESS - HOME EDITABLES (Should Succeed)"
echo "========================================================================"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

test_endpoint "GET" "/api/pageContent/home" "$ADMIN_TOKEN" "200" "Page Content (About Us)"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/guidelines" "$ADMIN_TOKEN" "200" "Guidelines"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/news" "$ADMIN_TOKEN" "200" "News"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/achievements" "$ADMIN_TOKEN" "200" "Achievements"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/talipapanatin" "$ADMIN_TOKEN" "200" "Talipapa Natin"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/officials" "$ADMIN_TOKEN" "200" "Barangay Officials"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

echo ""
echo -e "Home Editables: ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}"
echo ""

# Test Admin Access to Restricted Features (Should Fail)
echo "========================================================================"
echo "3. ADMIN ACCESS - RESTRICTED FEATURES (Should Fail with 403)"
echo "========================================================================"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

test_endpoint "GET" "/api/users" "$ADMIN_TOKEN" "403" "User Management"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/records" "$ADMIN_TOKEN" "403" "Records Management"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/products" "$ADMIN_TOKEN" "403" "Trading - Products"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/materials" "$ADMIN_TOKEN" "403" "Trading - Materials"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/skills" "$ADMIN_TOKEN" "403" "Trading - Skills"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/establishments" "$ADMIN_TOKEN" "403" "Green Pages - Establishments"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/farms" "$ADMIN_TOKEN" "403" "Green Pages - Farms"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/farm-inventory" "$ADMIN_TOKEN" "403" "Farm Inventory"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/logs" "$ADMIN_TOKEN" "403" "Activity Logs"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/security/logs" "$ADMIN_TOKEN" "403" "Security Logs"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

test_endpoint "GET" "/api/staff" "$ADMIN_TOKEN" "403" "Staff Management"
[ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))

echo ""
echo -e "Restricted Features: ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}"
echo ""

# Test SuperAdmin Login
echo "========================================================================"
echo "4. SUPERADMIN LOGIN"
echo "========================================================================"
echo ""

SUPERADMIN_TOKEN=$(login "$SUPERADMIN_USERNAME" "$SUPERADMIN_PASSWORD")

if [ -z "$SUPERADMIN_TOKEN" ]; then
    echo -e "${YELLOW}Warning: Failed to login as SuperAdmin. Skipping SuperAdmin tests.${NC}"
else
    echo -e "${GREEN}✓ Successfully logged in as SuperAdmin${NC}"
    echo ""
    
    # Test SuperAdmin Access (Should Succeed)
    echo "========================================================================"
    echo "5. SUPERADMIN ACCESS - ALL FEATURES (Should Succeed)"
    echo "========================================================================"
    echo ""
    
    PASS_COUNT=0
    FAIL_COUNT=0
    
    test_endpoint "GET" "/api/users" "$SUPERADMIN_TOKEN" "200" "User Management"
    [ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))
    
    test_endpoint "GET" "/api/records" "$SUPERADMIN_TOKEN" "200" "Records Management"
    [ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))
    
    test_endpoint "GET" "/api/products" "$SUPERADMIN_TOKEN" "200" "Trading - Products"
    [ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))
    
    test_endpoint "GET" "/api/establishments" "$SUPERADMIN_TOKEN" "200" "Green Pages - Establishments"
    [ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))
    
    test_endpoint "GET" "/api/farm-inventory" "$SUPERADMIN_TOKEN" "200" "Farm Inventory"
    [ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))
    
    test_endpoint "GET" "/api/logs" "$SUPERADMIN_TOKEN" "200" "Activity Logs"
    [ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))
    
    test_endpoint "GET" "/api/security/logs" "$SUPERADMIN_TOKEN" "200" "Security Logs"
    [ $? -eq 0 ] && ((PASS_COUNT++)) || ((FAIL_COUNT++))
    
    echo ""
    echo -e "SuperAdmin Access: ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}"
    echo ""
fi

# Summary
echo "========================================================================"
echo "TEST SUMMARY"
echo "========================================================================"
echo ""
echo "✅ Admin can access Home Editables"
echo "❌ Admin cannot access restricted features"
echo "✅ SuperAdmin has full system access"
echo ""
echo "Next steps:"
echo "1. Review any failed tests above"
echo "2. Check security logs: GET /api/security/logs?event=PERMISSION_DENIED"
echo "3. Verify frontend behavior matches backend restrictions"
echo ""
echo "========================================================================"
