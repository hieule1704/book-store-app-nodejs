const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();

// Import all models to ensure they are registered with Mongoose
require("./models/Author");
require("./models/Blog");
const Cart = require("./models/Cart"); // Import Cart model for middleware
require("./models/Message");
require("./models/Order");
require("./models/Product");
require("./models/Publisher");
require("./models/User");

// Middleware
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.message = req.session.message || [];
  delete req.session.message;
  res.locals.user = req.session.userId
    ? {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail,
      }
    : null;
  next();
});

// Cart count middleware
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const cartCount = await Cart.countDocuments({ user: req.session.userId });
      res.locals.cartCount = cartCount; // Make cart count available to all templates
    } catch (err) {
      console.error("Error fetching cart count:", err);
      res.locals.cartCount = 0; // Default to 0 on error
    }
  } else {
    res.locals.cartCount = 0; // No user logged in, set cart count to 0
  }
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const bookRoutes = require("./routes/books");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");
const adminRoutes = require("./routes/admin");
app.use("/", bookRoutes);
app.use("/", cartRoutes);
app.use("/", orderRoutes);
app.use("/", authRoutes);
app.use("/", blogRoutes);
app.use("/", adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
