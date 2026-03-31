// DOM Elements
const productsList = document.getElementById("productsList");
const searchBox = document.getElementById("searchBox");
const categoryDropdown = document.getElementById("categoryDropdown");
const categoriesButton = document.getElementById("categoriesButton");
const sortButton = document.getElementById("sortButton");
const sortDropdown = document.getElementById("sortDropdown");

// QUICK VIEW MODAL ELEMENTS
const quickViewModal = document.getElementById("quickViewModal");
const closeModal = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalBrand = document.getElementById("modalBrand");
const modalPrice = document.getElementById("modalPrice");
const modalStock = document.getElementById("modalStock");
const modalAddToCart = document.getElementById("modalAddToCart");
let currentProductId = null;

// State
let allProducts = [];
let selectedCategory = "All";
let currentSort = "";
let productsToShow = 6;
const increment = 6;

// ------------------- DROPDOWNS -------------------
categoriesButton.addEventListener("click", e => {
  e.stopPropagation();
  categoryDropdown.classList.toggle("hidden");
});

sortButton.addEventListener("click", e => {
  e.stopPropagation();
  sortDropdown.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  categoryDropdown.classList.add("hidden");
  sortDropdown.classList.add("hidden");
});

sortDropdown.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    currentSort = btn.dataset.sort;
    productsToShow = increment;
    renderProducts(filterByCategoryAndSearch());
    sortDropdown.classList.add("hidden");
  });
});

// ------------------- FETCH PRODUCTS -------------------
async function fetchProducts(search = "") {
  try {
    const res = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(search)}`);
    const products = await res.json();
    // Map _id to id for consistency
    allProducts = products.map(p => ({
      ...p,
      id: p._id || p.id
    }));
    renderCategoryDropdown(allProducts);
    renderProducts(filterByCategoryAndSearch());
  } catch (err) {
    console.error("Failed to fetch products", err);
  }
}

// Render categories dynamically
function renderCategoryDropdown(products) {
  if (!categoryDropdown) return;

  const categories = ["All", ...new Set(products.map(p => p.category))];
  categoryDropdown.innerHTML = "";

  categories.forEach(category => {
    const item = document.createElement("button");
    item.textContent = category;
    item.className = `block w-full text-left px-4 py-2 hover:bg-yellow-500 hover:text-black transition
                      ${selectedCategory === category ? "bg-yellow-500 text-black" : ""}`;
    item.addEventListener("click", e => {
      e.stopPropagation();
      selectedCategory = category;
      productsToShow = increment;
      renderProducts(filterByCategoryAndSearch());
      renderCategoryDropdown(allProducts);
      categoryDropdown.classList.add("hidden");
    });
    categoryDropdown.appendChild(item);
  });
}

// ------------------- FILTER & SORT -------------------
function filterByCategoryAndSearch() {
  const query = searchBox.value.toLowerCase();
  let filtered = allProducts.filter(p => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (currentSort === "low") filtered.sort((a, b) => a.price - b.price);
  else if (currentSort === "high") filtered.sort((a, b) => b.price - a.price);

  return filtered;
}

// ------------------- RENDER PRODUCTS -------------------
function renderProducts(products) {
  const toRender = products.slice(0, productsToShow);
  productsList.innerHTML = "";
  if (toRender.length === 0) {
    productsList.innerHTML = "<p class='text-gray-300 col-span-full text-center'>No products found.</p>";
    return;
  }

  toRender.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "bg-gray-900 p-4 rounded shadow text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl";

    productCard.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover mb-4 rounded cursor-pointer" onclick="openQuickView('${product.id}')">
      <h3 class="text-lg font-bold text-yellow-400 cursor-pointer" onclick="openQuickView('${product.id}')">${product.name}</h3>
      <p class="text-gray-300">Brand: ${product.brand}</p>
      <p class="text-gray-300">Price: ₱${product.price}</p>
      <p class="text-gray-300">Stock: ${product.stock}</p>
      <button class="mt-2 px-4 py-2 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400 hover:scale-105 transition transform duration-200"
        ${product.stock === 0 ? "disabled" : ""}
        onclick="addToCart('${product.id}')">
        ${product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    `;
    productsList.appendChild(productCard);
  });
}

// ------------------- SEARCH -------------------
searchBox.addEventListener("input", () => {
  productsToShow = increment;
  renderProducts(filterByCategoryAndSearch());
});

// ------------------- QUICK VIEW -------------------
function openQuickView(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  currentProductId = productId;
  modalImage.src = product.imageUrl;
  modalName.textContent = product.name;
  modalBrand.textContent = `Brand: ${product.brand}`;
  modalPrice.textContent = `Price: ₱${product.price}`;
  modalStock.textContent = `Stock: ${product.stock}`;
  modalAddToCart.disabled = product.stock === 0;

  quickViewModal.classList.remove("hidden");
  setTimeout(() => quickViewModal.classList.add("opacity-100"), 10);
  quickViewModal.querySelector("div").classList.add("scale-100");
}

function closeQuickView() {
  quickViewModal.classList.remove("opacity-100");
  quickViewModal.querySelector("div").classList.remove("scale-100");
  setTimeout(() => quickViewModal.classList.add("hidden"), 300);
}

closeModal.addEventListener("click", closeQuickView);
quickViewModal.addEventListener("click", e => {
  if (e.target === quickViewModal) closeQuickView();
});

modalAddToCart.addEventListener("click", () => {
  if (!currentProductId) return;
  addToCart(currentProductId);
  closeQuickView();
});

// ------------------- CART -------------------
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const index = cart.findIndex(item => item.id === product.id);

  if (index > -1) {
    cart[index].quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      brand: product.brand
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart`);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

// ------------------- INIT -------------------
window.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  updateCartCount();
});
