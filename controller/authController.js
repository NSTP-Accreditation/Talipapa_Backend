const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleCreateAccount = async (request, response) => {
  const { username, email, contactNumber, roles, address, password } =
    request.body;

  if (!username || !email | !contactNumber || !address || !password)
    return response.status(400).json({
      message:
        "Username, Email, Contact Number Address and Password is required!",
    });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return response.status(400).json({ message: "Invalid Email Format!" });
  }

  if (contactNumber.length !== 11) {
    return response.status(400).json({ message: "Invalid Contact Number!" });
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

    response
      .status(201)
      .json({ message: `User ${newUser.username} created successfully!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleLogin = async (request, response) => {
  const { username, password } = request.body;
  if (!username || !password)
    return response
      .status(400)
      .json({ error: "Username and Password are required!" });

  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser)
    return response
      .status(401)
      .json({ error: "Username or Password is incorrect." });

  try {
    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const roles = Object.values(foundUser.roles);

      const accessToken = jwt.sign(
        {
          userInfo: {
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
        { expiresIn: process.env.ACCESS_TOKEN_EXP }
      );

      foundUser.refreshToken = refreshToken;
      await foundUser.save();

      response.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: "None",
      }); // TODO: Secure True, Samesite: Strict

      response.json({
        userData: {
          username: foundUser.username,
        },
        accessToken: accessToken,
      });
    } else {
      response
        .status(401)
        .json({ error: "Username or Password is incorrect." });
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
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
        const roles = Object.values(foundUser.roles)
        const accessToken = jwt.sign(
          {
            userInfo: {
              username: foundUser.username,
              roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXP }
        );

        return response.json({ accessToken });
      }
    );
  } catch (error) {
    response.status(500).json({ error: error.message });
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

    response.clearCookie("refreshToken", {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "None",
    });
    response.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  handleCreateAccount,
  handleLogin,
  handleRefreshToken,
  handleLogout,
};
