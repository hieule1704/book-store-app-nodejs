const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const Cart = require("../models/Cart");

// GET /home
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

// POST /home (Add to Cart)
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
    let cartItem = await Cart.findOne({
      user: req.session.userId,
      product: product_id,
    });
    if (cartItem) {
      cartItem.quantity += parseInt(product_quantity);
      await cartItem.save();
    } else {
      cartItem = new Cart({
        user: req.session.userId,
        product: product_id,
        quantity: parseInt(product_quantity),
      });
      await cartItem.save();
    }
    req.session.message = ["Product added to cart!"];
    res.redirect("/books/home");
  } catch (err) {
    console.error(err);
    req.session.message = ["Error adding to cart"];
    res.redirect("/books/home");
  }
});

// GET /shop
router.get("/shop", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const search = req.query.search || "";
    const filterAuthor = req.query.author || "";
    const filterPublisher = req.query.publisher || "";

    // Fetch authors and publishers for ribbons
    const authors = await Author.find();
    const publishers = await Publisher.find();

    // Build query for products
    const query = {};
    if (search) {
      query.bookName = { $regex: search, $options: "i" };
    }
    if (filterAuthor) {
      query.author = filterAuthor;
    }
    if (filterPublisher) {
      query.publisher = filterPublisher;
    }

    const products = await Product.find(query).populate("author publisher");

    res.render("pages/shop", {
      pageTitle: "Bookly - Shop",
      products,
      authors,
      publishers,
      search,
      filterAuthor,
      filterPublisher,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST /shop (Add to Cart)
router.post("/shop", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const {
    product_id,
    product_name,
    product_price,
    product_image,
    product_quantity,
    add_to_cart,
    buy_now,
  } = req.body;

  try {
    if (add_to_cart) {
      let cartItem = await Cart.findOne({
        user: req.session.userId,
        product: product_id,
      });
      if (cartItem) {
        req.session.message = ["Already added to cart!"];
      } else {
        cartItem = new Cart({
          user: req.session.userId,
          product: product_id,
          quantity: parseInt(product_quantity),
        });
        await cartItem.save();
        req.session.message = ["Product added to cart!"];
      }
      res.redirect("/books/shop");
    } else if (buy_now) {
      // For "Buy Now", redirect to checkout with the single product
      res.redirect(`/cart/checkout/${product_id}?quantity=${product_quantity}`);
    }
  } catch (err) {
    console.error(err);
    req.session.message = ["Error adding to cart"];
    res.redirect("/books/shop");
  }
});

// GET /detail/:id
router.get("/detail/:id", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const product = await Product.findById(req.params.id).populate(
      "author publisher"
    );
    if (!product) {
      req.session.message = ["Product not found"];
      return res.redirect("/books/shop");
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

router.get("/about", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.render("pages/about", {
    pageTitle: "Bookly - About",
    user: res.locals.user
  });
});

router.get("/contact", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.render("pages/contact", {
    pageTitle: "Bookly - Contact",
    user: res.locals.user
  });
});
module.exports = router;
