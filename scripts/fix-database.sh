#!/bin/bash

# Script to diagnose and fix database issues
# Author: Claude AI Assistant
# Date: 2026-01-23

set -e

echo "🔧 MarsAI Database Diagnostic and Repair Tool"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

# Check if containers are running
echo "📦 Checking Docker containers..."
if ! docker ps | grep -q marsai-mysql; then
    echo -e "${RED}❌ MySQL container is not running${NC}"
    echo "Starting containers..."
    docker-compose up -d
    echo "Waiting for MySQL to be ready..."
    sleep 10
else
    echo -e "${GREEN}✅ MySQL container is running${NC}"
fi

# Check if backend is running
if ! docker ps | grep -q marsai-backend; then
    echo -e "${YELLOW}⚠️  Backend container is not running${NC}"
    echo "Starting backend..."
    docker-compose up -d backend
    sleep 5
else
    echo -e "${GREEN}✅ Backend container is running${NC}"
fi

echo ""
echo "🔍 Checking database schema..."

# Check if database exists and has tables
TABLE_COUNT=$(docker exec marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SHOW TABLES;" 2>/dev/null | wc -l)

if [ "$TABLE_COUNT" -le 1 ]; then
    echo -e "${RED}❌ No tables found in database${NC}"
    echo ""
    echo "🔧 Initializing database schema..."

    # Import SQL schema
    if [ -f "BDD/marsai.sql" ]; then
        docker exec -i marsai-mysql mysql -uroot -prootpassword marsai < BDD/marsai.sql
        echo -e "${GREEN}✅ Database schema imported successfully${NC}"
    else
        echo -e "${RED}❌ BDD/marsai.sql file not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Database has $((TABLE_COUNT - 1)) table(s)${NC}"
fi

echo ""
echo "📋 Database tables:"
docker exec marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SHOW TABLES;"

echo ""
echo "🎭 Checking roles configuration:"
ROLE_COUNT=$(docker exec marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SELECT COUNT(*) FROM roles;" 2>/dev/null | tail -n 1)

if [ "$ROLE_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ No roles found${NC}"
    echo "Re-importing schema..."
    docker exec -i marsai-mysql mysql -uroot -prootpassword marsai < BDD/marsai.sql
else
    echo -e "${GREEN}✅ Found $ROLE_COUNT role(s)${NC}"
    docker exec marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SELECT id, name, description FROM roles;"
fi

echo ""
echo "👥 Current users in database:"
USER_COUNT=$(docker exec marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1)
echo -e "${GREEN}Total users: $USER_COUNT${NC}"

if [ "$USER_COUNT" -gt 0 ]; then
    docker exec marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SELECT id, name, email, created_at FROM users;"
fi

echo ""
echo "🔄 Restarting backend to ensure fresh connection..."
docker-compose restart backend
sleep 3

echo ""
echo -e "${GREEN}✅ Database repair completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Open http://localhost:5173/register"
echo "2. Create a test account"
echo "3. Check if it appears in the database by running:"
echo "   docker exec -it marsai-mysql mysql -uroot -prootpassword -e \"USE marsai; SELECT * FROM users;\""
echo ""
echo "📊 To monitor backend logs in real-time:"
echo "   docker logs marsai-backend -f"
echo ""
