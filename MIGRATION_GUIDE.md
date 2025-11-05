# Migration Guide: Old Role System → RBAC Permissions

## Overview

This guide helps you understand the changes from the old `verifyRoles` system to the new permission-based RBAC system.

## What Changed?

### Before (Role-Based)

```javascript
const verifyRoles = require("../../middlewares/verifyRoles");
const ROLES = require("../../config/roles");

router.get(
  "/users",
  verifyJWT,
  verifyRoles(ROLES.SuperAdmin), // Only checks role
  getAllUsers
);
```

### After (Permission-Based)

```javascript
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

router.get(
  "/users",
  verifyJWT,
  checkPermission(Permission.VIEW_USERS), // Checks permission
  getAllUsers
);
```

## Key Differences

### 1. Granular Control

**Before:** Routes checked for specific roles
**After:** Routes check for specific permissions

**Why Better?**

- Admin and SuperAdmin can both view users (they both have `view_users` permission)
- Only SuperAdmin can manage other admins (only SuperAdmin has `manage_admins` permission)
- Easy to add new roles without changing route code

### 2. verifyJWT Behavior

**Before:**

```javascript
// Only set basic properties
request.userId = decoded.userInfo._id;
request.user = decoded.userInfo.username;
request.roles = decoded.userInfo.roles;
```

**After:**

```javascript
// Fetches and attaches full user object
const user = await User.findById(decoded.userInfo._id).select("-password");
request.user = user; // Full user object with roles

// Backward compatible - also keeps legacy properties
request.userId = decoded.userInfo._id;
request.username = decoded.userInfo.username;
request.roles = decoded.userInfo.roles;
```

### 3. Authentication Controller

**Before:**

```javascript
response.json({
  userData: {
    username: foundUser.username,
  },
  accessToken: accessToken,
});
```

**After:**

```javascript
response.json({
  userData: {
    username: foundUser.username,
    email: foundUser.email,
    roles: foundUser.roles, // Full roles object
    rolesKeys: foundUser.rolesKeys, // Array of role names
  },
  accessToken: accessToken,
});
```

## Migration Steps

### Step 1: Update Imports

**Old:**

```javascript
const verifyRoles = require("../../middlewares/verifyRoles");
const ROLES = require("../../config/roles");
```

**New:**

```javascript
const {
  checkPermission,
  requireSuperAdmin,
} = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");
```

### Step 2: Replace verifyRoles with checkPermission

**Pattern for View Operations:**

```javascript
// Old
router.get("/data", verifyJWT, verifyRoles(ROLES.SuperAdmin), getData);

// New
router.get("/data", verifyJWT, checkPermission(Permission.VIEW_DATA), getData);
```

**Pattern for Create Operations:**

```javascript
// Old
router.post("/data", verifyJWT, verifyRoles(ROLES.SuperAdmin), createData);

// New
router.post(
  "/data",
  verifyJWT,
  checkPermission(Permission.CREATE_DATA),
  createData
);
```

**Pattern for Update Operations:**

```javascript
// Old
router.put("/data/:id", verifyJWT, verifyRoles(ROLES.SuperAdmin), updateData);

// New
router.put(
  "/data/:id",
  verifyJWT,
  checkPermission(Permission.EDIT_DATA),
  updateData
);
```

**Pattern for Delete Operations:**

```javascript
// Old
router.delete(
  "/data/:id",
  verifyJWT,
  verifyRoles(ROLES.SuperAdmin),
  deleteData
);

// New
router.delete(
  "/data/:id",
  verifyJWT,
  checkPermission(Permission.DELETE_DATA),
  deleteData
);
```

**Pattern for SuperAdmin Only:**

```javascript
// Old
router.post(
  "/admin/action",
  verifyJWT,
  verifyRoles(ROLES.SuperAdmin),
  adminAction
);

// New
router.post("/admin/action", verifyJWT, requireSuperAdmin, adminAction);
```

### Step 3: Update Route Chaining

**Old Pattern (chained with .all()):**

```javascript
router
  .route("/")
  .all(verifyJWT, verifyRoles(ROLES.SuperAdmin))
  .get(getData)
  .post(createData);
```

**New Pattern (separate routes):**

```javascript
router.get("/", verifyJWT, checkPermission(Permission.VIEW_DATA), getData);

router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.CREATE_DATA),
  createData
);
```

**Why?** Different operations may require different permissions.

## Permission Mapping Reference

### User Management

| Old                                                  | New Permission                             |
| ---------------------------------------------------- | ------------------------------------------ |
| `verifyRoles(ROLES.SuperAdmin)` on GET /users        | `checkPermission(Permission.VIEW_USERS)`   |
| `verifyRoles(ROLES.SuperAdmin)` on POST /users       | `checkPermission(Permission.CREATE_USERS)` |
| `verifyRoles(ROLES.SuperAdmin)` on PUT /users/:id    | `checkPermission(Permission.EDIT_USERS)`   |
| `verifyRoles(ROLES.SuperAdmin)` on DELETE /users/:id | `checkPermission(Permission.DELETE_USERS)` |

### Records Management

| Old                                                    | New Permission                               |
| ------------------------------------------------------ | -------------------------------------------- |
| `verifyRoles(ROLES.SuperAdmin)` on GET /records        | `checkPermission(Permission.VIEW_RECORDS)`   |
| `verifyRoles(ROLES.SuperAdmin)` on POST /records       | `checkPermission(Permission.CREATE_RECORDS)` |
| `verifyRoles(ROLES.SuperAdmin)` on PATCH /records/:id  | `checkPermission(Permission.EDIT_RECORDS)`   |
| `verifyRoles(ROLES.SuperAdmin)` on DELETE /records/:id | `checkPermission(Permission.DELETE_RECORDS)` |

### Content Management

| Old                                                  | New Permission                               |
| ---------------------------------------------------- | -------------------------------------------- |
| `verifyRoles(ROLES.SuperAdmin)` on GET /content      | `checkPermission(Permission.VIEW_CONTENT)`   |
| `verifyRoles(ROLES.SuperAdmin)` on POST/PUT /content | `checkPermission(Permission.EDIT_CONTENT)`   |
| `verifyRoles(ROLES.SuperAdmin)` on DELETE /content   | `checkPermission(Permission.DELETE_CONTENT)` |

### News/Guidelines/Achievements

| Old                | New Permission                            |
| ------------------ | ----------------------------------------- |
| GET endpoints      | `checkPermission(Permission.VIEW_NEWS)`   |
| POST/PUT endpoints | `checkPermission(Permission.MANAGE_NEWS)` |
| DELETE endpoints   | `checkPermission(Permission.MANAGE_NEWS)` |

### Inventory Management

| Old                      | New Permission                                 |
| ------------------------ | ---------------------------------------------- |
| GET endpoints            | `checkPermission(Permission.VIEW_INVENTORY)`   |
| POST/PUT/PATCH endpoints | `checkPermission(Permission.MANAGE_INVENTORY)` |
| DELETE endpoints         | `checkPermission(Permission.MANAGE_INVENTORY)` |

### Farm Inventory

| Old                      | New Permission                                      |
| ------------------------ | --------------------------------------------------- |
| GET endpoints            | `checkPermission(Permission.VIEW_FARM_INVENTORY)`   |
| POST/PUT/PATCH endpoints | `checkPermission(Permission.MANAGE_FARM_INVENTORY)` |
| DELETE endpoints         | `checkPermission(Permission.MANAGE_FARM_INVENTORY)` |

### Green Pages (Farms/Establishments)

| Old                      | New Permission                                   |
| ------------------------ | ------------------------------------------------ |
| GET endpoints            | `checkPermission(Permission.VIEW_GREEN_PAGES)`   |
| POST/PUT/PATCH endpoints | `checkPermission(Permission.MANAGE_GREEN_PAGES)` |
| DELETE endpoints         | `checkPermission(Permission.MANAGE_GREEN_PAGES)` |

### Trading (Products)

| Old                      | New Permission                               |
| ------------------------ | -------------------------------------------- |
| GET endpoints            | `checkPermission(Permission.VIEW_TRADING)`   |
| POST/PUT/PATCH endpoints | `checkPermission(Permission.MANAGE_TRADING)` |
| DELETE endpoints         | `checkPermission(Permission.MANAGE_TRADING)` |

### Activity Logs

| Old              | New Permission                                   |
| ---------------- | ------------------------------------------------ |
| GET /logs        | `checkPermission(Permission.VIEW_ACTIVITY_LOGS)` |
| GET /logs/export | `checkPermission(Permission.EXPORT_DATA)`        |

### Admin Management

| Old                                             | New                 |
| ----------------------------------------------- | ------------------- |
| `verifyRoles(ROLES.SuperAdmin)` on /auth/signup | `requireSuperAdmin` |

## Complete Examples

### Example 1: News Routes

**Before:**

```javascript
const express = require("express");
const {
  getAllNews,
  postNews,
  updateNews,
  deleteNews,
} = require("../../controller/newsController");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router
  .route("")
  .get(getAllNews)
  .post(verifyJWT, verifyRoles(roles.SuperAdmin), postNews);

router
  .route("/:id")
  .put(verifyJWT, verifyRoles(roles.SuperAdmin), updateNews)
  .delete(verifyJWT, verifyRoles(roles.SuperAdmin), deleteNews);

module.exports = router;
```

**After:**

```javascript
const express = require("express");
const {
  getAllNews,
  postNews,
  updateNews,
  deleteNews,
} = require("../../controller/newsController");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Get all news - VIEW_NEWS permission required
router.get("/", verifyJWT, checkPermission(Permission.VIEW_NEWS), getAllNews);

// Create news - MANAGE_NEWS permission required
router.post("/", verifyJWT, checkPermission(Permission.MANAGE_NEWS), postNews);

// Update news - MANAGE_NEWS permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_NEWS),
  updateNews
);

// Delete news - MANAGE_NEWS permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_NEWS),
  deleteNews
);

module.exports = router;
```

### Example 2: Auth Routes

**Before:**

```javascript
const express = require("express");
const router = express.Router();
const {
  handleLogin,
  handleCreateAccount,
  handleRefreshToken,
  handleLogout,
} = require("../controller/authController");

router.post("/signup", handleCreateAccount);
router.post("/login", handleLogin);
router.post("/refreshToken", handleRefreshToken);
router.post("/logout", handleLogout);

module.exports = router;
```

**After:**

```javascript
const express = require("express");
const router = express.Router();
const {
  handleLogin,
  handleCreateAccount,
  handleRefreshToken,
  handleLogout,
} = require("../controller/authController");
const verifyJWT = require("../middlewares/verifyJWT");
const { requireSuperAdmin } = require("../middlewares/checkPermission");

// Admin account creation - SuperAdmin only
router.post("/signup", verifyJWT, requireSuperAdmin, handleCreateAccount);

// Public routes
router.post("/login", handleLogin);
router.post("/refreshToken", handleRefreshToken);

// Logout - requires authentication
router.post("/logout", verifyJWT, handleLogout);

module.exports = router;
```

## Backward Compatibility

The new system maintains backward compatibility:

1. **verifyJWT still sets legacy properties:**

   ```javascript
   request.userId = decoded.userInfo._id; // Still available
   request.username = decoded.userInfo.username; // Still available
   request.roles = decoded.userInfo.roles; // Still available
   ```

2. **Old middleware files still exist:**

   - `middlewares/verifyRoles.js` - Not deleted (in case needed)
   - `config/roles.js` - Still available

3. **Controllers don't need changes** (unless accessing user data)

## Testing After Migration

### 1. Test Authentication

```bash
# Should work - Login still returns same structure (with added fields)
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### 2. Test Permission Checks

```bash
# SuperAdmin - Should succeed on all operations
# Admin - Should succeed on management operations
# Staff - Should only succeed on view operations
```

### 3. Check Server Logs

Look for `[RBAC]` messages:

```
[RBAC] Permission denied: { user: 'staff', permission: 'delete_users', ... }
```

## Benefits of New System

### ✅ More Flexible

- Can easily add new roles
- Can customize permissions per role
- No route changes needed when adding roles

### ✅ More Maintainable

- Clear permission names (not just role names)
- Centralized permission definitions
- Easier to audit security

### ✅ Better UX

- More specific error messages
- Frontend can check permissions before making requests
- Clearer security logs

### ✅ Frontend Sync

- Frontend and backend use same permission definitions
- Consistent permission checks across full stack

## Common Pitfalls

### ❌ Don't Mix Old and New

```javascript
// BAD - Mixing old and new
router.get(
  "/data",
  verifyJWT,
  verifyRoles(ROLES.SuperAdmin), // Old
  checkPermission(Permission.VIEW_DATA), // New
  getData
);

// GOOD - Use only new
router.get("/data", verifyJWT, checkPermission(Permission.VIEW_DATA), getData);
```

### ❌ Don't Forget verifyJWT

```javascript
// BAD - Missing authentication
router.get("/data", checkPermission(Permission.VIEW_DATA), getData);

// GOOD - Always include verifyJWT first
router.get("/data", verifyJWT, checkPermission(Permission.VIEW_DATA), getData);
```

### ❌ Don't Use Wrong Permission

```javascript
// BAD - Wrong permission for delete operation
router.delete(
  "/data/:id",
  verifyJWT,
  checkPermission(Permission.VIEW_DATA), // Wrong!
  deleteData
);

// GOOD - Correct permission
router.delete(
  "/data/:id",
  verifyJWT,
  checkPermission(Permission.DELETE_DATA),
  deleteData
);
```

## Need Help?

1. Check `RBAC_IMPLEMENTATION.md` for detailed documentation
2. Check `QUICKSTART.md` for quick testing
3. Review updated route files as examples
4. Check server logs for `[RBAC]` and `[Auth]` messages

---

**Migration completed!** All routes are now using the new permission-based RBAC system. 🎉
