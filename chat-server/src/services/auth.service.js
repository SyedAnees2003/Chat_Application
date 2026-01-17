const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error("USER_EXISTS");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });

  return { user, token };
};

exports.loginUser = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }
  
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "2h"
    });
  
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  };
  