const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/home", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ _id: -1 })
      .limit(8)
      .populate("author publisher");
    res.render("pages/home", {
      pageTitle: "Bookly - Home",
      products,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
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

router.get("/detail/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "author publisher"
    );
    if (!product) return res.status(404).send("Book not found");
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

module.exports = router;
