const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt"); // Explicitly require bcrypt here
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
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:217/bookly",
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://book-store-app-nodejs.onrender.com/auth/google/callback", // Production URL
      // callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google Profile:", profile);
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          console.log("Creating new user:", profile.emails[0].value);
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: await bcrypt.hash("google-auth", 10), // Now bcrypt is defined
            userType: "user",
          });
          await user.save();
          console.log("New user saved:", user._id);
        } else {
          console.log("Existing user found:", user._id);
        }
        return done(null, user);
      } catch (err) {
        console.error("Error in GoogleStrategy:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// User and messages middleware
app.use(async (req, res, next) => {
  res.locals.messages = req.session.message || [];
  req.session.message = []; // Clear messages after displaying
  res.locals.user = null;
  if (req.session.passport && req.session.passport.user) {
    const user = await User.findById(req.session.passport.user);
    if (user) {
      res.locals.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      };
    }
  } else if (req.session.userId) {
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
  }
  next();
});

// Cart count middleware
app.use(async (req, res, next) => {
  if (
    req.session.userId ||
    (req.session.passport && req.session.passport.user)
  ) {
    try {
      const userId = req.session.userId || req.session.passport.user;
      const cartCount = await Cart.countDocuments({ user: userId });
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
const authRoutes = require("./routes/auth");

// Override layout for login and register routes
app.use((req, res, next) => {
  if (req.path === "/login" || req.path === "/register") {
    res.locals.layout = "layouts/minimal";
  }
  next();
});

// Mount routes with specific prefixes to avoid conflicts
app.use("/", authRoutes);
app.use("/books", bookRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/blogs", blogRoutes);
app.use("/admin", adminRoutes);

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

// Error handler with more details
app.use((err, req, res, next) => {
  console.error("Error Details:", err.stack);
  res.status(500).render("pages/500", {
    pageTitle: "Bookly - Server Error",
    user: res.locals.user,
    errorMessage: "Something went wrong on our end. Please try again later.",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
