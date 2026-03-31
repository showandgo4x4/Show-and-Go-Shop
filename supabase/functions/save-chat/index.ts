import { createClient } from "npm:@supabase/supabase-js";

export async function handler(req: Request) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Determine allowed origin for dev/prod
  const origin = req.headers.get("origin") === "http://127.0.0.1:5500"
    ? "http://127.0.0.1:5500"
    : "https://showandgo4x4.com";

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { sender, message, session_id } = await req.json();
    console.log("Received payload:", { sender, message, session_id });

    if (!sender || !message || !session_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
        }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("chats")
      .insert({ sender, message, session_id });

    console.log("Supabase insert response:", { data, error });

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
    });
  }
}