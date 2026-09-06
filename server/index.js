import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 8787);
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(projectRoot, "..", "dist");

app.use(express.json({ limit: "1mb" }));

app.post("/api/claude", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key") {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured with a real key on the server." });
  }

  const { body } = req.body || {};
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "A valid Anthropic request body is required." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Could not reach Anthropic.", detail: error.message });
  }
});

app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
