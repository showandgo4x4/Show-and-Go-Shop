// xendit-key-test.js
require('dotenv').config();
const { Xendit } = require("xendit-node");

const key = process.env.XENDIT_SECRET_KEY;

if (!key) {
  console.error("❌ XENDIT_SECRET_KEY missing in .env");
  process.exit(1);
}

console.log("🔑 Testing Xendit key:", key);

// Initialize Xendit
const x = new Xendit({ apiKey: key });
const Invoice = x.Invoice;

// Attempt to list invoices to check if key is valid
(async () => {
  try {
    const invoices = await Invoice.getAll();
    console.log("✅ Key is valid! You can use it for API requests.");
    console.log("Sample invoices (latest 3):", invoices.slice(0, 3));
  } catch (err) {
    console.error("❌ Key invalid or API call failed:", err.message);
  }
})();