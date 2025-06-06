const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Login page
router.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/home");
  }
  res.render("pages/login", {
    pageTitle: "Bookly - Login",
    user: res.locals.user,
  });
});

// Handle login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.session.message = ["Incorrect email or password!"];
      return res.redirect("/login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.message = ["Incorrect email or password!"];
      return res.redirect("/login");
    }
    req.session.userId = user._id;
    req.session.userType = user.userType;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    if (user.userType === "admin") {
      return res.redirect("/admin");
    } else {
      return res.redirect("/home");
    }
  } catch (err) {
    console.error(err);
    req.session.message = ["Error logging in"];
    res.redirect("/login");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/home");
    }
    res.redirect("/login");
  });
});

// Register page
router.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/home");
  }
  res.render("pages/register", {
    pageTitle: "Bookly - Register",
    user: res.locals.user,
  });
});

// Handle registration
router.post("/register", async (req, res) => {
  const { name, email, password, cpassword } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.session.message = ["User already exists!"];
      return res.redirect("/register");
    }
    if (password !== cpassword) {
      req.session.message = ["Confirm password does not match!"];
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
    req.session.message = ["Registered successfully!"];
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.session.message = ["Error registering user"];
    res.redirect("/register");
  }
});

module.exports = router;
