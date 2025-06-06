// Function to update cart count dynamically (optional, if real-time updates are needed)
function updateCartCount() {
  fetch("/cart/count", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.count) {
        document.querySelector("#cart-count").textContent = data.count;
      }
    })
    .catch((error) => console.error("Error fetching cart count:", error));
}

// Call updateCartCount on page load and every 30 seconds
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setInterval(updateCartCount, 30000); // Update every 30 seconds
});

// Ensure Bootstrap dropdowns and toggles work
document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    e.preventDefault();
    const dropdownMenu = dropdown.nextElementSibling;
    dropdownMenu.classList.toggle("show");
  });
});
    