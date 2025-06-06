document.addEventListener("DOMContentLoaded", function () {
  // Ensure Bootstrap dropdowns work (if any)
  var dropdownElementList = [].slice.call(
    document.querySelectorAll(".dropdown-toggle")
  );
  dropdownElementList.map(function (dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl);
  });

  // Update cart count dynamically (example)
  function updateCartCount() {
    fetch("/cart/count")
      .then((response) => response.json())
      .then((data) => {
        const cartCountElement = document.querySelector("#cart-count");
        if (cartCountElement) {
          cartCountElement.textContent = data.count;
        }
      })
      .catch((error) => console.error("Error fetching cart count:", error));
  }

  // Call updateCartCount on page load
  updateCartCount();

  // Example: Update cart count after adding to cart (listen for form submissions)
  const addToCartForms = document.querySelectorAll(
    'form[action="/home"], form[action^="/detail/"]'
  );
  addToCartForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      setTimeout(updateCartCount, 500); // Update count after submission
    });
  });

  // Example: Search functionality (if search bar exists in header)
  const searchForm = document.querySelector("#search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = searchForm.querySelector('input[name="query"]').value;
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    });
  }
});
