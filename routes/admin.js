const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");

router.get("/admin", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const user = await User.findById(req.session.userId);
  if (user.userType !== "admin") return res.redirect("/home");
  try {
    const products = await Product.find().populate("author publisher");
    res.render("admin/index", {
      pageTitle: "Bookly - Admin",
      products,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/admin/products", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const user = await User.findById(req.session.userId);
  if (user.userType !== "admin") return res.redirect("/home");
  try {
    const products = await Product.find().populate("author publisher");
    res.render("admin/products", {
      pageTitle: "Bookly - Manage Products",
      products,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
