/**
 * Permission Definitions
 * These must match the frontend Permission enum exactly
 */
const Permission = {
  // User Management
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",

  // Records Management
  VIEW_RECORDS: "view_records",
  CREATE_RECORDS: "create_records",
  EDIT_RECORDS: "edit_records",
  DELETE_RECORDS: "delete_records",

  // Content Management
  VIEW_CONTENT: "view_content",
  CREATE_CONTENT: "create_content",
  EDIT_CONTENT: "edit_content",
  DELETE_CONTENT: "delete_content",

  // News Management
  VIEW_NEWS: "view_news",
  MANAGE_NEWS: "manage_news",

  // Guidelines Management
  VIEW_GUIDELINES: "view_guidelines",
  MANAGE_GUIDELINES: "manage_guidelines",

  // Achievements Management
  VIEW_ACHIEVEMENTS: "view_achievements",
  MANAGE_ACHIEVEMENTS: "manage_achievements",

  // Inventory Management
  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",

  // Farm Inventory Management
  VIEW_FARM_INVENTORY: "view_farm_inventory",
  MANAGE_FARM_INVENTORY: "manage_farm_inventory",

  // Green Pages Management
  VIEW_GREEN_PAGES: "view_green_pages",
  MANAGE_GREEN_PAGES: "manage_green_pages",

  // Trading Management
  VIEW_TRADING: "view_trading",
  MANAGE_TRADING: "manage_trading",

  // Activity Logs
  VIEW_ACTIVITY_LOGS: "view_activity_logs",
  EXPORT_DATA: "export_data",

  // Settings & Admin Management
  VIEW_SETTINGS: "view_settings",
  EDIT_SETTINGS: "edit_settings",
  MANAGE_ADMINS: "manage_admins",
  VIEW_ADMINS: "view_admins",
  CREATE_ADMINS: "create_admins",
  EDIT_ADMINS: "edit_admins",
  DELETE_ADMINS: "delete_admins",

  // Reports & Dashboard
  VIEW_REPORTS: "view_reports",
};

/**
 * Role to Permission Mapping
 * IMPORTANT: Must match frontend ROLE_PERMISSIONS exactly
 *
 * ADMIN RESTRICTION (Updated Nov 2025):
 * Admin users can ONLY access Home Editables section:
 * - Page Content (About Us, Carousel, Talipapa Natin)
 * - Guidelines
 * - News
 * - Achievements
 *
 * Admin users are BLOCKED from Dashboard access.
 * All other features restricted to SuperAdmin only.
 */
const ROLE_PERMISSIONS = {
  SUPERADMIN: [
    // All permissions
    ...Object.values(Permission),
  ],

  ADMIN: [
    // ONLY Home Editables permissions
    // Content Management (About Us, Carousel, Talipapa Natin)
    Permission.VIEW_CONTENT,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,

    // Guidelines Management
    Permission.VIEW_GUIDELINES,
    Permission.MANAGE_GUIDELINES,

    // News Management
    Permission.VIEW_NEWS,
    Permission.MANAGE_NEWS,

    // Achievements Management
    Permission.VIEW_ACHIEVEMENTS,
    Permission.MANAGE_ACHIEVEMENTS,

    // NOTE: Admin CANNOT access:
    // - Dashboard (view_reports) - BLOCKED
    // - User Management (view_users, create_users, edit_users, delete_users)
    // - Records Management (view_records, create_records, edit_records, delete_records)
    // - Trading (view_trading, manage_trading)
    // - Inventory (view_inventory, manage_inventory)
    // - Farm Inventory (view_farm_inventory, manage_farm_inventory)
    // - Green Pages (view_green_pages, manage_green_pages)
    // - Activity Logs (view_activity_logs)
    // - Settings (view_settings, edit_settings)
    // - Admin Management (manage_admins, view_admins, etc.)
    // - Data Export (export_data)
  ],
};

module.exports = { Permission, ROLE_PERMISSIONS };
