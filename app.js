const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();

// Import all models to ensure they are registered with Mongoose
require("./models/Author");
require("./models/Blog");
const Cart = require("./models/Cart");
require("./models/Message");
require("./models/Order");
require("./models/Product");
require("./models/Publisher");
const User = require("./models/User");


// Middleware
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main"); // Set default layout for EJS

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Fallback secret if not set in .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/bookly",
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// User and messages middleware
app.use(async (req, res, next) => {
  res.locals.messages = req.session.message || [];
  req.session.message = []; // Clear messages after displaying
  res.locals.user = null;
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        res.locals.user = {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
        };
      } else {
        req.session.destroy();
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      req.session.destroy();
    }
  }
  next();
});

// Cart count middleware
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const cartCount = await Cart.countDocuments({ user: req.session.userId });
      res.locals.cartCount = cartCount;
    } catch (err) {
      console.error("Error fetching cart count:", err);
      res.locals.cartCount = 0;
    }
  } else {
    res.locals.cartCount = 0;
  }
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bookly")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const bookRoutes = require("./routes/books");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const blogRoutes = require("./routes/blogs");
const adminRoutes = require("./routes/admin");

// In app.js, keep the existing setup and add this after the routes import
const authRoutes = require("./routes/auth");

// Override layout for login and register routes
app.use((req, res, next) => {
  if (req.path === "/login" || req.path === "/register") {
    res.locals.layout = "layouts/minimal";
  }
  next();
});

// Mount routes with specific prefixes to avoid conflicts
app.use("/", authRoutes); // Authentication routes (login, logout, register)
app.use("/books", bookRoutes); // Book-related routes (home, shop, detail, etc.)
app.use("/cart", cartRoutes); // Cart routes
app.use("/orders", orderRoutes); // Order routes
app.use("/blogs", blogRoutes); // Blog routes
app.use("/admin", adminRoutes); // Admin routes

// Default route (redirect to /books/home)
app.get("/", (req, res) => {
  res.redirect("/books/home");
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("pages/404", {
    pageTitle: "Bookly - Page Not Found",
    user: res.locals.user,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("pages/500", {
    pageTitle: "Bookly - Server Error",
    user: res.locals.user,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
