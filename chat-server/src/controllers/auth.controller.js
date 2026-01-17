const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { registerUser, loginUser } = require("../services/auth.service");

exports.register = async (req, res) => {
    try {
      const data = await registerUser(req.body);
      res.status(201).json(data);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  };

  exports.login = async (req, res) => {
    try {
      const data = await loginUser(req.body);
      res.json(data);
    } catch (error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.status(500).json({ message: "Login failed" });
    }
  };
