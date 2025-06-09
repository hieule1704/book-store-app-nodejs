const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

router.get("/blog", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "authorName");
    res.render("pages/blog", {
      pageTitle: "Bookly - Blogs",
      blogs,
      user: res.locals.user,
      messages: blogs.length ? [] : ["No blogs available"],
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.render("pages/blog", {
      pageTitle: "Bookly - Blogs",
      blogs: [],
      user: res.locals.user,
      messages: ["Error loading blogs"],
    });
  }
});

router.get("/blog/blog_detail/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "authorName"
    );
    if (!blog) {
      req.session.message = ["Blog not found"];
      return res.redirect("/blogs/blog");
    }
    res.render("pages/blog_detail", {
      pageTitle: `Bookly - ${blog.title || "Blog Detail"}`,
      blog,
      user: res.locals.user,
      messages: [],
    });
  } catch (err) {
    console.error("Error fetching blog detail:", err);
    req.session.message = ["Error loading blog"];
    res.redirect("/blogs/blog");
  }
});

module.exports = router;
