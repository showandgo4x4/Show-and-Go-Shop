// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// ✅ Node 18+ has global fetch; for CommonJS we can use node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5500";

// ------------------- Test Route -------------------
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ------------------- Create Payment -------------------
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, order, user_id } = req.body;

    if (!amount || !order || !user_id) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const amountInCentavos = Math.round(amount * 100);

    // ------------------- Create PaymentIntent -------------------
    const paymentIntentResp = await fetch("https://api.paymongo.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            currency: "PHP",
            payment_method_allowed: ["qr_ph"],   // ✅ QR PH
            payment_method_options: { qr_ph: {} }, // ✅ QR PH options
            metadata: { user_id: user_id }       // flat metadata
          }
        }
      })
    });

    const paymentIntentData = await paymentIntentResp.json();
    if (!paymentIntentData.data) {
      return res.status(500).json({ success: false, error: paymentIntentData });
    }

    const paymentIntentId = paymentIntentData.data.id;

    // ------------------- Create Source -------------------
    const sourceResp = await fetch("https://api.paymongo.com/v1/sources", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: "qr_ph",                      // ✅ QR PH
            amount: amountInCentavos,
            currency: "PHP",
            redirect: {
              success: `${FRONTEND_URL}/success.html`,
              failed: `${FRONTEND_URL}/cart.html`
            },
            payment_intent: paymentIntentId,
            metadata: { user_id: user_id }
          }
        }
      })
    });

    const sourceData = await sourceResp.json();
    if (!sourceData.data) {
      return res.status(500).json({ success: false, error: sourceData });
    }

    res.json({
      success: true,
      checkout_url: sourceData.data.attributes.redirect.checkout_url
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));