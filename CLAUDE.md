# CLAUDE.md - AI Assistant Guide for MarsAI

**Last Updated**: 2026-01-23
**Version**: 1.0
**Purpose**: This document provides comprehensive guidance for AI assistants working with the MarsAI codebase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Tech Stack](#tech-stack)
4. [Development Workflow](#development-workflow)
5. [Architecture & Patterns](#architecture--patterns)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Styling & Design System](#styling--design-system)
9. [Authentication & Authorization](#authentication--authorization)
10. [Key Conventions](#key-conventions)
11. [Common Tasks](#common-tasks)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Important Files](#important-files)
15. [Gotchas & Best Practices](#gotchas--best-practices)

---

## Project Overview

**MarsAI** is a full-stack web application for managing a film festival platform with role-based access control. The system supports three user roles: Directors (submitters), Jury (evaluators), and Admins (managers).

**Key Features:**
- User authentication with JWT tokens
- Role-based access control (RBAC)
- Film submission management
- Jury voting system
- Public and private content areas
- Responsive design (mobile-first approach)

**Repository**: https://github.com/antonin-tacchi/MarsAI

---

## Codebase Structure

```
MarsAI/                           # Root (monorepo)
├── Front-end/                    # React SPA
│   ├── src/
│   │   ├── pages/               # Route pages (14 total)
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ProfileDirector.jsx
│   │   │   ├── ProfileJury.jsx
│   │   │   ├── ProfileAdmin.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Catalogs.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── DetailsFilm.jsx
│   │   │   ├── PrizeList.jsx
│   │   │   ├── Regulations.jsx
│   │   │   ├── Submissions.jsx
│   │   │   └── NotFound.jsx
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.jsx       # Navigation with role-based menu
│   │   │   ├── Footer.jsx       # Multi-column footer
│   │   │   ├── Button.jsx       # Themed button component
│   │   │   ├── Input.jsx        # Form input component
│   │   │   └── Modal.jsx        # Dialog/overlay component
│   │   ├── layouts/
│   │   │   └── RootLayout.jsx   # Wraps all pages with Header/Footer
│   │   ├── routes/
│   │   │   └── index.jsx        # Route configuration (alternate)
│   │   ├── images/              # Static assets
│   │   ├── App.jsx              # Main app component with routing
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles + Tailwind imports
│   ├── public/                  # Public static files
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite build configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS + Autoprefixer
│   ├── eslint.config.js         # ESLint rules
│   ├── Dockerfile               # Production build (Nginx)
│   └── Dockerfile.dev           # Development container
│
├── back-end/                    # Express API
│   ├── src/
│   │   ├── routes/              # API route definitions
│   │   │   ├── auth.routes.js   # /api/auth/* (register, login, profile)
│   │   │   ├── director.routes.js  # /api/director/* (role 1, 3)
│   │   │   ├── jury.routes.js      # /api/jury/* (role 2, 3)
│   │   │   ├── admin.routes.js     # /api/admin/* (role 3 only)
│   │   │   └── health.routes.js    # /api/health (public)
│   │   ├── controllers/         # Business logic
│   │   │   ├── auth.controller.js  # Auth handlers
│   │   │   └── admin.controller.js # Admin handlers
│   │   ├── middleware/          # Request processing
│   │   │   ├── auth.middleware.js      # JWT validation
│   │   │   └── authorize.middleware.js # Role checking
│   │   ├── models/              # Data access layer
│   │   │   └── User.js          # User CRUD + role operations
│   │   ├── config/              # Configuration
│   │   │   └── database.js      # MySQL pool config
│   │   ├── index.js             # Express app entry point
│   │   └── db.js                # MySQL connection pool
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment template
│   └── Dockerfile               # Production build (Node)
│
├── BDD/                         # Database (git-ignored)
│   └── marsai.sql              # MySQL schema (not in version control)
│
├── docker-compose.yml           # Local development setup
├── package.json                 # Root-level scripts
├── .gitignore                   # Standard Node.js + /db/
└── README.md                    # Project README (minimal)
```

**Directory Statistics:**
- Frontend: ~933 lines of JSX code
- Backend: ~538 lines of JavaScript code
- Total: ~14 pages, 5 components, 5 route modules

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| React Router DOM | 7.12.0 | Client-side routing |
| Vite | 7.2.4 | Build tool & dev server |
| Tailwind CSS | 3.4.0 | Utility-first styling |
| PostCSS | 8.5.6 | CSS processing |
| Autoprefixer | 10.4.21 | CSS vendor prefixes |
| React Icons | 5.5.0 | Icon library (Font Awesome 6) |
| ESLint | 9.39.1 | Code linting |

**Module System**: ES Modules (`"type": "module"` in package.json)

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 (Alpine) | Runtime environment |
| Express | 4.19.2 | Web framework |
| MySQL2 | 3.16.1 | Database driver (promise-based) |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT authentication |
| express-validator | 7.3.1 | Request validation |
| cors | 2.8.5 | Cross-origin resource sharing |
| dotenv | 16.4.5 | Environment variables |
| nodemon | 3.1.4 | Development auto-restart |

**Module System**: ES Modules (`"type": "module"` in package.json)

### Database
- **MySQL**: 8+ (persistent storage)
- **Connection**: Pool-based (max 10 connections)
- **Database Name**: `marsai`

### Infrastructure
- **Docker**: Multi-stage builds for production
- **Nginx**: Frontend static file serving (production)
- **Docker Compose**: Local development orchestration

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/antonin-tacchi/MarsAI.git
cd MarsAI

# Install dependencies (root level)
npm install

# Install frontend dependencies
cd Front-end
npm install

# Install backend dependencies
cd ../back-end
npm install

# Setup database (requires MySQL 8+)
mysql -u root -p
CREATE DATABASE marsai;
USE marsai;
SOURCE ../BDD/marsai.sql;  # Import schema

# Configure environment
cd back-end
cp .env.example .env
# Edit .env with your database credentials
```

### Development Commands

**Docker Compose (Recommended):**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:5000
# - API Health: http://localhost:5000/api/health
```

**Frontend (Manual):**
```bash
cd Front-end
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Backend (Manual):**
```bash
cd back-end
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start normally (production)
```

### Git Workflow

**Branching Strategy:**
- Feature branches: `feat/{feature-name}` (e.g., `feat/login`, `feat/role-based-access`)
- Bug fixes: `fix/{bug-name}`
- Main branch: Direct merges via pull requests

**Commit Convention:**
```
type(scope): description

Examples:
- feat(auth): add JWT authentication
- fix(login): resolve validation error
- style(register): add custom button colors
- refactor(middleware): simplify role checking
- docs(readme): update installation steps
```

**Current Active Branches:**
- `claude/claude-md-mkqqadthjih7goq1-0s4Qh` (AI development branch)

**Important Git Reminders:**
- ALWAYS develop on the designated branch
- NEVER push to main without PR approval
- Use clear, descriptive commit messages
- Push with: `git push -u origin <branch-name>`

---

## Architecture & Patterns

### Frontend Architecture

**Pattern**: Single Page Application (SPA) with component-based architecture

**Key Concepts:**
1. **Functional Components**: All components use React hooks (no class components)
2. **Layout Wrapper**: `RootLayout` wraps all pages with `<Header />` and `<Footer />`
3. **Client-Side Routing**: React Router DOM handles navigation
4. **State Management**: Local state with `useState` (no global state library yet)
5. **Responsive Design**: Mobile-first with Tailwind breakpoints

**Component Pattern:**
```javascript
// Standard functional component
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);

  const handleEvent = () => {
    // Event handler logic
    setState(newValue);
  };

  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
}
```

**Routing Pattern:**
```javascript
// App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
```

### Backend Architecture

**Pattern**: RESTful API with MVC (Model-View-Controller) structure

**Request Flow:**
```
Incoming Request
    ↓
CORS Middleware
    ↓
JSON Body Parser
    ↓
Route Handler
    ↓
Authentication Middleware (if protected)
    ↓
Authorization Middleware (if role-specific)
    ↓
Validation Middleware (express-validator)
    ↓
Controller Function
    ↓
Model (Database Operations)
    ↓
Response (JSON)
```

**Controller Pattern:**
```javascript
// Async/await with try-catch
export const functionName = async (req, res) => {
  try {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Business logic
    const result = await Model.operation();

    // Success response
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
```

**Model Pattern:**
```javascript
// Direct MySQL queries with parameterized statements
export const findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};
```

### Role-Based Access Control (RBAC)

**Role IDs:**
- `1` = Director (film submitters)
- `2` = Jury (evaluators)
- `3` = Admin (full access)

**Access Levels:**
- Public: No authentication required
- Protected: Valid JWT required
- Role-specific: JWT + specific role(s) required

**Middleware Chain:**
```javascript
// Routes with role restriction
router.use(authenticateToken);           // Verify JWT
router.use(authorize([1, 3]));          // Allow roles 1 and 3
router.get('/access', controller);       // Route handler
```

---

## API Reference

**Base URL**: `http://localhost:5000/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response (201):
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-20T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- `email`: Must be valid email format
- `password`: Minimum 6 characters
- `name`: Required (full name)

**Default Role**: New users automatically assigned role 1 (Director)

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "bio": null,
    "country": null,
    "school": null,
    "created_at": "2024-01-20T10:00:00.000Z"
  }
}
```

### Protected Endpoints

#### Director Access
```http
GET /api/director/access
Authorization: Bearer <token>
Roles: 1 (Director), 3 (Admin)

Response (200):
{
  "message": "Accès Director autorisé",
  "user": { /* decoded JWT payload */ }
}
```

#### Jury Access
```http
GET /api/jury/access
Authorization: Bearer <token>
Roles: 2 (Jury), 3 (Admin)

Response (200):
{
  "message": "Accès Jury autorisé",
  "user": { /* decoded JWT payload */ }
}
```

#### Admin - Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
Roles: 3 (Admin only)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "roles": [1, 3]
    }
  ]
}
```

### Public Endpoints

#### Health Check
```http
GET /api/health

Response (200):
{
  "status": "OK",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

### JWT Token Structure

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "roles": [1, 3],
  "iat": 1705750000,
  "exp": 1705836400
}
```

**Expiration**: 24 hours (86400 seconds)

### Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient role permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Database or server error |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Database Schema

**Database Name**: `marsai`

### Tables

#### `users` Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hashed
  bio TEXT,
  country VARCHAR(255),
  school VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `user_roles` Junction Table
```sql
CREATE TABLE user_roles (
  user_id INT,
  role_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);
```

#### `roles` Reference Table
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);

-- Predefined roles:
-- 1: Director
-- 2: Jury
-- 3: Admin
```

#### `films` Table (Referenced in docs)
```sql
-- Film submissions (schema in BDD/marsai.sql)
-- Fields likely include: id, title, director_id, year, genre, etc.
```

#### Additional Tables (Referenced but not detailed)
- `votes`: Jury voting records
- `awards`: Prize and reward definitions
- `events`: Festival event schedules

### Query Patterns

**Parameterized Queries** (ALWAYS use for security):
```javascript
// GOOD: Parameterized
const [rows] = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);

// BAD: String concatenation (vulnerable to SQL injection)
const [rows] = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

**Common Operations:**
```javascript
// Find user by email
const [rows] = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);

// Get user roles
const [roleRows] = await db.query(
  'SELECT role_id FROM user_roles WHERE user_id = ?',
  [userId]
);

// Insert new user (returns insertId)
const [result] = await db.query(
  'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
  [name, email, hashedPassword]
);

// Dynamic UPDATE
const fields = ['name = ?', 'bio = ?'];
const values = [name, bio, userId];
await db.query(
  `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
  values
);
```

**Connection Pool Configuration** (back-end/src/config/database.js):
```javascript
export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
```

---

## Styling & Design System

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Dark | `#262335` | Buttons, headers, dark backgrounds |
| Primary Light | `#FBF5F0` | Page backgrounds, light sections |
| Accent Purple | `#463699` | Hover states, accents |

**Usage Examples:**
```javascript
// Inline styles (when Tailwind doesn't support exact color)
style={{
  backgroundColor: '#262335',
  color: '#FBF5F0'
}}

// Tailwind arbitrary values
className="bg-[#262335] text-white hover:bg-[#322e47]"
```

### Tailwind Configuration

**Content Sources** (tailwind.config.js):
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},  // Custom theme extensions go here
  },
  plugins: [],
}
```

**Responsive Breakpoints:**
```javascript
// Mobile-first approach
className="flex"           // All screens
className="md:flex"        // ≥768px (tablets+)
className="lg:flex"        // ≥1024px (desktop)
className="xl:flex"        // ≥1280px (large desktop)

// Example: Hide on mobile, show on desktop
className="hidden md:flex"
```

### Component Styling Patterns

**Button Component** (Front-end/src/components/Button.jsx):
```javascript
<button
  className="px-4 py-2 rounded-lg transition-colors duration-200
             disabled:opacity-50 disabled:cursor-not-allowed"
  style={{
    backgroundColor: '#262335',
    color: 'white'
  }}
>
  {children}
</button>
```

**Input Component** (Front-end/src/components/Input.jsx):
```javascript
<input
  className="w-full px-4 py-2 border rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-500"
  type={type}
  placeholder={placeholder}
/>
```

**Modal Component** (Front-end/src/components/Modal.jsx):
```javascript
<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm
                flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-md w-full">
    {/* Modal content */}
  </div>
</div>
```

### Layout Patterns

**Header Navigation:**
```javascript
// Desktop navigation
<nav className="hidden md:flex space-x-6">
  <Link to="/about">About</Link>
  <Link to="/catalogs">Catalogs</Link>
</nav>

// Mobile menu toggle
<button className="md:hidden" onClick={toggleMenu}>
  <FaBars />
</button>
```

**Footer Layout:**
```javascript
// Multi-column responsive layout
<footer className="bg-[#262335] text-white">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Column 1 */}
      {/* Column 2 */}
      {/* Column 3 */}
      {/* Column 4 */}
    </div>
  </div>
</footer>
```

### Icon Usage

**React Icons** (Font Awesome 6):
```javascript
import { FaBars, FaTimes, FaArrowUp, FaFacebook } from 'react-icons/fa';

<FaBars className="text-2xl" />
<FaTimes className="text-xl text-gray-500" />
```

---

## Authentication & Authorization

### Password Security

**Hashing with bcryptjs:**
```javascript
import bcrypt from 'bcryptjs';

// Hash password (salt rounds = 10)
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isMatch = await bcrypt.compare(password, hashedPassword);
```

**NEVER store plain-text passwords.** All passwords are hashed before database insertion.

### JWT Implementation

**Token Generation** (back-end/src/controllers/auth.controller.js):
```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    roles: user.roles  // Array of role IDs
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Token Validation** (back-end/src/middleware/auth.middleware.js):
```javascript
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach to request
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};
```

### Role Authorization

**Authorize Middleware** (back-end/src/middleware/authorize.middleware.js):
```javascript
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];

    const hasPermission = allowedRoles.some(role =>
      userRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé: permissions insuffisantes'
      });
    }

    next();
  };
};
```

**Usage in Routes:**
```javascript
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

// Public route
router.post('/register', register);

// Protected route (any authenticated user)
router.get('/profile', authenticateToken, getProfile);

// Role-specific route (Directors and Admins only)
router.get(
  '/director/access',
  authenticateToken,
  authorize([1, 3]),  // Roles 1 and 3
  directorAccess
);

// Admin-only route
router.get(
  '/admin/users',
  authenticateToken,
  authorize([3]),  // Role 3 only
  getAllUsers
);
```

### Frontend Token Storage

**Current Implementation**: Token should be stored in localStorage or sessionStorage

**Example Usage:**
```javascript
// After login success
const { token } = response.data.data;
localStorage.setItem('token', token);

// For API requests
const token = localStorage.getItem('token');
fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// On logout
localStorage.removeItem('token');
```

**Security Note**: Consider HttpOnly cookies for enhanced security in production.

---

## Key Conventions

### Naming Conventions

**Files:**
- React components: `PascalCase.jsx` (e.g., `Login.jsx`, `ProfileDirector.jsx`)
- Utilities/modules: `camelCase.js` (e.g., `auth.controller.js`, `database.js`)
- Configuration: `lowercase.config.js` (e.g., `vite.config.js`, `tailwind.config.js`)

**Variables & Functions:**
- JavaScript: `camelCase` (e.g., `userName`, `getUserById`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`, `DB_HOST`)
- React components: `PascalCase` (e.g., `Header`, `Modal`)

**Routes & URLs:**
- Frontend: `kebab-case` (e.g., `/profile-director`, `/details-film`)
- Backend: `kebab-case` (e.g., `/api/auth/register`, `/api/admin/users`)

**Database:**
- Tables: `snake_case` (e.g., `users`, `user_roles`)
- Columns: `snake_case` (e.g., `created_at`, `user_id`, `role_id`)

### Code Organization

**Frontend Component Structure:**
```javascript
// 1. Imports
import { useState } from 'react';
import { Link } from 'react-router-dom';

// 2. Component definition
export default function ComponentName({ prop1, prop2 }) {
  // 3. State declarations
  const [state, setState] = useState(initialValue);

  // 4. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 5. Render logic
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Backend Route Module Structure:**
```javascript
// 1. Imports
import express from 'express';
import { controller1, controller2 } from '../controllers/controller.js';
import { middleware1 } from '../middleware/middleware.js';

// 2. Router creation
const router = express.Router();

// 3. Middleware application
router.use(middleware1);

// 4. Route definitions
router.get('/endpoint', controller1);
router.post('/endpoint', controller2);

// 5. Export
export default router;
```

### Import/Export Patterns

**ES Modules** (used throughout):
```javascript
// Named exports
export const functionName = () => {};
export const anotherFunction = () => {};

// Default export
export default ComponentName;

// Importing
import defaultExport from './module.js';
import { namedExport1, namedExport2 } from './module.js';
```

**ALWAYS include `.js` extension** in backend imports:
```javascript
// GOOD
import { User } from '../models/User.js';

// BAD (will fail in ES modules)
import { User } from '../models/User';
```

### Error Handling

**Backend Standard:**
```javascript
try {
  // Operation
  return res.status(200).json({
    success: true,
    data: result
  });
} catch (error) {
  console.error('Operation failed:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}
```

**Frontend Standard:**
```javascript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    throw new Error('Request failed');
  }
  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Handle error (show message to user)
}
```

### Response Formats

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response payload
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field error message"
    }
  ]
}
```

---

## Common Tasks

### Adding a New Page

**1. Create page component:**
```bash
# Create file
touch Front-end/src/pages/NewPage.jsx
```

```javascript
// Front-end/src/pages/NewPage.jsx
export default function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">New Page</h1>
    </div>
  );
}
```

**2. Add route in App.jsx:**
```javascript
import NewPage from './pages/NewPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // ... existing routes
      { path: 'new-page', element: <NewPage /> }
    ]
  }
]);
```

**3. Add navigation link (if needed):**
```javascript
// Front-end/src/components/Header.jsx
<Link to="/new-page">New Page</Link>
```

### Adding a New API Endpoint

**1. Create controller function:**
```javascript
// back-end/src/controllers/feature.controller.js
export const getFeature = async (req, res) => {
  try {
    // Logic here
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
```

**2. Create or update route module:**
```javascript
// back-end/src/routes/feature.routes.js
import express from 'express';
import { getFeature } from '../controllers/feature.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/feature', authenticateToken, getFeature);

export default router;
```

**3. Register routes in index.js:**
```javascript
// back-end/src/index.js
import featureRoutes from './routes/feature.routes.js';

app.use('/api/feature', featureRoutes);
```

### Adding a New Database Model

**1. Create model file:**
```javascript
// back-end/src/models/Feature.js
import db from '../db.js';

export const create = async (data) => {
  const [result] = await db.query(
    'INSERT INTO features (field1, field2) VALUES (?, ?)',
    [data.field1, data.field2]
  );
  return result.insertId;
};

export const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM features WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const update = async (id, data) => {
  await db.query(
    'UPDATE features SET field1 = ?, field2 = ? WHERE id = ?',
    [data.field1, data.field2, id]
  );
};

export const remove = async (id) => {
  await db.query('DELETE FROM features WHERE id = ?', [id]);
};
```

**2. Create database table:**
```sql
-- Add to BDD/marsai.sql
CREATE TABLE features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  field1 VARCHAR(255) NOT NULL,
  field2 TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**3. Update database:**
```bash
mysql -u root -p marsai < BDD/marsai.sql
```

### Adding a Reusable Component

**1. Create component:**
```javascript
// Front-end/src/components/Card.jsx
export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {children}
    </div>
  );
}
```

**2. Use component:**
```javascript
import Card from '../components/Card';

<Card title="Feature Title">
  <p>Content goes here</p>
</Card>
```

### Adding Input Validation

**Backend (express-validator):**
```javascript
import { body, validationResult } from 'express-validator';

// Validation rules
export const validateFeature = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').optional().isInt({ min: 0, max: 120 })
];

// In controller
export const createFeature = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  // Proceed with validated data
};

// In route
router.post('/feature', validateFeature, createFeature);
```

**Frontend (basic):**
```javascript
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};

  if (!email.includes('@')) {
    newErrors.email = 'Invalid email format';
  }

  if (password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    // Submit form
  }
};
```

---

## Testing

### Current State

**Testing Infrastructure**: Minimal/Not implemented

**Root package.json:**
```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

**No testing frameworks installed:**
- No Jest
- No Vitest
- No React Testing Library
- No Supertest

### Recommended Testing Setup

**For Frontend (Vitest + React Testing Library):**
```bash
cd Front-end
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**For Backend (Jest + Supertest):**
```bash
cd back-end
npm install -D jest supertest
```

### Testing Gaps to Address

1. **Unit Tests**: Controller functions, utility functions
2. **Integration Tests**: API endpoints with database
3. **Component Tests**: React components
4. **E2E Tests**: User flows (login, registration, navigation)

**Example Test Structure (if implementing):**
```
Front-end/
  src/
    __tests__/
      components/
        Button.test.jsx
        Header.test.jsx
      pages/
        Login.test.jsx

back-end/
  src/
    __tests__/
      controllers/
        auth.controller.test.js
      routes/
        auth.routes.test.js
```

---

## Deployment

### Production Build

**Frontend (Nginx):**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build command:**
```bash
cd Front-end
docker build -t marsai-frontend .
```

**Backend (Node.js):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/index.js"]
```

**Build command:**
```bash
cd back-end
docker build -t marsai-backend .
```

### Environment Variables

**Backend (.env):**
```env
# Server Configuration
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=marsai_user
DB_PASSWORD=secure_password_here
DB_NAME=marsai
```

**CRITICAL**: Always change `JWT_SECRET` in production to a strong, unique secret.

### Docker Compose (Production)

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: marsai
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./back-end
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    ports:
      - "5000:5000"

  frontend:
    build: ./Front-end
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  mysql_data:
```

### Deployment Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `CORS_ORIGIN` to specific frontend domain
- [ ] Use strong database passwords
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable rate limiting for API endpoints
- [ ] Review and harden security headers
- [ ] Set up CI/CD pipeline
- [ ] Configure environment-specific configs
- [ ] Test all endpoints in production environment

---

## Important Files

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `package.json` | Root, Front-end, back-end | Dependencies and scripts |
| `vite.config.js` | Front-end | Vite build configuration |
| `tailwind.config.js` | Front-end | Tailwind CSS configuration |
| `postcss.config.js` | Front-end | PostCSS + Autoprefixer |
| `eslint.config.js` | Front-end | ESLint linting rules |
| `.env` | back-end | Environment variables (git-ignored) |
| `.env.example` | back-end | Environment template |
| `docker-compose.yml` | Root | Local development orchestration |
| `Dockerfile` | Front-end, back-end | Production build instructions |
| `Dockerfile.dev` | Front-end | Development container |
| `.gitignore` | Root | Git ignore patterns |

### Entry Points

| File | Location | Purpose |
|------|----------|---------|
| `index.html` | Front-end | HTML template |
| `main.jsx` | Front-end/src | React entry point |
| `App.jsx` | Front-end/src | Main app component with routing |
| `index.js` | back-end/src | Express server entry point |
| `db.js` | back-end/src | MySQL connection pool |

### Key Source Files

| File | Location | Purpose |
|------|----------|---------|
| `RootLayout.jsx` | Front-end/src/layouts | Page wrapper with Header/Footer |
| `Header.jsx` | Front-end/src/components | Navigation component |
| `Footer.jsx` | Front-end/src/components | Footer component |
| `Login.jsx` | Front-end/src/pages | Login page |
| `Register.jsx` | Front-end/src/pages | Registration page |
| `auth.controller.js` | back-end/src/controllers | Auth logic (register, login) |
| `auth.middleware.js` | back-end/src/middleware | JWT validation |
| `authorize.middleware.js` | back-end/src/middleware | Role checking |
| `User.js` | back-end/src/models | User database operations |
| `database.js` | back-end/src/config | DB pool configuration |

### Database Files

| File | Location | Purpose |
|------|----------|---------|
| `marsai.sql` | BDD | MySQL schema (git-ignored) |

**Note**: Database schema is NOT version-controlled. When working with AI, may need to describe schema or request it.

---

## Gotchas & Best Practices

### Common Pitfalls

#### 1. Missing `.js` Extension in Backend Imports
```javascript
// ❌ WRONG (fails in ES modules)
import { User } from '../models/User';

// ✅ CORRECT
import { User } from '../models/User.js';
```

#### 2. SQL Injection Vulnerabilities
```javascript
// ❌ WRONG (vulnerable to SQL injection)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ CORRECT (parameterized query)
const [rows] = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

#### 3. Hardcoded Custom Colors
```javascript
// ⚠️ ISSUE: Custom colors not in Tailwind config
// Must use inline styles or arbitrary values

// Option 1: Inline styles
style={{ backgroundColor: '#262335' }}

// Option 2: Tailwind arbitrary values
className="bg-[#262335]"

// Better: Add to tailwind.config.js theme
theme: {
  extend: {
    colors: {
      'mars-dark': '#262335',
      'mars-light': '#FBF5F0',
      'mars-purple': '#463699'
    }
  }
}
// Then use: className="bg-mars-dark"
```

#### 4. CORS Issues in Development
```javascript
// Backend must set CORS_ORIGIN correctly
// For local dev: CORS_ORIGIN=http://localhost:5173
// For production: CORS_ORIGIN=https://your-domain.com
```

#### 5. JWT Token Expiration
```javascript
// Tokens expire after 24 hours
// Always handle 401/403 errors and redirect to login
if (error.status === 401 || error.status === 403) {
  localStorage.removeItem('token');
  navigate('/login');
}
```

#### 6. Database Connection Pool Limits
```javascript
// Max 10 concurrent connections
// Long-running queries can exhaust pool
// Always close/release connections properly
```

### Best Practices

#### Frontend

**1. Use Layout Component:**
```javascript
// ✅ GOOD: Consistent layout
<RootLayout>
  <YourPage />
</RootLayout>

// ❌ BAD: Inconsistent, duplicated Header/Footer
<>
  <Header />
  <YourPage />
  <Footer />
</>
```

**2. Responsive Design First:**
```javascript
// ✅ Mobile-first approach
className="flex flex-col md:flex-row"

// ❌ Desktop-first (less maintainable)
className="flex-row sm:flex-col"
```

**3. Reuse Components:**
```javascript
// ✅ GOOD: Reusable Button component
<Button onClick={handleClick}>Submit</Button>

// ❌ BAD: Inline button with duplicate styling
<button
  className="px-4 py-2 bg-[#262335] text-white rounded-lg"
  onClick={handleClick}
>
  Submit
</button>
```

**4. Handle Loading & Error States:**
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{/* Content */}</div>;
```

#### Backend

**1. Always Use Try-Catch:**
```javascript
// ✅ GOOD
export const handler = async (req, res) => {
  try {
    // Logic
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Error' });
  }
};
```

**2. Validate Input:**
```javascript
// ✅ GOOD: Validation middleware
router.post('/endpoint', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], controller);

// Inside controller
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ success: false, errors: errors.array() });
}
```

**3. Use Middleware for Cross-Cutting Concerns:**
```javascript
// ✅ GOOD: Centralized auth/authorization
router.use(authenticateToken);
router.use(authorize([1, 3]));
router.get('/endpoint', controller);

// ❌ BAD: Duplicate auth logic in every controller
export const controller = async (req, res) => {
  // Checking token, roles, etc. in every function
};
```

**4. Consistent Response Format:**
```javascript
// ✅ GOOD: Standard format
return res.status(200).json({
  success: true,
  data: result
});

// ❌ BAD: Inconsistent
return res.json(result);  // No status, no success flag
```

**5. Log Errors with Context:**
```javascript
// ✅ GOOD
console.error('Failed to fetch user:', error, { userId: req.params.id });

// ❌ BAD
console.error(error);  // No context
```

#### Database

**1. Use Connection Pool:**
```javascript
// ✅ GOOD: Reuse pool connection
import db from '../db.js';
const [rows] = await db.query('SELECT * FROM users');

// ❌ BAD: Creating new connection every time
const connection = await mysql.createConnection(config);
```

**2. Always Parameterize Queries:**
```javascript
// ✅ GOOD
await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ BAD: SQL injection risk
await db.query(`SELECT * FROM users WHERE id = ${userId}`);
```

**3. Handle NULL Values:**
```javascript
// Database columns can be NULL (bio, country, school)
// Always check before using
if (user.bio) {
  // Use bio
}
```

#### Security

**1. Never Commit Secrets:**
```bash
# ✅ GOOD: Use .env (git-ignored)
JWT_SECRET=your-secret-key

# ❌ BAD: Hardcoded in source
const JWT_SECRET = 'my-secret-123';
```

**2. Hash Passwords:**
```javascript
// ✅ GOOD: bcrypt with salt
const hashed = await bcrypt.hash(password, 10);

// ❌ BAD: Plain text or weak hashing
const hashed = btoa(password);  // Not secure!
```

**3. Validate JWT on Every Protected Route:**
```javascript
// ✅ GOOD: Middleware validates token
router.use(authenticateToken);
router.get('/endpoint', controller);

// ❌ BAD: Trusting client-provided data
const userId = req.body.userId;  // Could be forged!
```

**4. Use HTTPS in Production:**
```javascript
// Always enforce HTTPS for sensitive data
// Configure Nginx/load balancer to redirect HTTP → HTTPS
```

#### Development Workflow

**1. Use Docker Compose for Local Dev:**
```bash
# ✅ GOOD: Consistent environment
docker-compose up

# ❌ Less ideal: Manual setup on each machine
npm install && mysql start && ...
```

**2. Check Environment Variables:**
```javascript
// ✅ GOOD: Validate required env vars on startup
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
```

**3. Use Meaningful Commit Messages:**
```bash
# ✅ GOOD
feat(auth): add password reset functionality
fix(login): resolve token expiration handling

# ❌ BAD
fixed stuff
update
wip
```

**4. Test Locally Before Committing:**
```bash
# Always run and verify:
npm run lint     # Check code quality
npm run build    # Ensure build succeeds
# Manual testing of changed functionality
```

---

## Quick Reference Commands

### Development
```bash
# Start all services
docker-compose up

# Frontend dev server
cd Front-end && npm run dev

# Backend dev server
cd back-end && npm run dev

# Build frontend
cd Front-end && npm run build

# Lint frontend
cd Front-end && npm run lint
```

### Database
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE marsai;

# Import schema
mysql -u root -p marsai < BDD/marsai.sql

# Show tables
SHOW TABLES;

# Describe table
DESCRIBE users;
```

### Docker
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Git
```bash
# Create feature branch
git checkout -b feat/feature-name

# Stage changes
git add .

# Commit with message
git commit -m "feat(scope): description"

# Push to remote
git push -u origin feat/feature-name

# Pull latest changes
git pull origin main
```

---

## Additional Resources

### Documentation Links

- **React**: https://react.dev/
- **React Router**: https://reactrouter.com/
- **Vite**: https://vite.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Express**: https://expressjs.com/
- **MySQL2**: https://sidorares.github.io/node-mysql2/docs
- **JWT**: https://jwt.io/
- **bcryptjs**: https://github.com/dcodeIO/bcrypt.js
- **express-validator**: https://express-validator.github.io/

### Related Files

- `/README.md` - Basic project overview
- `/Front-end/README.md` - Vite + React template info
- `/back-end/README.md` - API documentation (French)
- `/back-end/.env.example` - Environment variable template
- `/docker-compose.yml` - Local development setup

---

## Notes for AI Assistants

### When Making Changes

1. **Read First**: Always read files before modifying them
2. **Preserve Patterns**: Follow existing code patterns and conventions
3. **Test Thoroughly**: Verify changes work in both dev and production contexts
4. **Update Related Files**: Don't forget to update routes, imports, etc.
5. **Security First**: Never introduce vulnerabilities (SQL injection, XSS, etc.)
6. **Document Changes**: Update this file if adding major new patterns

### When Adding Features

1. **Check Existing**: Look for similar implementations first
2. **Reuse Components**: Use existing Button, Input, Modal components
3. **Follow RBAC**: Apply appropriate role restrictions
4. **Validate Input**: Always validate on both frontend and backend
5. **Handle Errors**: Implement proper error handling and user feedback
6. **Consider Mobile**: Ensure responsive design with Tailwind breakpoints

### When Debugging

1. **Check Logs**: Look at console.error outputs and Docker logs
2. **Verify Environment**: Ensure .env is configured correctly
3. **Test API**: Use health endpoint to verify backend is running
4. **Check Database**: Verify MySQL connection and schema
5. **Review Network**: Check browser DevTools Network tab for API errors
6. **Token Issues**: Verify JWT is being sent in Authorization header

### Project Status Notes

**Current State** (as of 2026-01-23):
- Most frontend pages are placeholders (except Login/Register)
- Testing infrastructure is minimal (should be added)
- Database schema exists but is not version-controlled
- Role system is implemented but film submission features are not
- Authentication works but may need frontend token management improvements

**Areas for Improvement:**
1. Add comprehensive testing (Jest/Vitest)
2. Implement remaining pages (Catalogs, Submissions, Prize List, etc.)
3. Add film submission and voting features
4. Improve frontend state management (Context API or Zustand)
5. Add proper error boundaries in React
6. Implement loading states and better UX feedback
7. Add custom color palette to Tailwind config
8. Set up CI/CD pipeline
9. Add API rate limiting
10. Implement refresh tokens for better security

---

**End of CLAUDE.md**

This document should be updated whenever significant architectural changes, new patterns, or important conventions are introduced to the codebase.
