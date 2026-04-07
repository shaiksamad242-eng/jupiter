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

  const VERSION = "1.0.6-router-implementation";

  // --- API ROUTER ---
  const apiRouter = express.Router();

  // Health check
  apiRouter.get("/health", (req, res) => {
    console.log(`[API Health Check] Hit from ${req.ip}`);
    res.json({ 
      status: "ok", 
      version: VERSION,
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      method: req.method,
      url: req.url
    });
  });

  // Send Email Handler
  const handleSendEmail = async (req: express.Request, res: express.Response) => {
    console.log(`[${new Date().toISOString()}] API: send-email. Method: ${req.method}`);
    
    if (req.method === 'GET') {
      return res.json({ message: "API is alive. Send a POST request.", status: "ok", version: VERSION });
    }

    const { name, email, phone, experience, role } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required." });
    }

    const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || '').trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim();
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ error: "SMTP credentials missing on server." });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const mailOptions = {
      from: `"Jupiter Website Form" <${smtpUser}>`,
      to: "manager@jupiterinfotech.co.in",
      replyTo: email,
      subject: `New Application: ${role} from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2563eb;">New Career Application</h2>
          <hr />
          <p><strong>Applicant Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Experience:</strong> ${experience} years</p>
          <p><strong>Applied Role:</strong> ${role}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Sent from Jupiter Website.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Success" });
    } catch (error: any) {
      console.error("SMTP Error:", error);
      res.status(500).json({ 
        error: "Failed to send email.",
        details: error.message,
        code: error.code
      });
    }
  };

  apiRouter.all("/send-email", handleSendEmail);
  apiRouter.all("/send-email/", handleSendEmail);

  // Mount the router
  app.use("/api", apiRouter);
  
  // --- END API ROUTER ---

  // Test SMTP
  app.get("/api/test-smtp", async (req, res) => {
    const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || '').trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim();
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    try {
      await transporter.verify();
      res.json({ 
        status: "success", 
        message: "SMTP Connection verified!",
        details: { host: smtpHost, port: smtpPort, user: smtpUser }
      });
    } catch (error: any) {
      res.json({ status: "error", message: error.message });
    }
  });

  // API Catch-all (Ensures /api/* always returns JSON, never HTML)
  app.all("/api/*", (req, res) => {
    console.warn(`[API 404 Catch-all] ${req.method} ${req.url} (Original: ${req.originalUrl})`);
    res.status(404).json({ 
      error: "API route not found",
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl
    });
  });

  // --- API ROUTES END ---

  // Global Request Logger (Moved after API routes to catch what's left)
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] NON-API REQUEST: ${req.method} ${req.url} (Path: ${req.path})`);
    next();
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
