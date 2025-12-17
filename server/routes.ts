import type { Express } from "express";
import { createServer, type Server } from "http";
import https from "https";
import http from "http";
import { storage } from "./storage";
import { insertGameSchema, insertSaveSchema } from "@shared/schema";
import fs from "fs";
import path from "path";

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

  app.get("/api/games", async (_req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      const result = insertGameSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const game = await storage.createGame(result.data);
      res.status(201).json(game);
    } catch (err) {
      res.status(500).json({ error: "Failed to create game" });
    }
  });

  app.delete("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGame(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Game not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to delete game" });
    }
  });

  app.post("/api/upload-rom", async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const filename = req.headers["x-filename"] as string || `rom-${Date.now()}.zip`;
        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
        const uploadDir = path.join(process.cwd(), "client", "public", "roms");
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, buffer);
        
        res.json({ path: `/roms/${safeName}` });
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload ROM" });
    }
  });

  app.post("/api/upload-cover", async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const filename = req.headers["x-filename"] as string || `cover-${Date.now()}.jpg`;
        const safeName = `cover-${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase()}`;
        const uploadDir = path.join(process.cwd(), "client", "public", "covers");
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, buffer);
        
        res.json({ path: `/covers/${safeName}` });
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload cover" });
    }
  });
  
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

  app.get("/api/saves/:gameId", async (req, res) => {
    try {
      const save = await storage.getSave(req.params.gameId);
      if (save) {
        res.json(save);
      } else {
        res.status(404).json({ error: "Save not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch save" });
    }
  });

  app.post("/api/saves", async (req, res) => {
    try {
      const result = insertSaveSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const save = await storage.createSave(result.data);
      res.status(201).json(save);
    } catch (err) {
      res.status(500).json({ error: "Failed to save game" });
    }
  });

  return httpServer;
}
