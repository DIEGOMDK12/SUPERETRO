import type { Express } from "express";
import { createServer, type Server } from "http";
import https from "https";
import http from "http";
import { storage } from "./storage";
import { insertGameSchema, insertSaveSchema, insertCapybaraSchema } from "@shared/schema";
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

const ADMIN_USERNAME = "diegomdk";
const ADMIN_PASSWORD = "506731";

function generateToken(): string {
  return Buffer.from(`${Date.now()}-${Math.random().toString(36)}`).toString("base64");
}

const validTokens = new Set<string>();

function verifyToken(token: string | undefined): boolean {
  return token ? validTokens.has(token) : false;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    const targetUser = "diegomdk";
    const targetPass = "506731";

    const providedUser = String(username || "").trim().toLowerCase();
    const providedPass = String(password || "").trim();

    console.log(`Tentativa de login: Usuário fornecido [${providedUser}], Senha fornecida [${providedPass}]`);
    console.log(`Comparando com: Usuário alvo [${targetUser}], Senha alvo [${targetPass}]`);

    if (providedUser === targetUser && providedPass === targetPass) {
      console.log("Login bem-sucedido!");
      const token = generateToken();
      validTokens.add(token);
      res.json({ token });
    } else {
      console.log(`Login falhou: Usuário [${providedUser}] ou Senha [${providedPass}] não conferem.`);
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/verify", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (verifyToken(token)) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      validTokens.delete(token);
    }
    res.json({ success: true });
  });

  app.get("/api/games", async (_req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.post("/api/games", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
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
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
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
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const filename = req.headers["x-filename"] as string || `rom-${Date.now()}.zip`;
        const base64Data = buffer.toString("base64");
        
        const file = await storage.createFile({
          filename,
          mimeType: "application/octet-stream",
          data: base64Data,
        });
        
        res.json({ path: `/api/files/${file.id}` });
      });
    } catch (err) {
      console.error("ROM upload error:", err);
      res.status(500).json({ error: "Failed to upload ROM" });
    }
  });

  app.post("/api/upload-cover", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!verifyToken(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const filename = req.headers["x-filename"] as string || `cover-${Date.now()}.jpg`;
        const base64Data = buffer.toString("base64");
        const mimeType = filename.endsWith(".png") ? "image/png" : "image/jpeg";
        
        const file = await storage.createFile({
          filename,
          mimeType,
          data: base64Data,
        });
        
        res.json({ path: `/api/files/${file.id}` });
      });
    } catch (err) {
      console.error("Cover upload error:", err);
      res.status(500).json({ error: "Failed to upload cover" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      const buffer = Buffer.from(file.data, "base64");
      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch file" });
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

  app.get("/api/capybaras", async (_req, res) => {
    try {
      const capys = await storage.getCapybaras();
      res.json(capys);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch capybaras" });
    }
  });

  app.post("/api/capybaras", async (req, res) => {
    try {
      const result = insertCapybaraSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const capy = await storage.createCapybara(result.data);
      res.status(201).json(capy);
    } catch (err) {
      res.status(500).json({ error: "Failed to create capybara" });
    }
  });

  return httpServer;
}
