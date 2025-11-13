# Admin Permission Restriction - Quick Reference

## 🔒 Admin Role (Restricted)

### ✅ CAN ACCESS (Home Editables)

- **Page Content**: About Us, Carousel
- **Talipapa Natin**: Programs and items
- **Barangay Officials**: View and edit
- **Guidelines**: Full management
- **News**: Full management
- **Achievements**: Full management
- **Dashboard**: View only (no export)

### ❌ CANNOT ACCESS (SuperAdmin Only)

- User Management
- Staff Management
- Records Management
- Trading (Products, Materials, Skills)
- Green Pages (Establishments, Farms)
- Inventory & Farm Inventory
- Activity Logs
- Security Logs
- Settings

---

## 🔓 SuperAdmin Role (Full Access)

### ✅ HAS ALL PERMISSIONS

- Everything Admin can access
- Everything Admin cannot access
- Full system administration

---

## 📋 Permission Mapping

| Feature        | Permission                                                         | Admin | SuperAdmin |
| -------------- | ------------------------------------------------------------------ | ----- | ---------- |
| Page Content   | `view_content`, `create_content`, `edit_content`, `delete_content` | ✅    | ✅         |
| Guidelines     | `view_guidelines`, `manage_guidelines`                             | ✅    | ✅         |
| News           | `view_news`, `manage_news`                                         | ✅    | ✅         |
| Achievements   | `view_achievements`, `manage_achievements`                         | ✅    | ✅         |
| Dashboard      | `view_reports`                                                     | ✅    | ✅         |
| Users          | `view_users`, `create_users`, `edit_users`, `delete_users`         | ❌    | ✅         |
| Records        | `view_records`, `create_records`, `edit_records`, `delete_records` | ❌    | ✅         |
| Trading        | `view_trading`, `manage_trading`                                   | ❌    | ✅         |
| Green Pages    | `view_green_pages`, `manage_green_pages`                           | ❌    | ✅         |
| Inventory      | `view_inventory`, `manage_inventory`                               | ❌    | ✅         |
| Farm Inventory | `view_farm_inventory`, `manage_farm_inventory`                     | ❌    | ✅         |
| Activity Logs  | `view_activity_logs`                                               | ❌    | ✅         |
| Settings       | `view_settings`, `edit_settings`                                   | ❌    | ✅         |
| Export Data    | `export_data`                                                      | ❌    | ✅         |

---

## 🛠️ Using Permissions in Routes

### Import Permission constants:

```javascript
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");
```

### Protect a route:

```javascript
// Single permission
router.get(
  "/api/news",
  verifyJWT,
  checkPermission(Permission.VIEW_NEWS),
  getNews
);

// SuperAdmin only
router.post("/api/auth/signup", verifyJWT, requireSuperAdmin, signupAdmin);
```

---

## 🧪 Testing Permissions

### Test Admin Access:

```bash
# Set credentials
export ADMIN_USERNAME="your_admin_username"
export ADMIN_PASSWORD="your_admin_password"

# Run test script
cd documentations
./TEST_ADMIN_RESTRICTIONS.sh
```

### Manual Testing:

```bash
# Login as Admin
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Test allowed endpoint (should return 200)
curl -X GET http://localhost:5000/api/news \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test restricted endpoint (should return 403)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Checking Security Logs

### View permission denials (SuperAdmin only):

```bash
GET /api/security/logs?event=PERMISSION_DENIED
```

### Response format:

```json
{
  "success": true,
  "logs": [
    {
      "event": "PERMISSION_DENIED",
      "username": "admin_user",
      "permission": "view_users",
      "endpoint": "/api/users",
      "method": "GET",
      "ip": "192.168.1.100",
      "timestamp": "2025-11-10T10:30:00.000Z"
    }
  ]
}
```

---

## 📁 Modified Files

1. **middlewares/permissions.js** - Permission definitions and role mapping
2. **middlewares/checkPermission.js** - Enhanced security logging
3. **routes/api/skillsRoute.js** - Changed to trading permissions
4. **routes/api/materialsRoute.js** - Changed to trading permissions

---

## 🚨 Common Issues

### Admin seeing 403 on Home Editables

- Check: User has correct Admin role (92781)
- Check: JWT token is valid
- Check: Route uses correct permission

### SuperAdmin restricted

- Check: User has SuperAdmin role (32562)
- Check: Role is correctly set in user document

### Permission not working

- Check: Permission exists in `Permission` object
- Check: Permission added to `ROLE_PERMISSIONS` mapping
- Check: Route uses `checkPermission()` middleware

---

## 📚 Full Documentation

- **Implementation Details**: `BACKEND_ADMIN_RESTRICTION_IMPLEMENTATION.md`
- **RBAC Overview**: `RBAC_IMPLEMENTATION.md`
- **Security**: `ANTI_BRUTE_FORCE_COMPLETE.md`
- **Testing Script**: `TEST_ADMIN_RESTRICTIONS.sh`

---

## 🔗 Quick Links

| Task               | Command/Path                                    |
| ------------------ | ----------------------------------------------- |
| View permissions   | `middlewares/permissions.js`                    |
| Add new permission | Edit `Permission` object and `ROLE_PERMISSIONS` |
| Protect route      | Add `checkPermission(Permission.XXXX)`          |
| Test permissions   | `./documentations/TEST_ADMIN_RESTRICTIONS.sh`   |
| View security logs | `GET /api/security/logs`                        |

---

**Last Updated:** November 10, 2025  
**Status:** ✅ Production Ready (Pending Testing)
