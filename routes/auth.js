const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

router.get("/login", (req, res) => {
  res.render("pages/login", {
    pageTitle: "Bookly - Login",
    user: res.locals.user,
  });
});

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.message = errors.array().map((err) => err.msg);
      return res.redirect("/login");
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        req.session.message = ["Invalid credentials"];
        return res.redirect("/login");
      }
      req.session.userId = user._id;
      req.session.userName = user.name;
      req.session.userEmail = user.email;
      res.redirect("/home");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/register", (req, res) => {
  res.render("pages/register", {
    pageTitle: "Bookly - Register",
    user: res.locals.user,
  });
});

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.message = errors.array().map((err) => err.msg);
      return res.redirect("/register");
    }
    const { name, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.session.message = ["Email already exists"];
        return res.redirect("/register");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        userType: "user",
      });
      await user.save();
      req.session.message = ["Registration successful! Please login."];
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
