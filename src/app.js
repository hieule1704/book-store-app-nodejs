// This file sets up the express application, middleware, and routes for the bookstore application.

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const booksRoutes = require("./routes/books");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const uri =
  "mongodb+srv://ethlee1704:17042004Hieu@bookish.vqmlhw5.mongodb.net/?retryWrites=true&w=majority&appName=Bookish";
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes
app.use("/books", booksRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Trang chủ" }); // Thêm biến title
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
