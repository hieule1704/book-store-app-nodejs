const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator"); // Add this import

// In routes/orders.js, replace the GET /orders route
router.get("/orders", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const orders = await Order.find({ user: req.session.userId }).sort({
      placedOn: -1,
    });
    res.render("pages/orders", {
      pageTitle: "Bookly - Orders",
      orders,
      user: res.locals.user,
      messages: orders.length ? [] : ["No orders found"],
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.render("pages/orders", {
      pageTitle: "Bookly - Orders",
      orders: [],
      user: res.locals.user,
      messages: ["Error loading orders"],
    });
  }
});

router.post(
  "/orders",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("number").trim().notEmpty().withMessage("Phone number is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("method").trim().notEmpty().withMessage("Payment method is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.message = errors.array().map((err) => err.msg);
      return res.redirect("/checkout");
    }
    const { name, number, email, method, address } = req.body;
    try {
      const cartItems = await Cart.find({ user: req.session.userId }).populate(
        "product"
      );
      if (!cartItems.length) {
        req.session.message = ["Cart is empty"];
        return res.redirect("/cart");
      }
      const products = [];
      let totalPrice = 0;
      for (const item of cartItems) {
        if (item.product.stockQuantity < item.quantity) {
          req.session.message = [
            `Insufficient stock for ${item.product.bookName}`,
          ];
          return res.redirect("/cart");
        }
        products.push({ product: item.product._id, quantity: item.quantity });
        totalPrice += item.product.price * item.quantity;
        await Product.updateOne(
          { _id: item.product._id },
          { $inc: { stockQuantity: -item.quantity } }
        );
      }
      const order = new Order({
        user: req.session.userId,
        products,
        totalPrice,
        method,
        address,
        placedOn: new Date().toLocaleDateString("en-GB"),
        paymentStatus: "pending",
      });
      await order.save();
      await Cart.deleteMany({ user: req.session.userId });
      req.session.message = ["Order placed successfully!"];
      res.redirect("/orders");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
