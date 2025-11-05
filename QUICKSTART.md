# RBAC Quick Start Guide

## ✅ Implementation Complete!

Your backend now has comprehensive Role-Based Access Control (RBAC) protecting all API endpoints.

## 🚀 Getting Started

### Step 1: Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set these critical values:

   ```env
   # JWT Secrets - Generate strong random strings
   ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

   # Role IDs - MUST match frontend exactly
   SUPERADMIN_ROLE_ID=32562
   ADMIN_ROLE_ID=92781
   STAFF_ROLE_ID=3
   ```

   ⚠️ **CRITICAL**: The role IDs must be identical on both frontend and backend!

### Step 2: Install Dependencies (if needed)

```bash
npm install
```

### Step 3: Start the Server

```bash
npm start
```

## 📋 What Changed

### ✅ New Middleware Files

- `middlewares/permissions.js` - Permission definitions
- `middlewares/rbac.utils.js` - Role checking utilities
- `middlewares/checkPermission.js` - Permission validation middleware

### ✅ Updated Files

- `middlewares/verifyJWT.js` - Now fetches full user with roles
- `controller/authController.js` - JWT includes role IDs, returns user data with roles
- `routes/auth.js` - Signup now requires SuperAdmin
- All route files in `routes/api/` - Protected with permission checks

### ✅ Documentation

- `RBAC_IMPLEMENTATION.md` - Complete implementation guide
- `.env.example` - Environment variable template
- `QUICKSTART.md` - This file

## 🔐 How It Works

### 1. User Login

```javascript
POST /auth/login
Body: { username, password }

Response:
{
  userData: {
    username: "johndoe",
    email: "john@example.com",
    roles: { SuperAdmin: 32562 },
    rolesKeys: ["SuperAdmin"]
  },
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Authenticated Request

```javascript
GET / api / users;
Headers: {
  Authorization: "Bearer <accessToken>";
}

// Middleware chain:
// 1. verifyJWT - Validates token, fetches user with roles
// 2. checkPermission(Permission.VIEW_USERS) - Checks if user has permission
// 3. getAllUsers - Executes if authorized
```

### 3. Permission Check

```javascript
// User's role determines permissions
SuperAdmin → All permissions
Admin → Management permissions (except admin management)
Staff → View-only permissions
```

## 🎯 Quick Test

### Test with cURL

1. **Login as SuperAdmin:**

   ```bash
   curl -X POST http://localhost:5000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"superadmin","password":"your-password"}'
   ```

2. **Use the token from response:**

   ```bash
   curl -X GET http://localhost:5000/api/users \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Expected Success Response:**

   ```json
   {
     "success": true,
     "data": [...]
   }
   ```

4. **Expected Permission Denied (if insufficient permissions):**
   ```json
   {
     "success": false,
     "message": "Insufficient permissions",
     "required": "view_users"
   }
   ```

## 📊 Permission Matrix

| Action           | SuperAdmin | Admin | Staff |
| ---------------- | ---------- | ----- | ----- |
| View Data        | ✓          | ✓     | ✓     |
| Create/Edit Data | ✓          | ✓     | ✗     |
| Delete Data      | ✓          | ✓     | ✗     |
| Manage Admins    | ✓          | ✗     | ✗     |

## 🔧 Common Issues

### Issue: "Authentication required" (401)

**Solution:** Include `Authorization: Bearer <token>` header in request

### Issue: "Insufficient permissions" (403)

**Solution:** User's role doesn't have required permission. Check user's roles in database.

### Issue: "Invalid or expired token" (403)

**Solution:** Token expired or invalid. Login again to get new token.

### Issue: Role IDs not working

**Solution:**

1. Check `.env` has correct role IDs: 32562, 92781, 3
2. Verify user document in database has matching role IDs
3. Restart server after changing `.env`

## 📝 Protected Routes

All routes now require authentication and appropriate permissions:

### User Management (`/api/users`)

- GET `/` - Requires `view_users`
- PUT `/:id` - Requires `edit_users`
- DELETE `/:id` - Requires `delete_users`

### Records (`/api/records`)

- GET `/` - Requires `view_records`
- POST `/` - Requires `create_records`
- PATCH `/:id` - Requires `edit_records`
- DELETE `/:id` - Requires `delete_records`

### News (`/api/news`)

- GET `/` - Requires `view_news`
- POST `/` - Requires `manage_news`
- PUT `/:id` - Requires `manage_news`
- DELETE `/:id` - Requires `manage_news`

### Admin Management (`/auth/signup`)

- POST `/signup` - Requires SuperAdmin (only SuperAdmin can create admins)

...and all other routes are similarly protected!

## 🎓 Next Steps

1. **Test Each Role:**

   - Create test users for SuperAdmin, Admin, and Staff
   - Login with each and test different endpoints
   - Verify permissions work as expected

2. **Update Frontend:**

   - Ensure frontend uses same role IDs (32562, 92781, 3)
   - Update API calls to include Authorization header
   - Handle 403 errors gracefully

3. **Review Logs:**

   - Check server logs for `[RBAC]` messages
   - Monitor for permission denials
   - Investigate any unusual patterns

4. **Security Hardening:**
   - Use strong JWT secrets in production
   - Enable HTTPS
   - Implement rate limiting
   - Set up monitoring

## 📚 More Information

For detailed information, see:

- `RBAC_IMPLEMENTATION.md` - Complete guide with testing, troubleshooting, and security best practices

## ✨ Summary

Your backend is now fully secured with RBAC! Every API endpoint checks permissions before allowing access. Users can only perform actions their role permits.

**Key Points:**

- ✅ All routes protected with permission checks
- ✅ JWT includes role information
- ✅ User roles determine available permissions
- ✅ Security logs track permission denials
- ✅ Frontend-backend role IDs synchronized

Happy coding! 🚀
