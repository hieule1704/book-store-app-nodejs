const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");

// GET /orders (mounted as /orders) - View order history
router.get("/", async (req, res) => {
  // Changed from "/orders" to "/" to match prefix root
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

// GET /orders/detail/:id (mounted as /orders/detail/:id) - View order receipt
router.get("/detail/:id", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!order) {
      req.session.message = ["Order not found"];
      return res.redirect("/orders"); // Changed from "/orders/orders" to "/orders"
    }
    res.render("pages/order_detail", {
      pageTitle: "Bookly - Order Receipt",
      order,
      user: res.locals.user,
    });
  } catch (err) {
    console.error("Error fetching order detail:", err);
    req.session.message = ["Error loading order details"];
    res.redirect("/orders"); // Changed from "/orders/orders" to "/orders"
  }
});

// GET /orders/cancel/:id (mounted as /orders/cancel/:id) - Cancel order
router.get("/cancel/:id", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!order) {
      req.session.message = ["Order not found"];
      return res.redirect("/orders"); // Changed from "/orders/orders" to "/orders"
    }
    if (order.paymentStatus !== "Pending") {
      req.session.message = ["Only pending orders can be canceled"];
      return res.redirect("/orders"); // Changed from "/orders/orders" to "/orders"
    }

    // Delete the order without affecting stock
    await Order.findByIdAndDelete(req.params.id);
    req.session.message = ["Order canceled successfully"];
    res.redirect("/orders"); // Changed from "/orders/orders" to "/orders"
  } catch (err) {
    console.error("Error canceling order:", err);
    req.session.message = ["Error canceling order"];
    res.redirect("/orders"); // Changed from "/orders/orders" to "/orders"
  }
});

// POST /orders (mounted as /orders/orders) - Place a new order
router.post("/", async (req, res) => {
  // Changed from "/orders" to "/" to match prefix root
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
        return res.redirect("/cart/checkout"); // Assuming checkout is under /cart prefix
      }
      const { name, number, email, method, address } = req.body;
      try {
        const cartItems = await Cart.find({
          user: req.session.userId,
        }).populate("product");
        if (!cartItems.length) {
          req.session.message = ["Cart is empty"];
          return res.redirect("/cart"); // Assuming cart is under /cart prefix
        }
        const products = [];
        let totalPrice = 0;
        for (const item of cartItems) {
          if (item.product.stockQuantity < item.quantity) {
            req.session.message = [
              `Insufficient stock for ${item.product.bookName}`,
            ];
            return res.redirect("/cart"); // Assuming cart is under /cart prefix
          }
          products.push({ product: item.product._id, quantity: item.quantity });
          totalPrice += item.product.price * item.quantity;
        }
        const order = new Order({
          user: req.session.userId,
          name,
          number,
          email,
          method,
          address,
          totalProducts: cartItems
            .map((item) => `${item.product.bookName} (${item.quantity})`)
            .join(", "),
          totalPrice,
          placedOn: new Date().toLocaleDateString("en-GB"),
          paymentStatus: "Pending",
        });
        await order.save();
        await Cart.deleteMany({ user: req.session.userId });
        req.session.message = ["Order placed successfully!"];
        res.redirect("/orders"); // Redirects to /orders (which is /orders/)
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    };
});

module.exports = router;
