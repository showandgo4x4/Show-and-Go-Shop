require('dotenv').config(); 
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Invoice } = require("xendit-node");
const { createClient } = require('@supabase/supabase-js');

const app = express();

// 1. Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 2. Initialize Xendit
const xenditInvoiceInstance = new Invoice({ 
    secretKey: process.env.XENDIT_SECRET_KEY 
});

// 3. Middleware
app.use(bodyParser.json());

const allowedOrigins = [
    "https://showandgo4x4.com", 
    "https://www.showandgo4x4.com",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS Blocked Origin:", origin); // This helps you see why it failed in Render logs
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Explicitly handle preflight requests
app.options('*', cors());

// 4. Basic Routes
app.get("/", (req, res) => {
    res.json({ status: "Online", message: "Show and Go Backend is working!" });
});

app.get("/ping", (req, res) => {
  res.status(200).send("Awake");
});

// 5. Create Xendit Invoice
app.post("/create-invoice", async (req, res) => {
    try {
        const { external_id, amount, payer_email, description } = req.body;

        if (!external_id || !amount || !payer_email) {
            return res.status(400).json({ 
                error: "Missing required fields: external_id, amount, and payer_email are mandatory." 
            });
        }

        const invoiceParams = {
            data: {
                externalId: String(external_id),
                amount: Number(amount),
                payerEmail: payer_email,
                description: description || "Payment for Order",
                currency: "PHP",
                // Passing amount and invoice_id to your success.html for the receipt!
                successRedirectUrl: `${process.env.FRONTEND_URL}/success.html?amount=${amount}&invoice_id=${external_id}`,
                failureRedirectUrl: `${process.env.FRONTEND_URL}/cart.html`,
            }
        };

        console.log("Creating invoice for:", external_id);
        const response = await xenditInvoiceInstance.createInvoice(invoiceParams);
        res.status(200).json(response);

    } catch (err) {
        console.error("❌ XENDIT ERROR:");
        console.dir(err.response?.data || err, { depth: null });
        res.status(err.status || 500).json({
            message: "Failed to create invoice",
            error: err.response?.data || err.message
        });
    }
});

// 6. Xendit Webhook (The "Paid" Listener)
app.post("/xendit-webhook", async (req, res) => {
    const { status, external_id } = req.body;

    console.log(`Webhook received: ${external_id} is ${status}`);

    if (status === "PAID") {
        const { error } = await supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("external_id", external_id);

        if (!error) {
            console.log(`✅ Order ${external_id} marked as PAID in Supabase.`);
        } else {
            console.error("❌ Supabase Update Error:", error);
        }
    }
    // Xendit needs a 200 OK response to stop resending the webhook
    res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});