# RBAC Implementation Guide

## Overview

This backend implements Role-Based Access Control (RBAC) to secure all API endpoints. The implementation ensures that only authorized users can perform specific actions based on their assigned roles.

## Table of Contents

1. [Role Structure](#role-structure)
2. [Setup Instructions](#setup-instructions)
3. [How It Works](#how-it-works)
4. [Testing RBAC](#testing-rbac)
5. [Troubleshooting](#troubleshooting)

## Role Structure

### Roles and IDs

- **SuperAdmin** (ID: 32562) - Full system access
- **Admin** (ID: 92781) - Standard administrative access (cannot manage other admins)
- **Staff** (ID: 3) - Read-only access

### Permission Matrix

| Permission                       | SuperAdmin | Admin | Staff |
| -------------------------------- | ---------- | ----- | ----- |
| **User Management**              |
| View Users                       | ✓          | ✓     | ✓     |
| Create Users                     | ✓          | ✓     | ✗     |
| Edit Users                       | ✓          | ✓     | ✗     |
| Delete Users                     | ✓          | ✓     | ✗     |
| **Records Management**           |
| View Records                     | ✓          | ✓     | ✓     |
| Create Records                   | ✓          | ✓     | ✗     |
| Edit Records                     | ✓          | ✓     | ✗     |
| Delete Records                   | ✓          | ✓     | ✗     |
| **Content Management**           |
| View Content                     | ✓          | ✓     | ✓     |
| Edit Content                     | ✓          | ✓     | ✗     |
| Delete Content                   | ✓          | ✓     | ✗     |
| **News/Guidelines/Achievements** |
| View                             | ✓          | ✓     | ✓     |
| Manage                           | ✓          | ✓     | ✗     |
| **Inventory Management**         |
| View Inventory                   | ✓          | ✓     | ✓     |
| Manage Inventory                 | ✓          | ✓     | ✗     |
| **Activity Logs**                |
| View Activity Logs               | ✓          | ✓     | ✓     |
| Export Data                      | ✓          | ✓     | ✗     |
| **Admin Management**             |
| Manage Admins                    | ✓          | ✗     | ✗     |

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Critical Settings:**

```env
# JWT Secrets (use strong random strings)
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

# Role IDs (MUST match frontend exactly)
SUPERADMIN_ROLE_ID=32562
ADMIN_ROLE_ID=92781
STAFF_ROLE_ID=3
```

⚠️ **IMPORTANT**: Role IDs must be identical on both frontend and backend!

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Server

```bash
npm start
```

## How It Works

### Authentication Flow

1. **User Login**

   ```
   POST /auth/login
   Body: { username, password }
   ```

   - Validates credentials
   - Generates JWT with role IDs
   - Returns access token + user data with roles

2. **Token Structure**

   ```json
   {
     "userInfo": {
       "_id": "user_id",
       "username": "johndoe",
       "roles": [32562]
     }
   }
   ```

3. **Request with Authentication**
   ```
   GET /api/users
   Headers: Authorization: Bearer <access_token>
   ```

### Authorization Flow

1. **JWT Verification** (`verifyJWT` middleware)

   - Extracts token from `Authorization` header
   - Verifies token signature
   - Fetches full user object from database (includes roles)
   - Attaches `req.user` to request

2. **Permission Check** (`checkPermission` middleware)
   - Extracts user's role from `req.user.roles`
   - Looks up permissions for that role
   - Checks if required permission is in role's permissions
   - Returns 403 if unauthorized, proceeds if authorized

### Middleware Usage

#### Basic Permission Check

```javascript
router.get(
  "/users",
  verifyJWT,
  checkPermission(Permission.VIEW_USERS),
  getAllUsers
);
```

#### SuperAdmin Only

```javascript
router.post("/auth/signup", verifyJWT, requireSuperAdmin, handleCreateAccount);
```

#### Any of Multiple Permissions

```javascript
router.get(
  "/data",
  verifyJWT,
  checkAnyPermission([Permission.VIEW_USERS, Permission.VIEW_RECORDS]),
  getData
);
```

### File Structure

```
middlewares/
├── permissions.js          # Permission definitions and role mappings
├── rbac.utils.js          # Role checking utility functions
├── checkPermission.js     # Permission middleware
└── verifyJWT.js           # JWT authentication middleware

routes/
├── auth.js                # Authentication routes
└── api/
    ├── userRoute.js       # User management (with RBAC)
    ├── recordRoute.js     # Records management (with RBAC)
    ├── newsRoute.js       # News management (with RBAC)
    └── ...                # All routes secured with RBAC
```

## Testing RBAC

### 1. Create Test Users

**SuperAdmin:**

```javascript
{
  username: "superadmin",
  email: "super@example.com",
  password: "password123",
  roles: {
    SuperAdmin: 32562
  }
}
```

**Admin:**

```javascript
{
  username: "admin",
  email: "admin@example.com",
  password: "password123",
  roles: {
    Admin: 92781
  }
}
```

**Staff:**

```javascript
{
  username: "staff",
  email: "staff@example.com",
  password: "password123",
  roles: {
    Staff: 3
  }
}
```

### 2. Test Scenarios

#### Test 1: SuperAdmin Access

```bash
# Login as SuperAdmin
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password123"}'

# Should succeed - Create user
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"pass123",...}'

# Should succeed - Delete record
curl -X DELETE http://localhost:5000/api/records/123 \
  -H "Authorization: Bearer <token>"
```

#### Test 2: Admin Access

```bash
# Login as Admin
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Should succeed - View users
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>"

# Should fail (403) - Create admin account
curl -X POST http://localhost:5000/auth/signup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newadmin",...}'
```

#### Test 3: Staff Access

```bash
# Login as Staff
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"staff","password":"password123"}'

# Should succeed - View records
curl -X GET http://localhost:5000/api/records \
  -H "Authorization: Bearer <token>"

# Should fail (403) - Create record
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Record",...}'

# Should fail (403) - Delete user
curl -X DELETE http://localhost:5000/api/users/123 \
  -H "Authorization: Bearer <token>"
```

### Expected Responses

**Success (200/201):**

```json
{
  "success": true,
  "data": {...}
}
```

**Unauthorized (401):**

```json
{
  "success": false,
  "message": "Access token required"
}
```

**Forbidden (403):**

```json
{
  "success": false,
  "message": "Insufficient permissions",
  "required": "delete_users"
}
```

## Troubleshooting

### Issue: "Authentication required" (401)

**Cause:** Missing or invalid JWT token

**Solutions:**

1. Check if `Authorization` header is present
2. Verify token format: `Bearer <token>`
3. Check if token has expired
4. Verify `ACCESS_TOKEN_SECRET` matches

### Issue: "Insufficient permissions" (403)

**Cause:** User doesn't have required permission

**Solutions:**

1. Verify user's role in database
2. Check role IDs match environment variables
3. Review permission mappings in `permissions.js`
4. Ensure user has correct role assigned

### Issue: "User not found" (401)

**Cause:** JWT contains valid signature but user doesn't exist

**Solutions:**

1. User may have been deleted
2. Database connection issue
3. User ID in token doesn't match database

### Issue: Role IDs Mismatch

**Symptoms:**

- User can login but has no permissions
- All requests return 403

**Solution:**

1. Check `.env` file for correct role IDs:
   ```env
   SUPERADMIN_ROLE_ID=32562
   ADMIN_ROLE_ID=92781
   STAFF_ROLE_ID=3
   ```
2. Verify user's `roles` object in database
3. Ensure frontend uses same role IDs

### Issue: JWT Verification Fails

**Symptoms:**

- All requests return 403
- Token appears valid

**Solution:**

1. Check `ACCESS_TOKEN_SECRET` in `.env`
2. Restart server after changing `.env`
3. Clear old tokens and re-login
4. Verify token hasn't expired

### Debug Logging

Enable debug logs to troubleshoot:

```javascript
// In checkPermission.js, logs are already enabled:
console.warn("[RBAC] Permission denied:", {
  user: req.user.username,
  permission,
  endpoint: req.path,
  method: req.method,
});
```

Check server logs for:

- `[RBAC] Permission denied:` - Permission check failures
- `[Auth] JWT verification failed:` - Token validation errors

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` to version control
- Use different secrets for development/production
- Rotate secrets regularly

### 2. Token Management

- Short expiry for access tokens (24h)
- Longer expiry for refresh tokens (7d)
- Implement token blacklisting for logout

### 3. Password Security

- Use bcrypt with salt rounds ≥ 10
- Enforce strong password policies
- Implement rate limiting on login

### 4. HTTPS

- Always use HTTPS in production
- Set `secure: true` for cookies
- Enable HSTS headers

### 5. Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  message: "Too many login attempts",
});

router.post("/auth/login", authLimiter, handleLogin);
```

### 6. Audit Logging

All RBAC denials are logged automatically:

```javascript
console.warn("[RBAC] Permission denied:", {
  user: req.user.username,
  permission,
  endpoint: req.path,
  timestamp: new Date().toISOString(),
});
```

Review these logs regularly for:

- Repeated permission denials (potential attacks)
- Unusual access patterns
- Role escalation attempts

## Migration from Old System

If migrating from `verifyRoles` to permission-based RBAC:

### Before (Role-based):

```javascript
router.get("/users", verifyJWT, verifyRoles(ROLES.SuperAdmin), getAllUsers);
```

### After (Permission-based):

```javascript
router.get(
  "/users",
  verifyJWT,
  checkPermission(Permission.VIEW_USERS),
  getAllUsers
);
```

**Benefits:**

- More granular control
- Easier to add new roles
- Permission inheritance
- Frontend/backend sync

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review server logs for `[RBAC]` and `[Auth]` messages
3. Verify environment variables are set correctly
4. Ensure database connection is working
5. Test with Postman/curl to isolate frontend issues

---

**Last Updated:** November 5, 2025
**Version:** 1.0.0
