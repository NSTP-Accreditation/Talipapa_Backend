/**
 * Permission Definitions
 * These must match the frontend Permission enum exactly
 */
const Permission = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Records Management
  VIEW_RECORDS: 'view_records',
  CREATE_RECORDS: 'create_records',
  EDIT_RECORDS: 'edit_records',
  DELETE_RECORDS: 'delete_records',
  
  // Content Management
  VIEW_CONTENT: 'view_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  
  // News Management
  VIEW_NEWS: 'view_news',
  MANAGE_NEWS: 'manage_news',
  
  // Guidelines Management
  VIEW_GUIDELINES: 'view_guidelines',
  MANAGE_GUIDELINES: 'manage_guidelines',
  
  // Achievements Management
  VIEW_ACHIEVEMENTS: 'view_achievements',
  MANAGE_ACHIEVEMENTS: 'manage_achievements',
  
  // Inventory Management
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Farm Inventory Management
  VIEW_FARM_INVENTORY: 'view_farm_inventory',
  MANAGE_FARM_INVENTORY: 'manage_farm_inventory',
  
  // Green Pages Management
  VIEW_GREEN_PAGES: 'view_green_pages',
  MANAGE_GREEN_PAGES: 'manage_green_pages',
  
  // Trading Management
  VIEW_TRADING: 'view_trading',
  MANAGE_TRADING: 'manage_trading',
  
  // Activity Logs
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  EXPORT_DATA: 'export_data',
  
  // Settings & Admin Management
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_ADMINS: 'manage_admins',
};

/**
 * Role to Permission Mapping
 * IMPORTANT: Must match frontend ROLE_PERMISSIONS exactly
 */
const ROLE_PERMISSIONS = {
  SUPERADMIN: [
    // All permissions
    ...Object.values(Permission)
  ],
  
  ADMIN: [
    // View permissions
    Permission.VIEW_USERS,
    Permission.VIEW_RECORDS,
    Permission.VIEW_CONTENT,
    Permission.VIEW_NEWS,
    Permission.VIEW_GUIDELINES,
    Permission.VIEW_ACHIEVEMENTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_FARM_INVENTORY,
    Permission.VIEW_GREEN_PAGES,
    Permission.VIEW_TRADING,
    Permission.VIEW_ACTIVITY_LOGS,
    Permission.VIEW_SETTINGS,
    
    // Management permissions (all except admin management)
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.CREATE_RECORDS,
    Permission.EDIT_RECORDS,
    Permission.DELETE_RECORDS,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.MANAGE_NEWS,
    Permission.MANAGE_GUIDELINES,
    Permission.MANAGE_ACHIEVEMENTS,
    Permission.MANAGE_INVENTORY,
    Permission.MANAGE_FARM_INVENTORY,
    Permission.MANAGE_GREEN_PAGES,
    Permission.MANAGE_TRADING,
    Permission.EXPORT_DATA,
  ],
  
  STAFF: [
    // View-only permissions
    Permission.VIEW_USERS,
    Permission.VIEW_RECORDS,
    Permission.VIEW_CONTENT,
    Permission.VIEW_NEWS,
    Permission.VIEW_GUIDELINES,
    Permission.VIEW_ACHIEVEMENTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_FARM_INVENTORY,
    Permission.VIEW_GREEN_PAGES,
    Permission.VIEW_TRADING,
    Permission.VIEW_ACTIVITY_LOGS,
    Permission.VIEW_SETTINGS,
  ]
};

module.exports = { Permission, ROLE_PERMISSIONS };
