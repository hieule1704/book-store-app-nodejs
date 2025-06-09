const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Get cart count for the logged-in user
router.get("/count", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ count: 0 });
  }
  try {
    const count = await Cart.countDocuments({ user: req.session.userId });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ count: 0 });
  }
});

// View cart
router.get("/", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const cartItems = await Cart.find({ user: req.session.userId }).populate(
      "product"
    );
    let grandTotal = 0;
    if (cartItems.length > 0) {
      grandTotal = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    }
    res.render("pages/cart", {
      pageTitle: "Bookly - Cart",
      user: res.locals.user,
      cartItems,
      grandTotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update cart quantity
router.post("/update", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const { cart_id, cart_quantity } = req.body;
  try {
    await Cart.findByIdAndUpdate(cart_id, {
      quantity: parseInt(cart_quantity),
    });
    req.session.message = ["Cart quantity updated!"];
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    req.session.message = ["Error updating cart"];
    res.redirect("/cart");
  }
});

// Delete single item from cart
router.get("/delete/:id", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.redirect("/cart");
  }
});

// Delete all items from cart
router.get("/delete_all", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    await Cart.deleteMany({ user: req.session.userId });
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.redirect("/cart");
  }
});

// Checkout for a single product ("Buy Now")
router.get("/checkout/:productId", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      req.session.message = ["Product not found"];
      return res.redirect("/home");
    }
    const quantity = parseInt(req.query.quantity) || 1;
    const buyNowProduct = {
      id: product._id,
      name: product.bookName,
      price: product.price,
      image: product.image,
      quantity: quantity,
    };
    res.render("pages/checkout", {
      pageTitle: "Bookly - Checkout",
      user: res.locals.user,
      buyNowProduct,
      cartItems: null,
      grandTotal: buyNowProduct.price * buyNowProduct.quantity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Checkout for cart items
router.get("/checkout", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  try {
    const cartItems = await Cart.find({ user: req.session.userId }).populate(
      "product"
    );
    let grandTotal = 0;
    if (cartItems.length > 0) {
      grandTotal = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    }
    res.render("pages/checkout", {
      pageTitle: "Bookly - Checkout",
      user: res.locals.user,
      buyNowProduct: null,
      cartItems,
      grandTotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/checkout", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const {
    name,
    number,
    email,
    method,
    flat,
    street,
    city,
    state,
    country,
    pin_code,
    buy_now,
    product_id,
    product_name,
    product_price,
    product_image,
    product_quantity,
  } = req.body;
  const address = `Flat no. ${flat}, ${street}, ${city}, ${state}, ${country} - ${pin_code}`;
  const placedOn = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let cartTotal = 0;
  let cartProducts = [];
  let isBuyNow = buy_now === "1";

  try {
    if (isBuyNow) {
      const product = await Product.findById(product_id);
      if (!product) {
        req.session.message = ["Product not found"];
        return res.redirect("/cart");
      }
      if (product.stockQuantity < parseInt(product_quantity)) {
        req.session.message = [`Insufficient stock for ${product.bookName}`];
        return res.redirect("/cart");
      }
      cartProducts.push(`${product_name} (${product_quantity})`);
      cartTotal = product_price * product_quantity;
      await Product.updateOne(
        { _id: product_id },
        { $inc: { stockQuantity: -parseInt(product_quantity) } }
      );
    } else {
      const cartItems = await Cart.find({ user: req.session.userId }).populate(
        "product"
      );
      if (!cartItems.length) {
        req.session.message = ["Your cart is empty"];
        return res.redirect("/cart");
      }
      for (const item of cartItems) {
        if (!item.product) {
          req.session.message = [`Product not found in cart`];
          return res.redirect("/cart");
        }
        if (item.product.stockQuantity < item.quantity) {
          req.session.message = [
            `Insufficient stock for ${item.product.bookName}`,
          ];
          return res.redirect("/cart");
        }
        cartProducts.push(`${item.product.bookName} (${item.quantity})`);
        cartTotal += item.product.price * item.quantity;
        await Product.updateOne(
          { _id: item.product._id },
          { $inc: { stockQuantity: -item.quantity } }
        );
      }
      await Cart.deleteMany({ user: req.session.userId });
    }

    const totalProducts = cartProducts.join(", ");

    const order = new Order({
      user: req.session.userId,
      name,
      number,
      email,
      method,
      address,
      totalProducts,
      totalPrice: cartTotal,
      placedOn,
    });
    await order.save();

    req.session.message = ["Order placed successfully!"];
    res.redirect("/orders/orders");
  } catch (err) {
    console.error("Error placing order:", err);
    req.session.message = ["Error placing order"];
    res.redirect("/cart/checkout");
  }
});

// POST /add
router.post("/add", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const {
    product_id,
    product_name,
    product_price,
    product_image,
    product_quantity,
  } = req.body;

  try {
    // Validate product exists
    const product = await Product.findById(product_id);
    if (!product) {
      req.session.message = ["Product not found"];
      return res.redirect("/books/shop");
    }

    // Check or update cart
    let cartItem = await Cart.findOne({
      user: req.session.userId,
      product: product_id,
    });

    if (cartItem) {
      cartItem.quantity += parseInt(product_quantity) || 1;
      await cartItem.save();
      req.session.message = ["Product quantity updated in cart!"];
    } else {
      cartItem = new Cart({
        user: req.session.userId,
        product: product_id,
        quantity: parseInt(product_quantity) || 1,
      });
      await cartItem.save();
      req.session.message = ["Product added to cart!"];
    }

    res.redirect("/books/shop");
  } catch (err) {
    console.error("Error adding to cart:", err);
    req.session.message = ["Error adding to cart"];
    res.redirect("/books/shop");
  }
});

module.exports = router;
