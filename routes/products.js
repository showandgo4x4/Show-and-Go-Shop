const productList = document.getElementById("productsList");
const categorySelect = document.getElementById("categorySelect");
const searchBox = document.getElementById("searchBox");
const sortButton = document.getElementById("sortButton");
const sortDropdown = document.getElementById("sortDropdown");
const cartCountEl = document.getElementById("cartCount");

let cartCount = 0;
let currentSort = null;
let allProducts = [];

// ----- Fetch products from backend -----
async function fetchProducts() {
  try {
    const search = searchBox.value || "";
    const res = await fetch(`/products?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    allProducts = data;
    renderProducts();
  } catch (err) {
    console.error("Failed to fetch products", err);
  }
}

// ----- Render products -----
function renderProducts() {
  const category = categorySelect.value;

  let filtered = allProducts.filter(p => 
    (category === "All" || p.category === category)
  );

  // Sorting
  if (currentSort === "low") filtered.sort((a,b)=>a.price-b.price);
  if (currentSort === "high") filtered.sort((a,b)=>b.price-a.price);

  productList.innerHTML = "";
  filtered.forEach(p => {
    productList.innerHTML += `
      <div class="bg-gray-900 p-6 rounded-lg hover:scale-105 transition cursor-pointer">
        <img src="${p.imageUrl}" alt="${p.name}" class="mb-4 w-full h-40 object-cover rounded"/>
        <h3 class="text-xl text-yellow-400 mb-2">${p.name}</h3>
        <p class="text-gray-300 mb-2">$${p.price}</p>
        <button onclick="openModal('${p.name}','${p.desc}')" 
          class="bg-yellow-500 text-black px-4 py-2 rounded">View</button>
        <button onclick="addToCart()" 
          class="ml-2 bg-green-500 px-4 py-2 rounded text-black">Add</button>
      </div>`;
  });
}

// ----- Modal -----
function openModal(title, desc){
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalDesc").innerText = desc;
  const modal = document.getElementById("productModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal(){
  const modal = document.getElementById("productModal");
  modal.classList.add("hidden");
}

// ----- Cart -----
function addToCart(){
  cartCount++;
  cartCountEl.innerText = cartCount;
}

// ----- Event listeners -----
categorySelect.addEventListener("change", renderProducts);
searchBox.addEventListener("input", fetchProducts);

// Sort dropdown toggle
sortButton.addEventListener("click", ()=>{
  sortDropdown.classList.toggle("hidden");
});
sortDropdown.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", e=>{
    currentSort = e.target.dataset.sort;
    renderProducts();
    sortDropdown.classList.add("hidden");
  });
});

// ----- Testimonials -----
const testimonials=[
  "Best repair shop in town! – Juan D.",
  "Fast and professional service. – Maria S.",
  "Affordable and reliable every time. – Carlos R."
];
let index=0;
const testimonialBox=document.getElementById("testimonialBox");
function rotateTestimonials(){
  testimonialBox.innerText=testimonials[index];
  index=(index+1)%testimonials.length;
}
rotateTestimonials();
setInterval(rotateTestimonials,3000);

// ----- Fade-in animations -----
const faders=document.querySelectorAll(".fade-in");
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){ entry.target.classList.add("show"); }
  });
});
faders.forEach(f=>observer.observe(f));

// ----- Initial fetch -----
fetchProducts();
