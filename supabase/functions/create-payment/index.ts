import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  // ✅ CORS headers including x-client-info
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // allow all origins (you can restrict to your domain later)
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info",
  });

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }

    const PAYMONGO_SECRET = Deno.env.get("PAYMONGO_SECRET");
    if (!PAYMONGO_SECRET) {
      return new Response(JSON.stringify({ error: "Missing PayMongo secret key" }), { status: 500, headers });
    }

    const { amount, description } = await req.json();
    if (!amount || !description) {
      return new Response(JSON.stringify({ error: "Amount and description required" }), { status: 400, headers });
    }

    const encoded = btoa(`${PAYMONGO_SECRET}:`);

    // Call PayMongo API
    const res = await fetch("https://api.paymongo.com/v1/links", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: { attributes: { amount: amount * 100, description } },
      }),
    });

    const data = await res.json();
    const qr_link = data.data?.attributes?.checkout?.checkout_url || null;

    if (!qr_link) {
      return new Response(JSON.stringify({ error: "Failed to get QR link from PayMongo" }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ qr_link }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});
