const User = require("../model/User");
const { createLog } = require("../utils/logHelper");

const getAllUsers = async (request, response) => {
  try {
    const users = await User.find({});
    const result = users.map(({ _id, username, email, contactNumber, roles }) => {
      const rolesKeys = Object.keys(roles).filter(role => roles[role] != null);
      const result = {
        _id,
        username,
        email,
        contactNumber,
        rolesKeys,
      };

      return result;
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
      action: 'USER_DELETE',
      category: 'USER_MANAGEMENT',
      title: 'User Account Deleted',
      description: `User "${foundUser.username}" account was deleted`,
      performedBy: request.user,
      targetType: 'USER',
      targetId: id,
      targetName: foundUser.username,
      details: {
        deletedUser: {
          username: foundUser.username,
          email: foundUser.email,
          contactNumber: foundUser.contactNumber,
          roles: foundUser.roles
        }
      },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.json({ message: "User Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, handleDeleteAccount };
