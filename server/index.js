import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 8787);
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(projectRoot, "..", "dist");

app.use(express.json({ limit: "8mb" }));

// express.json() rejects oversized/malformed bodies by throwing, and Express's
// default handler answers with an HTML error page. The client always does
// res.json(), so return JSON here instead of letting it choke on markup.
app.use((error, req, res, next) => {
  if (!error) return next();
  const status = error.status || error.statusCode || 400;
  return res.status(status).json({
    error: error.type === "entity.too.large"
      ? "That request was too large to process."
      : "The request body could not be read.",
    detail: error.message,
  });
});

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
    if (!response.ok) {
      console.error("Anthropic request failed", {
        status: response.status,
        type: data?.error?.type,
        message: data?.error?.message,
      });
    }
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
      // Attribute order varies between templates, so try both arrangements.
      const patterns = [
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]*\\scontent=["']([^"']*)["']`,
        `<meta[^>]+content=["']([^"']*)["'][^>]*\\s(?:property|name)=["']${property}["']`,
      ];
      for (const pattern of patterns) {
        const match = html.match(new RegExp(pattern, "i"));
        if (match) return decodeHtml(match[1]);
      }
      return "";
    };
    // Poshmark emits several ld+json blocks and the Product one is not first —
    // the BreadcrumbList usually is. Taking the first parseable block loses the
    // real listing description (the part carrying the seller's measurements).
    const product = findProductNode(html);
    const title = sanitizeListingText(product.name || meta("og:title") || meta("twitter:title") || "");
    const description = sanitizeListingText(product.description || meta("og:description") || meta("description") || "");
    // `image` may be a string, an ImageObject, or an array of either.
    const imageUrl = pickImageUrl(product.image) || meta("og:image") || meta("twitter:image") || "";
    const image = imageUrl ? await fetchImageDataUrl(imageUrl) : null;
    return res.json({ title, description, image, imageUrl: imageUrl || null });
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

// Flattens every ld+json block (including @graph containers) and returns the
// Product node, which is where the seller's real description lives.
function findProductNode(html) {
  const nodes = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let parsed;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      continue;
    }
    const stack = [parsed];
    while (stack.length) {
      const node = stack.pop();
      if (Array.isArray(node)) { stack.push(...node); continue; }
      if (!node || typeof node !== "object") continue;
      nodes.push(node);
      if (Array.isArray(node["@graph"])) stack.push(...node["@graph"]);
    }
  }
  const isProduct = (node) => {
    const type = node["@type"];
    return type === "Product" || (Array.isArray(type) && type.includes("Product"));
  };
  return nodes.find(isProduct) || nodes.find((node) => node.name && node.description) || {};
}

function pickImageUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = pickImageUrl(entry);
      if (url) return url;
    }
    return "";
  }
  if (typeof value === "object") return pickImageUrl(value.url || value.contentUrl || "");
  return "";
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function sanitizeListingText(value) {
  return decodeHtml(String(value))
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim()
    .slice(0, 12000);
}

async function fetchImageDataUrl(imageUrl) {
  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://poshmark.com/" },
    });
    if (!response.ok) {
      console.error("Listing image fetch failed", { imageUrl, status: response.status });
      return null;
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      console.error("Listing image was not an image", { imageUrl, contentType });
      return null;
    }
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 6 * 1024 * 1024) {
      console.error("Listing image too large", { imageUrl, bytes: bytes.byteLength });
      return null;
    }
    return `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
  } catch (error) {
    console.error("Listing image fetch threw", { imageUrl, message: error.message });
    return null;
  }
}
