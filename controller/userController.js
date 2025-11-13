const User = require("../model/User");
const bcrypt = require("bcrypt");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

/**
 * Validate role limits when updating a user
 * SuperAdmin: Maximum 2 accounts
 * Admin: Maximum 1 account
 */
const validateRoleLimitsForUpdate = async (userId, newRoles) => {
  if (!newRoles) return;

  const SUPERADMIN_ID = parseInt(process.env.SUPERADMIN_ROLE_ID || "32562");
  const ADMIN_ID = parseInt(process.env.ADMIN_ROLE_ID || "92781");

  // Get all users EXCEPT the one being edited
  const allUsers = await User.find({ _id: { $ne: userId } })
    .select("roles")
    .lean();

  let superAdminCount = 0;
  let adminCount = 0;

  allUsers.forEach((user) => {
    if (user.roles && user.roles.SuperAdmin === SUPERADMIN_ID) {
      superAdminCount++;
    }
    if (user.roles && user.roles.Admin === ADMIN_ID) {
      adminCount++;
    }
  });

  // Check if updated roles would exceed limits
  if (newRoles.SuperAdmin === SUPERADMIN_ID && superAdminCount >= 2) {
    const error = new Error(
      "Maximum of 2 SuperAdmin accounts allowed. Please remove an existing SuperAdmin first."
    );
    error.statusCode = 400;
    throw error;
  }

  if (newRoles.Admin === ADMIN_ID && adminCount >= 1) {
    const error = new Error(
      "Maximum of 1 Admin account allowed. Please remove the existing Admin first."
    );
    error.statusCode = 400;
    throw error;
  }
};

const getAllUsers = async (request, response) => {
  try {
    const users = await User.find({}).select("-password -refreshToken").exec();

    const result = users.map((user) => {
      const userObj = user.toObject({ virtuals: true });
      return {
        _id: userObj._id,
        username: userObj.username,
        email: userObj.email,
        contactNumber: userObj.contactNumber,
        roles: userObj.roles,
        rolesKeys: userObj.rolesKeys,
      };
    });

    return response.json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const handleDeleteAccount = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "ID is required!" });

  try {
    const foundUser = await User.findOne({ _id: id });
    if (!foundUser)
      return response
        .status(404)
        .json({ message: `User not found with ID ${id}` });

    await User.deleteOne({ _id: id });

    // Log user deletion

    await createLog({
      action: LOGCONSTANTS.actions.user.DELETE_USER,
      category: LOGCONSTANTS.categories.USER_MANAGEMENT,
      title: "User Account Deleted",
      description: `User "${foundUser.username}" was deleted`,
      performedBy: request.userId,
    });

    response.json({ message: "User Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleUpdateAccount = async (request, response) => {
  const { id } = request.params;
  const { username, email, contactNumber, roles, password } = request.body;

  if (!id) return response.status(400).json({ message: "ID is required!" });

  try {
    const foundUser = await User.findOne({ _id: id });
    if (!foundUser)
      return response
        .status(404)
        .json({ message: `User not found with ID ${id}` });

    // VALIDATE ROLE LIMITS - If roles are being updated
    if (roles) {
      await validateRoleLimitsForUpdate(id, roles);
    }

    // Check if username or email already exists (excluding current user)
    if (username && username !== foundUser.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return response
          .status(409)
          .json({ message: "Username already exists" });
      }
    }

    if (email && email !== foundUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return response.status(409).json({ message: "Email already exists" });
      }
    }

    // Email validation
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return response.status(400).json({ message: "Invalid Email Format!" });
      }
    }

    // Contact number validation
    if (contactNumber && contactNumber.length !== 11) {
      return response.status(400).json({ message: "Invalid Contact Number!" });
    }

    // Update fields
    if (username) foundUser.username = username;
    if (email) foundUser.email = email;
    if (contactNumber) foundUser.contactNumber = contactNumber;
    if (roles) foundUser.roles = roles;

    // Update password if provided
    if (password && password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      foundUser.password = hashedPassword;
    }

    await foundUser.save();

    // Log user update
    await createLog({
      action: LOGCONSTANTS.actions.user.UPDATE_USER,
      category: LOGCONSTANTS.categories.USER_MANAGEMENT,
      title: "User Account Updated",
      description: `User "${foundUser.username}" was updated`,
      performedBy: request.userId,
      targetType: "USER",
      targetId: foundUser._id.toString(),
      targetName: foundUser.username,
    });

    response.json({ message: "User updated successfully" });
  } catch (error) {
    // Log role limit violations
    if (error.statusCode === 400 && error.message.includes("Maximum")) {
      console.warn(`[ROLE LIMIT] ${error.message}`, {
        userId: id,
        requestedRoles: roles,
        timestamp: new Date().toISOString(),
      });

      // Log to security logs if available
      try {
        const { logSecurityEvent } = require("../utils/securityLogger");
        await logSecurityEvent("ROLE_LIMIT_EXCEEDED", request, {
          userId: id,
          attemptedRoles: roles,
          message: error.message,
        });
      } catch (logErr) {
        console.error("Failed to log security event:", logErr.message);
      }
    }

    response.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, handleDeleteAccount, handleUpdateAccount };
