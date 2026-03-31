// start.js
import ngrok from "ngrok";
import { exec } from "child_process";

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Start your Node.js server first
  const server = exec(`node server.js`);

  server.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  server.stderr.on("data", (err) => {
    console.error(err.toString());
  });

  // Wait a few seconds for the server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Start ngrok
  try {
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTH_TOKEN, // optional if you have one
      // name: "shop-backend" // optional, remove to avoid "already exists" error
    });
    console.log(`🔥 Ngrok tunnel running at: ${url}`);
    console.log(`Your backend is ready at ${url}/create-payment`);
  } catch (err) {
    console.error("Failed to start ngrok:", err.message || err);
  }
}

startServer();