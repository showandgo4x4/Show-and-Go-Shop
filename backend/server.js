require('dotenv').config(); // Load environment variables from .env
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Invoice } = require("xendit-node");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cors({
    origin: ["https://showandgo4x4.com", "https://show-and-go-shop-backend.onrender.com"], 
    methods: ["GET", "POST"],
    credentials: true
}));
// Initialize Xendit Invoice with the key from .env
const xenditInvoiceInstance = new Invoice({ 
    secretKey: process.env.XENDIT_SECRET_KEY 
});

app.post("/create-invoice", async (req, res) => {
    try {
        const { external_id, amount, payer_email, description } = req.body;

        // Basic validation before calling Xendit
        if (!external_id || !amount || !payer_email) {
            return res.status(400).json({ 
                error: "Missing required fields: external_id, amount, and payer_email are mandatory." 
            });
        }

        // The SDK v2+ expects camelCase keys inside the 'data' object
        const invoiceParams = {
            data: {
                externalId: String(external_id),
                amount: Number(amount),
                payerEmail: payer_email,
                description: description || "Payment for Order",
                currency: "PHP", // Defaulting to IDR, change if using PHP
                successRedirectUrl: `${process.env.FRONTEND_URL}/success.html`,
                failureRedirectUrl: `${process.env.FRONTEND_URL}/cart.html`,
            }
        };

        console.log("Creating invoice for:", external_id);
        
        const response = await xenditInvoiceInstance.createInvoice(invoiceParams);

        // Success! Send the invoice data back to the frontend
        res.status(200).json(response);

    } catch (err) {
        // Log the SPECIFIC error details (this solves the [Object] issue)
        console.error("❌ XENDIT VALIDATION ERROR:");
        console.dir(err.response?.data || err, { depth: null });

        res.status(err.status || 500).json({
            message: "Failed to create invoice",
            error: err.response?.data || err.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live and listening on port ${PORT}`);
});