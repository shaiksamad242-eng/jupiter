import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);

  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global Request Logger
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} (Path: ${req.path})`);
    next();
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      time: new Date().toISOString(),
      headers: req.headers
    });
  });

  // Simple ping for connectivity testing
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", time: new Date().toISOString() });
  });

  // API Route for sending emails
  const handleSendEmail = async (req: express.Request, res: express.Response) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} hit!`);
    
    if (req.method === 'GET') {
      return res.json({ message: "API is alive. Send a POST request to submit.", status: "ok" });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { name, email, phone, experience, role } = req.body;
    console.log("Body keys:", Object.keys(req.body || {}));

    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required." });
    }

    const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || '').trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim();

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ error: "SMTP credentials missing." });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
    });

    const mailOptions = {
      from: `"Jupiter Infotech System" <${smtpUser}>`,
      to: "manager@jupiterinfotech.co.in",
      subject: `New Application: ${role} from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Experience:</strong> ${experience} years</p>
          <p><strong>Role:</strong> ${role}</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Success" });
    } catch (error: any) {
      console.error("SMTP Error:", error);
      res.status(500).json({ error: error.message });
    }
  };

  app.all("/api/send-email", handleSendEmail);
  app.all("/api/send-email/", handleSendEmail);

  // Test SMTP connection route
  app.get("/api/test-smtp", async (req, res) => {
    const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || '').trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim();

    if (!smtpUser || !smtpPass) {
      return res.json({ status: "error", message: "Missing credentials" });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
    });

    try {
      await transporter.verify();
      res.json({ status: "success", message: "SMTP Connection is valid!" });
    } catch (error: any) {
      res.json({ status: "error", message: error.message });
    }
  });

  // API 404 catch-all
  app.all("/api/*", (req, res) => {
    console.warn(`[API 404] ${req.method} ${req.path}`);
    res.status(404).json({ 
      error: `API route not found: ${req.method} ${req.path}`,
      suggestion: "Check if the route is defined in server.ts and if the frontend is calling the correct URL."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Using Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const rootIndex = path.resolve(__dirname, 'index.html');
    
    console.log("Production mode: Serving static files from:", distPath);
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    } else {
      console.warn("Warning: 'dist' directory not found. Falling back to root static serving.");
    }
    
    app.get('*', (req, res) => {
      console.log(`[Static Catch-all] GET ${req.path}`);
      // Try dist first, then root
      const distIndex = path.join(distPath, 'index.html');
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else if (fs.existsSync(rootIndex)) {
        res.sendFile(rootIndex);
      } else {
        res.status(404).send("Application entry point (index.html) not found.");
      }
    });
  }

  // Final catch-all for any unhandled POST/PUT/DELETE requests
  app.all('*', (req, res) => {
    console.warn(`[Final Catch-all] ${req.method} ${req.path}`);
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
    } else {
      res.status(404).send(`Cannot ${req.method} ${req.path}`);
    }
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Global Error]", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message 
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Available API routes:");
    console.log("  GET  /api/health");
    console.log("  POST /api/send-email");
    console.log("  GET  /api/test-smtp");
  });
}

startServer();
