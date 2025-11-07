const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");
const { logSecurityEvent } = require("../utils/securityLogger");

const handleCreateAccount = async (request, response) => {
  const { username, email, contactNumber, roles, address, password } =
    request.body;

  if (!username || !email | !contactNumber || !password)
    return response.status(400).json({
      message: "Username, Email, Contact Number and Password is required!",
    });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return response.status(400).json({ message: "Invalid Email Format!" });
  }

  if (contactNumber.length !== 11) {
    return response.status(400).json({ message: "Invalid Contact Number!" });
  }

  const rolesKeys = Object.keys(roles);
  if (!Array.isArray(rolesKeys) || rolesKeys.length === 0) {
    return response
      .status(400)
      .json({ message: "At least one role is required!" });
  }

  try {
    const foundUser = await User.findOne({
      $or: [{ username }, { email }],
    }).lean();

    if (foundUser) {
      if (foundUser.username === username) {
        return response
          .status(409)
          .json({ message: "Username Already Exists" });
      }
      if (foundUser.email === email) {
        return response.status(409).json({ message: "Email Already Exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      contactNumber,
      address,
      roles: roles,
      password: hashedPassword,
    });

    // Log user registration
    await createLog({
      action: LOGCONSTANTS.actions.user.CREATE_USER,
      category: LOGCONSTANTS.categories.AUTHENTICATION,
      title: "New User Registered",
      description: `User ${username} registered successfully`,
      performedBy: request.userId,
      targetType: "USER",
      targetId: newUser._id.toString(),
      targetName: username,
    });

    response
      .status(201)
      .json({ message: `User ${newUser.username} created successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleLogin = async (request, response) => {
  const { username, password } = request.body;
  if (!username || !password)
    return response
      .status(400)
      .json({ message: "Username and Password are required!" });

  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser) {
    // Log failed login - user not found
    await logSecurityEvent('LOGIN_FAILED', request, { reason: 'User not found' });
    return response
      .status(401)
      .json({ message: "Username or Password is incorrect." });
  }

  try {
    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const roles = Object.values(foundUser.roles);

      const accessToken = jwt.sign(
        {
          userInfo: {
            _id: foundUser._id,
            username: foundUser.username,
            roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXP }
      );
      const refreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXP || "7d" } // Use refresh token expiration
      );

      foundUser.refreshToken = refreshToken;
      await foundUser.save();

      response.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      });

      // Log successful login (security log)
      await logSecurityEvent('LOGIN_SUCCESS', request);

      // Log successful login (activity log)
      await createLog({
        action: LOGCONSTANTS.actions.user.LOGIN,
        category: LOGCONSTANTS.categories.AUTHENTICATION,
        title: "User Login",
        description: `User ${username} logged in successfully`,
        performedBy: request.userId,
        targetType: LOGCONSTANTS.targetTypes.USER,
        targetId: foundUser._id.toString(),
        targetName: username,
      });

      response.json({
        userData: {
          username: foundUser.username,
          email: foundUser.email,
          roles: foundUser.roles,
          rolesKeys: foundUser.rolesKeys || [],
        },
        accessToken: accessToken,
      });
    } else {
      // Log failed login - incorrect password
      await logSecurityEvent('LOGIN_FAILED', request, { reason: 'Invalid password' });
      response
        .status(401)
        .json({ message: "Username or Password is incorrect." });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

const handleRefreshToken = async (request, response) => {
  const cookies = request.cookies;

  if (!cookies?.refreshToken) return response.sendStatus(401);
  const refreshToken = cookies.refreshToken;

  try {
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) return response.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || decoded.username !== foundUser.username)
          return response.sendStatus(403);

        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
          {
            userInfo: {
              _id: foundUser._id,
              username: foundUser.username,
              roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXP }
        );

        return response.json({
          userData: {
            username: foundUser.username,
            email: foundUser.email,
            roles: foundUser.roles,
            rolesKeys: foundUser.rolesKeys || [],
          },
          accessToken: accessToken,
        });
      }
    );
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

const handleLogout = async (request, response) => {
  const cookies = request.cookies;

  if (!cookies) return response.sendStatus(204);
  const refreshToken = cookies.refreshToken;

  try {
    const foundUser = await User.findOne({ refreshToken });

    if (!foundUser) {
      response.clearCookie("refreshToken", {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: "None",
      });
      response.sendStatus(204);
    }

    foundUser.refreshToken = "";
    await foundUser.save();

    // Log logout
    await createLog({
      action: LOGCONSTANTS.actions.user.LOGOUT,
      category: LOGCONSTANTS.categories.AUTHENTICATION,
      title: "User Logout",
      description: `User ${foundUser.username} logged out`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.USER,
      targetId: foundUser._id.toString(),
      targetName: foundUser.username,
    });

    response.clearCookie("refreshToken", {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "None",
    });
    response.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleCreateAccount,
  handleLogin,
  handleRefreshToken,
  handleLogout,
};
