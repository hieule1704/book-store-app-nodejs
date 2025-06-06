const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Message = require("../models/Message");
const Cart = require("../models/Cart");

router.get("/home", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const latestProducts = await Product.find()
      .sort({ _id: -1 })
      .limit(8)
      .populate("author publisher");
    const bestSellers = await Product.find({ tag: "bestseller" })
      .limit(8)
      .populate("author publisher");
    res.render("pages/home", {
      pageTitle: "Bookly - Home",
      latestProducts,
      bestSellers,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/home", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const {
    product_id,
    product_name,
    product_price,
    product_image,
    product_quantity,
  } = req.body;
  try {
    const existingCartItem = await Cart.findOne({
      user: req.session.userId,
      product: product_id,
    });
    if (existingCartItem) {
      req.session.message = ["Already added to cart!"]; // Array format
      return res.redirect("/books/home");
    }
    const cartItem = new Cart({
      user: req.session.userId,
      product: product_id,
      quantity: parseInt(product_quantity),
    });
    await cartItem.save();
    req.session.message = ["Product added to cart!"]; // Array format
    res.redirect("/books/home");
  } catch (err) {
    console.error(err);
    req.session.message = ["Error adding to cart"]; // Array format
    res.redirect("/books/home");
  }
});

router.get("/about", (req, res) => {
  res.render("pages/about", {
    pageTitle: "Bookly - About",
    user: res.locals.user,
  });
});

router.get("/contact", (req, res) => {
  res.render("pages/contact", {
    pageTitle: "Bookly - Contact",
    user: res.locals.user,
  });
});

router.post("/contact", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const { name, email, number, message } = req.body;
  try {
    const existingMessage = await Message.findOne({
      name,
      email,
      number,
      message,
    });
    if (existingMessage) {
      req.session.message = ["Message sent already!"];
      return res.redirect("/books/contact");
    }
    const newMessage = new Message({
      user: req.session.userId,
      name,
      email,
      number,
      message,
    });
    await newMessage.save();
    req.session.message = ["Message sent successfully!"];
    res.redirect("/books/contact");
  } catch (err) {
    console.error(err);
    req.session.message = ["Error sending message"];
    res.redirect("/books/contact");
  }
});

router.get("/shop", async (req, res) => {
  try {
    const products = await Product.find().populate("author publisher");
    res.render("pages/shop", {
      pageTitle: "Bookly - Shop",
      products,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/search", (req, res) => {
  res.render("pages/search", {
    pageTitle: "Bookly - Search",
    user: res.locals.user,
  });
});

router.get("/detail/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "author publisher"
    );
    if (!product) {
      req.session.message = ["Product not found"];
      return res.redirect("/books/home");
    }
    res.render("pages/detail", {
      pageTitle: `Bookly - ${product.bookName}`,
      product,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/detail/:id", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const productId = req.params.id;
  const { product_quantity } = req.body;
  try {
    const product = await Product.findById(productId).populate(
      "author publisher"
    );
    if (!product) {
      req.session.message = ["Product not found"];
      return res.redirect("/books/home");
    }
    const existingCartItem = await Cart.findOne({
      user: req.session.userId,
      product: productId,
    });
    if (existingCartItem) {
      req.session.message = ["Sản phẩm đã có trong giỏ hàng!"];
      return res.redirect(`/books/detail/${productId}`);
    }
    const cartItem = new Cart({
      user: req.session.userId,
      product: productId,
      quantity: parseInt(product_quantity || 1),
    });
    await cartItem.save();
    req.session.message = ["Đã thêm vào giỏ hàng!"];
    res.redirect(`/books/detail/${productId}`);
  } catch (err) {
    console.error(err);
    req.session.message = ["Error adding to cart"];
    res.redirect(`/books/detail/${productId}`);
  }
});

module.exports = router;
