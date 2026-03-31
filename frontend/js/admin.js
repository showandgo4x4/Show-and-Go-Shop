const API_URL = "http://localhost:5000/api/products";

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = {
    name: document.getElementById("name").value,
    brand: document.getElementById("brand").value,
    category: document.getElementById("category").value,
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    imageUrl: document.getElementById("imageUrl").value,
    description: document.getElementById("description").value,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    if (!res.ok) throw new Error("Failed to add product");

    document.getElementById("message").textContent = "✅ Product Added!";
    document.getElementById("productForm").reset();

  } catch (err) {
    document.getElementById("message").textContent = "❌ Error adding product";
  }
});
