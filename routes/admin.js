const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const Blog = require("../models/Blog");
const User = require("../models/User");
const Message = require("../models/Message");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

// Middleware to set admin layout for all admin routes
router.use((req, res, next) => {
  res.locals.layout = "layouts/admin_layout"; // Correct path relative to views
  next();
});

// Admin Dashboard
router.get("/", isAdmin, async (req, res) => {
  try {
    // Total Revenue from Orders
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenueAmount =
      totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Orders Placed
    const numberOfOrders = await Order.countDocuments();

    // Products Added
    const numberOfProducts = await Product.countDocuments();

    // Authors
    const numberOfAuthors = await Author.countDocuments();

    // Publishers
    const numberOfPublishers = await Publisher.countDocuments();

    // Blogs
    let numberOfBlogs = 0;
    try {
      numberOfBlogs = await Blog.countDocuments();
    } catch (err) {
      console.log("Blog model not found, setting blogs count to 0");
    }

    // Normal Users
    const numberOfUsers = await User.countDocuments({ userType: "user" });

    // Admin Users
    const numberOfAdmins = await User.countDocuments({ userType: "admin" });

    // Total Accounts
    const numberOfAccounts = await User.countDocuments();

    // New Messages
    const numberOfMessages = await Message.countDocuments();

    res.render("admin/dashboard", {
      // Changed from "page" to "dashboard"
      pageTitle: "Bookly - Admin Dashboard",
      user: res.locals.user,
      totalRevenue: totalRevenueAmount,
      numberOfOrders,
      numberOfProducts,
      numberOfAuthors,
      numberOfPublishers,
      numberOfBlogs,
      numberOfUsers,
      numberOfAdmins,
      numberOfAccounts,
      numberOfMessages,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    req.session.message = ["Error fetching dashboard data"];
    res.redirect("/admin");
  }
});

// Products Page
router.get("/products", isAdmin, async (req, res) => {
  try {
    const authors = await Author.find();
    const publishers = await Publisher.find();
    const products = await Product.find()
      .populate("author")
      .populate("publisher");
    res.render("admin/products", {
      pageTitle: "Admin - Products",
      user: res.locals.user,
      authors,
      publishers,
      products,
      updateProduct: null,
    });
  } catch (err) {
    console.error("Error fetching products page:", err);
    req.session.message = ["Error fetching products data"];
    res.redirect("/admin");
  }
});

// Add Product
router.post(
  "/products/add",
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        bookName,
        author,
        publisher,
        bookDescription,
        tag,
        publishYear,
        totalPage,
        price,
        stockQuantity, // <-- add this
      } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!image) {
        req.session.message = ["Image is required"];
        return res.redirect("/admin/products");
      }

      // Check if product already exists
      const existingProduct = await Product.findOne({ bookName });
      if (existingProduct) {
        req.session.message = ["Book name already added"];
        return res.redirect("/admin/products");
      }

      const product = new Product({
        bookName,
        author,
        publisher,
        bookDescription,
        tag: tag || "",
        publishYear: publishYear ? Number(publishYear) : undefined,
        totalPage: totalPage ? Number(totalPage) : undefined,
        price: Number(price),
        image,
        stockQuantity: stockQuantity ? Number(stockQuantity) : 0, // <-- use value from form
      });
      await product.save();
      req.session.message = ["Product added successfully!"];
      res.redirect("/admin/products");
    } catch (err) {
      console.error("Error adding product:", err);
      req.session.message = ["Error adding product"];
      res.redirect("/admin/products");
    }
  }
);

// Delete Product
router.get("/products/delete/:id", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.image) {
      const imagePath = path.join(
        __dirname,
        "../public/uploaded_images/",
        product.image
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    req.session.message = ["Product deleted successfully!"];
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error deleting product:", err);
    req.session.message = ["Error deleting product"];
    res.redirect("/admin/products");
  }
});

// Update Product - Show Form
router.get("/products/update/:id", isAdmin, async (req, res) => {
  try {
    const authors = await Author.find();
    const publishers = await Publisher.find();
    const products = await Product.find()
      .populate("author")
      .populate("publisher");
    const updateProduct = await Product.findById(req.params.id)
      .populate("author")
      .populate("publisher");
    res.render("admin/products", {
      pageTitle: "Admin - Products",
      user: res.locals.user,
      authors,
      publishers,
      products,
      updateProduct,
    });
  } catch (err) {
    console.error("Error fetching update product page:", err);
    req.session.message = ["Error fetching product data"];
    res.redirect("/admin/products");
  }
});

// Update Product - Handle Form Submission
router.post(
  "/products/update/:id",
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        bookName,
        author,
        publisher,
        bookDescription,
        tag,
        publishYear,
        totalPage,
        price,
        oldImage,
        stockQuantity, // <-- add this
      } = req.body;

      const updateData = {
        bookName,
        author,
        publisher,
        bookDescription,
        tag: tag || "",
        publishYear: publishYear ? Number(publishYear) : undefined,
        totalPage: totalPage ? Number(totalPage) : undefined,
        price: Number(price),
        stockQuantity: stockQuantity ? Number(stockQuantity) : 0, // <-- use value from form
      };

      if (req.file) {
        const oldImagePath = path.join(
          __dirname,
          "../public/uploaded_images/",
          oldImage
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        updateData.image = req.file.filename;
      }

      await Product.findByIdAndUpdate(req.params.id, updateData);
      req.session.message = ["Product updated successfully!"];
      res.redirect("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      req.session.message = ["Error updating product"];
      res.redirect("/admin/products");
    }
  }
);

// Authors Page
router.get("/authors", isAdmin, async (req, res) => {
  try {
    const authors = await Author.find();
    res.render("admin/authors", {
      pageTitle: "Admin - Authors",
      user: res.locals.user,
      authors,
      updateAuthor: null,
    });
  } catch (err) {
    console.error("Error fetching authors page:", err);
    req.session.message = ["Error fetching authors data"];
    res.redirect("/admin");
  }
});

// Add Author
router.post(
  "/authors/add",
  isAdmin,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { authorName } = req.body;
      const profilePicture = req.file
        ? req.file.filename
        : "No-profile-picture.jpeg";

      // Check if author already exists
      const existingAuthor = await Author.findOne({ authorName });
      if (existingAuthor) {
        req.session.message = ["Author name already exists"];
        return res.redirect("/admin/authors");
      }

      const author = new Author({
        authorName,
        profilePicture,
      });
      await author.save();
      req.session.message = ["Author added successfully!"];
      res.redirect("/admin/authors");
    } catch (err) {
      console.error("Error adding author:", err);
      req.session.message = ["Error adding author"];
      res.redirect("/admin/authors");
    }
  }
);

// Delete Author
router.get("/authors/delete/:id", isAdmin, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    // Check if author is referenced in any products
    const productsWithAuthor = await Product.find({ author: req.params.id });
    if (productsWithAuthor.length > 0) {
      req.session.message = ["Cannot delete author: Referenced in products"];
      return res.redirect("/admin/authors");
    }

    if (
      author.profilePicture &&
      author.profilePicture !== "No-profile-picture.jpeg"
    ) {
      const imagePath = path.join(
        __dirname,
        "../public/uploaded_images/",
        author.profilePicture
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Author.findByIdAndDelete(req.params.id);
    req.session.message = ["Author deleted successfully!"];
    res.redirect("/admin/authors");
  } catch (err) {
    console.error("Error deleting author:", err);
    req.session.message = ["Error deleting author"];
    res.redirect("/admin/authors");
  }
});

// Update Author - Show Form
router.get("/authors/update/:id", isAdmin, async (req, res) => {
  try {
    const authors = await Author.find();
    const updateAuthor = await Author.findById(req.params.id);
    res.render("admin/authors", {
      pageTitle: "Admin - Authors",
      user: res.locals.user,
      authors,
      updateAuthor,
    });
  } catch (err) {
    console.error("Error fetching update author page:", err);
    req.session.message = ["Error fetching author data"];
    res.redirect("/admin/authors");
  }
});

// Update Author - Handle Form Submission
router.post(
  "/authors/update/:id",
  isAdmin,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { authorName } = req.body;
      const oldProfilePicture = req.body.oldProfilePicture;

      const updateData = { authorName };

      if (req.file) {
        if (
          oldProfilePicture &&
          oldProfilePicture !== "No-profile-picture.jpeg"
        ) {
          const oldImagePath = path.join(
            __dirname,
            "../public/uploaded_images/",
            oldProfilePicture
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.profilePicture = req.file.filename;
      }

      await Author.findByIdAndUpdate(req.params.id, updateData);
      req.session.message = ["Author updated successfully!"];
      res.redirect("/admin/authors");
    } catch (err) {
      console.error("Error updating author:", err);
      req.session.message = ["Error updating author"];
      res.redirect("/admin/authors");
    }
  }
);

// Publishers Page
router.get("/publishers", isAdmin, async (req, res) => {
  try {
    const publishers = await Publisher.find();
    res.render("admin/publishers", {
      pageTitle: "Admin - Publishers",
      user: res.locals.user,
      publishers,
      updatePublisher: null,
    });
  } catch (err) {
    console.error("Error fetching publishers page:", err);
    req.session.message = ["Error fetching publishers data"];
    res.redirect("/admin");
  }
});

// Add Publisher
router.post(
  "/publishers/add",
  isAdmin,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { publisherName } = req.body;
      const profileImage = req.file
        ? req.file.filename
        : "No-profile-picture.jpeg";

      // Check if publisher already exists
      const existingPublisher = await Publisher.findOne({ publisherName });
      if (existingPublisher) {
        req.session.message = ["Publisher name already exists"];
        return res.redirect("/admin/publishers");
      }

      const publisher = new Publisher({
        publisherName,
        profileImage,
      });
      await publisher.save();
      req.session.message = ["Publisher added successfully!"];
      res.redirect("/admin/publishers");
    } catch (err) {
      console.error("Error adding publisher:", err);
      req.session.message = ["Error adding publisher"];
      res.redirect("/admin/publishers");
    }
  }
);

// Delete Publisher
router.get("/publishers/delete/:id", isAdmin, async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    // Check if publisher is referenced in any products
    const productsWithPublisher = await Product.find({
      publisher: req.params.id,
    });
    if (productsWithPublisher.length > 0) {
      req.session.message = ["Cannot delete publisher: Referenced in products"];
      return res.redirect("/admin/publishers");
    }

    if (
      publisher.profileImage &&
      publisher.profileImage !== "No-profile-picture.jpeg"
    ) {
      const imagePath = path.join(
        __dirname,
        "../public/uploaded_images/",
        publisher.profileImage
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Publisher.findByIdAndDelete(req.params.id);
    req.session.message = ["Publisher deleted successfully!"];
    res.redirect("/admin/publishers");
  } catch (err) {
    console.error("Error deleting publisher:", err);
    req.session.message = ["Error deleting publisher"];
    res.redirect("/admin/publishers");
  }
});

// Update Publisher - Show Form
router.get("/publishers/update/:id", isAdmin, async (req, res) => {
  try {
    const publishers = await Publisher.find();
    const updatePublisher = await Publisher.findById(req.params.id);
    res.render("admin/publishers", {
      pageTitle: "Admin - Publishers",
      user: res.locals.user,
      publishers,
      updatePublisher,
    });
  } catch (err) {
    console.error("Error fetching update publisher page:", err);
    req.session.message = ["Error fetching publisher data"];
    res.redirect("/admin/publishers");
  }
});

// Update Publisher - Handle Form Submission
router.post(
  "/publishers/update/:id",
  isAdmin,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { publisherName } = req.body;
      const oldProfileImage = req.body.oldProfileImage;

      const updateData = { publisherName };

      if (req.file) {
        if (oldProfileImage && oldProfileImage !== "No-profile-picture.jpeg") {
          const oldImagePath = path.join(
            __dirname,
            "../public/uploaded_images/",
            oldProfileImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.profileImage = req.file.filename;
      }

      await Publisher.findByIdAndUpdate(req.params.id, updateData);
      req.session.message = ["Publisher updated successfully!"];
      res.redirect("/admin/publishers");
    } catch (err) {
      console.error("Error updating publisher:", err);
      req.session.message = ["Error updating publisher"];
      res.redirect("/admin/publishers");
    }
  }
);

// Blogs Page
router.get("/blogs", isAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render("admin/blogs", {
      pageTitle: "Admin - Blogs",
      user: res.locals.user,
      blogs,
      updateBlog: null,
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    req.session.message = ["Error fetching blogs"];
    res.redirect("/admin");
  }
});

// Add Blog
router.post("/blogs/add", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;

    const existingBlog = await Blog.findOne({ title });
    if (existingBlog) {
      req.session.message = ["Blog title already exists"];
      return res.redirect("/admin/blogs");
    }

    const blog = new Blog({
      title,
      content,
      image,
      author: res.locals.user._id, // Associate with logged-in admin
    });
    await blog.save();
    req.session.message = ["Blog added successfully!"];
    res.redirect("/admin/blogs");
  } catch (err) {
    console.error("Error adding blog:", err);
    req.session.message = ["Error adding blog"];
    res.redirect("/admin/blogs");
  }
});

// Update Blog - Show Form
router.get("/blogs/update/:id", isAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find();
    const updateBlog = await Blog.findById(req.params.id);
    if (!updateBlog) {
      req.session.message = ["Blog not found"];
      return res.redirect("/admin/blogs");
    }
    res.render("admin/blogs", {
      pageTitle: "Admin - Blogs",
      user: res.locals.user,
      blogs,
      updateBlog,
    });
  } catch (err) {
    console.error("Error fetching update blog page:", err);
    req.session.message = ["Error fetching blog data"];
    res.redirect("/admin/blogs");
  }
});

// Update Blog - Handle Form Submission
router.post(
  "/blogs/update/:id",
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content, oldImage } = req.body;

      const updateData = {
        title,
        content,
        updatedAt: Date.now(),
      };

      if (req.file) {
        if (oldImage) {
          const oldImagePath = path.join(
            __dirname,
            "../public/uploaded_images/",
            oldImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.image = req.file.filename;
      }

      await Blog.findByIdAndUpdate(req.params.id, updateData);
      req.session.message = ["Blog updated successfully!"];
      res.redirect("/admin/blogs");
    } catch (err) {
      console.error("Error updating blog:", err);
      req.session.message = ["Error updating blog"];
      res.redirect("/admin/blogs");
    }
  }
);

// Delete Blog
router.get("/blogs/delete/:id", isAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.session.message = ["Blog not found"];
      return res.redirect("/admin/blogs");
    }
    if (blog.image) {
      const imagePath = path.join(
        __dirname,
        "../public/uploaded_images/",
        blog.image
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Blog.findByIdAndDelete(req.params.id);
    req.session.message = ["Blog deleted successfully!"];
    res.redirect("/admin/blogs");
  } catch (err) {
    console.error("Error deleting blog:", err);
    req.session.message = ["Error deleting blog"];
    res.redirect("/admin/blogs");
  }
});

// Orders Page
router.get("/orders", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user");
    res.render("admin/orders", {
      pageTitle: "Admin - Orders",
      user: res.locals.user,
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    req.session.message = ["Error fetching orders"];
    res.redirect("/admin");
  }
});

// Update Order - Show Form
router.get("/orders/update/:id", isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user");
    if (!order) {
      req.session.message = ["Order not found"];
      return res.redirect("/admin/orders");
    }
    res.render("admin/orders_update", {
      pageTitle: "Admin - Update Order",
      user: res.locals.user,
      order,
    });
  } catch (err) {
    console.error("Error fetching update order page:", err);
    req.session.message = ["Error fetching order data"];
    res.redirect("/admin/orders");
  }
});

// Update Order - Handle Form Submission
router.post("/orders/update/:id", isAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ["Pending", "Completed", "Failed"];
    if (!validStatuses.includes(paymentStatus)) {
      req.session.message = ["Invalid status"];
      return res.redirect("/admin/orders");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      req.session.message = ["Order not found"];
      return res.redirect("/admin/orders");
    }

    // If transitioning from Pending to Completed, update stock
    if (order.paymentStatus === "Pending" && paymentStatus === "Completed") {
      if (!order.totalProducts) {
        req.session.message = ["No products listed in order"];
        return res.redirect("/admin/orders");
      }

      // Parse totalProducts (e.g., "The Day That Turns Your Life Around (1), 1984 (2)")
      const items = order.totalProducts.split(", ");
      const productUpdates = [];

      for (const item of items) {
        // Match "BookName (Quantity)"
        const match = item.match(/^(.+)\s\((\d+)\)$/);
        if (!match) {
          req.session.message = [`Invalid product format: ${item}`];
          return res.redirect("/admin/orders");
        }

        const bookName = match[1].trim();
        const quantity = parseInt(match[2]);

        if (isNaN(quantity) || quantity <= 0) {
          req.session.message = [
            `Invalid quantity for ${bookName}: ${match[2]}`,
          ];
          return res.redirect("/admin/orders");
        }

        const product = await Product.findOne({ bookName });
        if (!product) {
          req.session.message = [`Product not found: ${bookName}`];
          return res.redirect("/admin/orders");
        }

        if (product.stockQuantity < quantity) {
          req.session.message = [
            `Insufficient stock for ${bookName}: ${product.stockQuantity} available`,
          ];
          return res.redirect("/admin/orders");
        }

        productUpdates.push({
          productId: product._id,
          quantity,
        });
      }

      // Update stock quantities
      for (const update of productUpdates) {
        const result = await Product.findByIdAndUpdate(update.productId, {
          $inc: { stockQuantity: -update.quantity },
        });
        console.log(
          `Updated stock for product ${update.productId}: deducted ${update.quantity}`
        );
      }
    }

    // Update order status
    const result = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    console.log(`Updated order ${req.params.id}: new status ${paymentStatus}`);
    req.session.message = ["Order updated successfully!"];
    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error updating order:", err);
    req.session.message = ["Error updating order"];
    res.redirect("/admin/orders");
  }
});

// Delete Order
router.get("/orders/delete/:id", isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      req.session.message = ["Order not found"];
      return res.redirect("/admin/orders");
    }
    await Order.findByIdAndDelete(req.params.id);
    console.log(`Deleted order ${req.params.id}`);
    req.session.message = ["Order deleted successfully!"];
    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error deleting order:", err);
    req.session.message = ["Error deleting order"];
    res.redirect("/admin/orders");
  }
});

// Users Page
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin/users", {
      pageTitle: "Admin - Users",
      user: res.locals.user,
      users,
      updateUser: null,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    req.session.message = ["Error fetching users"];
    res.redirect("/admin");
  }
});

// Add User
router.post("/users/add", isAdmin, async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Validate inputs
    if (!name || !email || !password || !userType) {
      req.session.message = ["All fields are required"];
      return res.redirect("/admin/users");
    }
    if (password.length < 6) {
      req.session.message = ["Password must be at least 6 characters"];
      return res.redirect("/admin/users");
    }
    if (!["user", "admin"].includes(userType)) {
      req.session.message = ["Invalid user type"];
      return res.redirect("/admin/users");
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.session.message = ["Email already exists"];
      return res.redirect("/admin/users");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType,
    });
    await user.save();

    req.session.message = ["User added successfully!"];
    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error adding user:", err);
    req.session.message = ["Error adding user"];
    res.redirect("/admin/users");
  }
});

// Update User - Show Form
router.get("/users/update/:id", isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    const updateUser = await User.findById(req.params.id);
    if (!updateUser) {
      req.session.message = ["User not found"];
      return res.redirect("/admin/users");
    }
    res.render("admin/users", {
      pageTitle: "Admin - Users",
      user: res.locals.user,
      users,
      updateUser,
    });
  } catch (err) {
    console.error("Error fetching update user page:", err);
    req.session.message = ["Error fetching user data"];
    res.redirect("/admin/users");
  }
});

// Update User - Handle Form Submission
router.post("/users/update/:id", isAdmin, async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Validate inputs
    if (!name || !email || !userType) {
      req.session.message = ["Name, email, and user type are required"];
      return res.redirect("/admin/users");
    }
    if (!["user", "admin"].includes(userType)) {
      req.session.message = ["Invalid user type"];
      return res.redirect("/admin/users");
    }

    // Check if email is taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      req.session.message = ["Email already exists"];
      return res.redirect("/admin/users");
    }

    // Prepare update data
    const updateData = { name, email, userType };
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    } else if (password && password.length < 6) {
      req.session.message = ["Password must be at least 6 characters"];
      return res.redirect("/admin/users");
    }

    // Prevent demoting the current admin
    if (
      req.params.id === res.locals.user._id.toString() &&
      userType !== "admin"
    ) {
      req.session.message = ["Cannot change your own user type to non-admin"];
      return res.redirect("/admin/users");
    }

    await User.findByIdAndUpdate(req.params.id, updateData);
    req.session.message = ["User updated successfully!"];
    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error updating user:", err);
    req.session.message = ["Error updating user"];
    res.redirect("/admin/users");
  }
});

// Delete User
router.get("/users/delete/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.session.message = ["User not found"];
      return res.redirect("/admin/users");
    }
    if (user._id.toString() === res.locals.user._id.toString()) {
      req.session.message = ["Cannot delete your own account"];
      return res.redirect("/admin/users");
    }
    const ordersWithUser = await Order.find({ user: req.params.id });
    if (ordersWithUser.length > 0) {
      req.session.message = ["Cannot delete user: Has associated orders"];
      return res.redirect("/admin/users");
    }
    await User.findByIdAndDelete(req.params.id);
    req.session.message = ["User deleted successfully!"];
    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error deleting user:", err);
    req.session.message = ["Error deleting user"];
    res.redirect("/admin/users");
  }
});

// Messages Page
router.get("/messages", isAdmin, async (req, res) => {
  try {
    const messages = await Message.find();
    res.render("admin/messages", {
      pageTitle: "Admin - Messages",
      user: res.locals.user,
      messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    req.session.message = ["Error fetching messages"];
    res.redirect("/admin");
  }
});

// Delete Message
router.get("/messages/delete/:id", isAdmin, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      req.session.message = ["Message not found"];
      return res.redirect("/admin/messages");
    }
    await Message.findByIdAndDelete(req.params.id);
    req.session.message = ["Message deleted successfully!"];
    res.redirect("/admin/messages");
  } catch (err) {
    console.error("Error deleting message:", err);
    req.session.message = ["Error deleting message"];
    res.redirect("/admin/messages");
  }
});

module.exports = router;
