import type { Express } from "express";
import { createServer, type Server } from "http";
import https from "https";
import http from "http";

function fetchWithRedirects(url: string, maxRedirects = 5): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      reject(new Error("Too many redirects"));
      return;
    }

    const protocol = url.startsWith("https") ? https : http;
    
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      }
    };
    
    const request = protocol.get(url, options, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let redirectUrl = response.headers.location;
        if (redirectUrl.startsWith("/")) {
          const parsedUrl = new URL(url);
          redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        }
        fetchWithRedirects(redirectUrl, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
      } else {
        resolve(response);
      }
    });

    request.on("error", reject);
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/rom", async (req, res) => {
    const url = req.query.url as string;
    
    if (!url) {
      return res.status(400).json({ error: "URL parameter required" });
    }

    const allowedHosts = ["archive.org"];
    try {
      const parsedUrl = new URL(url);
      if (!allowedHosts.some(host => parsedUrl.hostname.includes(host))) {
        return res.status(403).json({ error: "Host not allowed" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    try {
      const response = await fetchWithRedirects(url);
      
      if (response.statusCode !== 200) {
        console.error(`ROM fetch failed with status: ${response.statusCode}`);
        return res.status(response.statusCode || 500).json({ error: "Failed to fetch ROM" });
      }
      
      const contentType = response.headers["content-type"] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      if (response.headers["content-length"]) {
        res.setHeader("Content-Length", response.headers["content-length"]);
      }
      
      response.pipe(res);
      
    } catch (err) {
      console.error("ROM proxy error:", err);
      res.status(500).json({ error: "Failed to fetch ROM" });
    }
  });

  return httpServer;
}
