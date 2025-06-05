const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

router.get("/cart", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const cartItems = await Cart.find({ user: req.session.userId }).populate(
      "product"
    );
    res.render("pages/cart", {
      pageTitle: "Bookly - Cart",
      cartItems,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/cart/add", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product || product.stockQuantity < quantity) {
      req.session.message = ["Insufficient stock"];
      return res.redirect("/home");
    }
    const existingItem = await Cart.findOne({
      user: req.session.userId,
      product: productId,
    });
    if (existingItem) {
      req.session.message = ["Already added to cart!"];
    } else {
      const cartItem = new Cart({
        user: req.session.userId,
        product: productId,
        quantity: parseInt(quantity),
      });
      await cartItem.save();
      req.session.message = ["Product added to cart!"];
    }
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
