// server.js (CommonJS version)
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = 5000;

const XENDIT_API_KEY = "xnd_production_NPZRa9KNqGBX35gpJyXRf3vbRbs97BdMrbWlh2DFuRhjs1T7GomqJxteTILoU";

app.use(cors());
app.use(express.json());

app.post("/create-invoice", async (req, res) => {
  try {
    const { external_id, amount, payer_email, description } = req.body;

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(XENDIT_API_KEY + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id,
        payer_email,
        description,
        amount,
        success_redirect_url: "http://localhost:5000/success",
        failure_redirect_url: "http://localhost:5000/failure"
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

app.get("/success", (req, res) => {
  res.send("Payment Success!");
});

app.get("/failure", (req, res) => {
  res.send("Payment Failed!");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));