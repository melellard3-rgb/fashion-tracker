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

app.post("/api/poshmark-listing", async (req, res) => {
  const rawUrl = String(req.body?.url || "").trim();
  let listingUrl;
  try {
    listingUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: "Enter a valid Poshmark listing URL." });
  }

  if (!/(^|\.)poshmark\.[a-z.]+$/i.test(listingUrl.hostname)) {
    return res.status(400).json({ error: "Only Poshmark listing URLs are supported." });
  }

  try {
    const response = await fetch(listingUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BQI listing importer)" },
    });
    if (!response.ok) return res.status(502).json({ error: "Poshmark did not return this listing." });
    const html = await response.text();
    const meta = (property) => {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"));
      return match ? decodeHtml(match[1]) : "";
    };
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map((match) => { try { return JSON.parse(match[1]); } catch { return null; } })
      .find(Boolean) || {};
    const title = jsonLd.name || meta("og:title") || meta("twitter:title") || "";
    const description = jsonLd.description || meta("og:description") || meta("description") || "";
    const imageUrl = jsonLd.image?.url || jsonLd.image || meta("og:image") || meta("twitter:image") || "";
    const image = imageUrl ? await fetchImageDataUrl(imageUrl) : null;
    return res.json({ title, description, image });
  } catch (error) {
    return res.status(502).json({ error: "Could not fetch this Poshmark listing.", detail: error.message });
  }
});

app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchImageDataUrl(imageUrl) {
  try {
    const response = await fetch(imageUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 8 * 1024 * 1024) return null;
    return `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
  } catch {
    return null;
  }
}
