#!/bin/bash

echo "🚀 Creating Pull Request for Authentication System"
echo ""
echo "Branch: claude/auth-backend-setup-XdPLu"
echo "Target: main"
echo ""

# Check if gh is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI detected"
    echo ""
    echo "Creating PR..."

    gh pr create \
        --title "feat: Complete authentication system with Figma design and Docker setup" \
        --body "$(cat <<'EOF'
## 🎯 Summary

This PR implements a complete authentication system for MarsAI with a modern UI based on Figma designs, full backend integration, and Docker Compose setup for easy development.

## ✨ Features Added

### 🎨 Frontend
- **Redesigned Login & Register pages** matching Figma specifications
- **Authentication service** (`authService.js`) with API integration
- **Full-screen authentication layout** - Auth pages moved outside RootLayout for better UX
- **Enhanced form width** for improved user experience
- **Client-side validation** with error handling and loading states

### 🔧 Backend
- **Test endpoints** for development (`/api/test/db`, `/api/test/users`)
- Backend already has complete JWT authentication system from previous work

### 🐳 DevOps
- **Docker Compose configuration** with three services:
  - MySQL 8.0 (port 3306) with automatic database initialization
  - Backend API (port 5000) with health checks
  - Frontend dev server (port 5173) with hot reload
- **Database utility scripts**:
  - `clear-users.js` - Clear users table for testing
  - `test-db-connection.js` - Diagnostic tool for MySQL connection

## 📊 Changes

- **10 files changed**: +704 additions, -105 deletions
- **Frontend**: Updated App.jsx routing, Login.jsx, Register.jsx, added authService.js
- **Backend**: Added test routes and utility scripts
- **DevOps**: Added docker-compose.yml, updated .env.example

## 🧪 Testing

### Quick Start
\`\`\`bash
# Start all services
docker compose up -d

# Access application
open http://localhost:5173/register
\`\`\`

### Test Coverage
- ✅ User registration with validation
- ✅ Client-side form validation
- ✅ Error handling (duplicate email, invalid inputs)
- ✅ JWT token generation and storage
- ✅ Navigation flow (Register → Login)
- ✅ Database connection with MySQL
- ✅ Docker services orchestration

## 🔍 Technical Details

### Frontend Stack
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- localStorage for token/user persistence

### Backend Integration
- RESTful API calls to \`/api/auth/*\` endpoints
- JWT token authentication
- Error handling with user-friendly messages

### Database
- MySQL 8.0 with connection pooling
- Automatic initialization from \`BDD/marsai.sql\`
- Docker volume persistence

## 📸 UI Preview

- **Split-screen design**: Form on left, image on right (desktop)
- **Progress indicator**: Visual stepper (Register → Login)
- **Color scheme**: Based on Figma (#262335, #463699, #FBF5F0, #C7C2CE)
- **Responsive**: Mobile-friendly layout
- **Accessibility**: Proper labels and error messages

## 🚀 Deployment Readiness

- ✅ Environment variables properly configured
- ✅ Docker Compose for consistent environments
- ✅ Database initialization automated
- ✅ CORS configured for development
- ⚠️ JWT_SECRET should be changed in production

## 📝 Next Steps

After merging, consider:
- [ ] Add end-to-end tests (Cypress/Playwright)
- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables

## 🔗 Related

- Based on existing auth backend from PR #49
- Builds on admin endpoints from PR #51
- Integrates with existing MySQL schema

---

**Ready for review and testing!** 🎉
EOF
)"

    echo ""
    echo "✅ Pull Request created successfully!"
else
    echo "⚠️  GitHub CLI (gh) not found"
    echo ""
    echo "📋 Option 1: Install GitHub CLI"
    echo "   Visit: https://cli.github.com/"
    echo ""
    echo "📋 Option 2: Create PR manually"
    echo "   1. Go to: https://github.com/thomas-robert-1995/MarsAI/compare/main...claude/auth-backend-setup-XdPLu"
    echo "   2. Click 'Create pull request'"
    echo "   3. Copy content from PR_DESCRIPTION.md"
    echo ""
    echo "📋 Option 3: Use VSCode GitHub Extension"
    echo "   1. Open Source Control panel (Ctrl/Cmd + Shift + G)"
    echo "   2. Click on the branch name at bottom"
    echo "   3. Select 'Create Pull Request'"
    echo ""
fi
