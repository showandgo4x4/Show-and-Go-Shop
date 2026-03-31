// ----- CART.JS -----
const cartList = document.getElementById("cartList");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ----- RENDER CART -----
function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = `<p class="text-gray-300 text-center">Your cart is empty.</p>`;
    cartTotalEl.textContent = "0";
    checkoutBtn.disabled = true;
    checkoutBtn.classList.add("opacity-50", "cursor-not-allowed");
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.classList.remove("opacity-50", "cursor-not-allowed");

  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const cartItem = document.createElement("div");
    cartItem.className = "flex justify-between items-center bg-gray-900 p-4 rounded shadow";

    cartItem.innerHTML = `
      <div>
        <p class="font-bold text-yellow-400">${item.name}</p>
        <p>Price: ₱${item.price}</p>
        <p>
          Quantity: 
          <button class="decrease px-2 bg-gray-700 rounded">-</button>
          <span class="quantity mx-2">${item.quantity}</span>
          <button class="increase px-2 bg-gray-700 rounded">+</button>
        </p>
        <p>Subtotal: ₱<span class="subtotal">${subtotal.toFixed(2)}</span></p>
        <button class="remove mt-2 bg-red-500 px-4 py-1 rounded text-black">Remove</button>
      </div>
    `;

    // Append cart item
    cartList.appendChild(cartItem);

    // Add event listeners for buttons
    const increaseBtn = cartItem.querySelector(".increase");
    const decreaseBtn = cartItem.querySelector(".decrease");
    const removeBtn = cartItem.querySelector(".remove");

    increaseBtn.addEventListener("click", () => {
      cart[index].quantity++;
      saveCart();
    });

    decreaseBtn.addEventListener("click", () => {
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1);
      }
      saveCart();
    });

    removeBtn.addEventListener("click", () => {
      cart.splice(index, 1);
      saveCart();
    });
  });

  cartTotalEl.textContent = total.toFixed(2);
}

// ----- SAVE CART -----
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ----- CHECKOUT -----
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  alert("Thank you for your purchase!");
  cart = [];
  saveCart();
});

// ----- INIT -----
window.addEventListener("DOMContentLoaded", () => {
  renderCart();
});
