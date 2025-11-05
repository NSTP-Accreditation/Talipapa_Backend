const { Permission, ROLE_PERMISSIONS } = require('./permissions');

/**
 * Get role from environment ID
 */
const getRoleFromId = (roleId) => {
  const SUPERADMIN_ID = parseInt(process.env.SUPERADMIN_ROLE_ID);
  const ADMIN_ID = parseInt(process.env.ADMIN_ROLE_ID);
  const STAFF_ID = parseInt(process.env.STAFF_ROLE_ID);

  if (roleId === SUPERADMIN_ID) return 'SUPERADMIN';
  if (roleId === ADMIN_ID) return 'ADMIN';
  if (roleId === STAFF_ID) return 'STAFF';
  return null;
};

/**
 * Extract user role from database user object
 */
const getUserRole = (user) => {
  if (!user || !user.roles) return null;

  const SUPERADMIN_ID = parseInt(process.env.SUPERADMIN_ROLE_ID);
  const ADMIN_ID = parseInt(process.env.ADMIN_ROLE_ID);
  const STAFF_ID = parseInt(process.env.STAFF_ROLE_ID);

  // Check in priority order
  if (user.roles.SuperAdmin === SUPERADMIN_ID) return 'SUPERADMIN';
  if (user.roles.Admin === ADMIN_ID) return 'ADMIN';
  if (user.roles.Staff === STAFF_ID) return 'STAFF';

  return null;
};

/**
 * Get permissions for a role
 */
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if user has a specific permission
 */
const hasPermission = (user, permission) => {
  const role = getUserRole(user);
  if (!role) return false;

  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 */
const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if user is SuperAdmin
 */
const isSuperAdmin = (user) => {
  return getUserRole(user) === 'SUPERADMIN';
};

/**
 * Check if user is Admin
 */
const isAdmin = (user) => {
  return getUserRole(user) === 'ADMIN';
};

/**
 * Check if user is Staff
 */
const isStaff = (user) => {
  return getUserRole(user) === 'STAFF';
};

module.exports = {
  getUserRole,
  getRoleFromId,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin,
  isAdmin,
  isStaff,
  Permission
};
