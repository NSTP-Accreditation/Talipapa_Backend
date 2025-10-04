const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleCreateAccount = async (request, response) => {
  const { username, email, contactNumber, address, password } = request.body;

  if (!username || !email | !contactNumber || !address || !password)
    return response.status(400).json({
      message:
        "Username, Email, Contact Number Address and Password is required!",
    });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return response.status(400).json({ message: "Invalid Email Format!" });
  }

  if(contactNumber.length !== 11) {
    return response.status(400).json({ message: "Invalid Contact Number!" });
  }

  try {
    const foundUser = await User.findOne({
      $or: [{ username }, { email }],
    }).lean();

    if (foundUser) {
      if (foundUser.username === username) {
        return response.status(409).json({ message: "Username Already Exists" });
      }
      if (foundUser.email === email) {
        return response.status(409).json({ message: "Email Already Exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      // roles,
      contactNumber,
      address,
      password: hashedPassword,
    });

    response
      .status(201)
      .json({ message: `User ${newUser.username} created successfully!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleLogin = (request, response) => {};

module.exports = { handleCreateAccount, handleLogin };
