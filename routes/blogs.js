const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

router.get("/blog", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author");
    res.render("pages/blog", {
      pageTitle: "Bookly - Blogs",
      blogs,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/blog/detail/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author");
    if (!blog) return res.status(404).send("Blog not found");
    res.render("pages/blog_detail", {
      pageTitle: `Bookly - ${blog.title}`,
      blog,
      user: res.locals.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
