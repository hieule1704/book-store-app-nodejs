const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require("passport");

router.get("/login", (req, res) => {
  if (
    req.session.userId ||
    (req.session.passport && req.session.passport.user)
  ) {
    return res.redirect("/books/home");
  }
  res.render("pages/login", {
    pageTitle: "Bookly - Login",
    user: res.locals.user,
  });
});

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
      return res.redirect("/books/home");
    }
  } catch (err) {
    console.error(err);
    req.session.message = ["Error logging in"];
    res.redirect("/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/books/home");
    }
    res.redirect("/login");
  });
});

router.get("/register", (req, res) => {
  if (
    req.session.userId ||
    (req.session.passport && req.session.passport.user)
  ) {
    return res.redirect("/books/home");
  }
  res.render("pages/register", {
    pageTitle: "Bookly - Register",
    user: res.locals.user,
  });
});

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

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Callback success, user:", req.user);
    req.session.userId = req.user._id;
    req.session.userType = req.user.userType;
    req.session.userName = req.user.name;
    req.session.userEmail = req.user.email;
    if (req.user.userType === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/books/home");
    }
  }
);

module.exports = router;
