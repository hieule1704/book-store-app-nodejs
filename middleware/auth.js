const isAdmin = (req, res, next) => {
  if (!req.session.userId) {
    req.session.message = ["Please login first"];
    return res.redirect("/login");
  }
  if (req.session.userType !== "admin") {
    req.session.message = ["Access denied: Admins only"];
    return res.redirect("/books/home");
  }
  next();
};

module.exports = { isAdmin };
