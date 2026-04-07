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

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // Global Request Logger
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - Query: ${JSON.stringify(req.query)} - Headers: ${JSON.stringify({
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
    })}`);
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
    console.log(`[${new Date().toISOString()}] POST /api/send-email received`);
    console.log("Body keys:", Object.keys(req.body));
    
    const { name, email, phone, experience, role } = req.body;

    // Check for SMTP credentials
    const smtpHost = 'smtpout.secureserver.net';
    const smtpPort = '465';
    const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || '').trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim();

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ 
        error: "Missing SMTP_USER or SMTP_PASS in Secrets." 
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    });

    const mailOptions = {
      from: `"Jupiter Infotech System" <${smtpUser}>`,
      to: "manager@jupiterinfotech.co.in",
      subject: `New Application: ${role} from ${name}`,
      text: `
        New Application Details:
        ------------------------
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Experience: ${experience} years
        Role: ${role}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ff2d78;">New Application Details</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Experience:</strong> ${experience} years</p>
          <p><strong>Role:</strong> ${role}</p>
          <hr />
          <p style="font-size: 0.8rem; color: #666;">Sent from Jupiter Infotech System Portal</p>
        </div>
      `,
    };

    try {
      console.log("Sending mail...");
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error: any) {
      console.error("Detailed SMTP Error:", error);
      let errorMessage = "Failed to send email. Check server logs for details.";
      
      if (error.code === 'ENOTFOUND') {
        errorMessage = `Could not find SMTP host "${smtpHost}". Please ensure SMTP_HOST is set to "smtp.titan.email" in the Secrets menu.`;
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        errorMessage = `Connection Timed Out to ${smtpHost}. Titan Email (GoDaddy) is currently blocking the connection. 
        
        FIX: 
        1. Try changing SMTP_PORT to "587" in Secrets.
        2. If that fails, Titan is blocking cloud servers. Please use a Gmail account with an "App Password" instead for 100% reliability.`;
      } else if (error.code === 'EAUTH' || error.responseCode === 535) {
        errorMessage = "Authentication failed. Please check if SMTP_USER and SMTP_PASS are correct in the Secrets menu.";
      } else if (error.message) {
        errorMessage = `SMTP Error: ${error.message}`;
      }
      
      res.status(500).json({ error: errorMessage });
    }
  };

  app.post("/api/send-email", handleSendEmail);
  app.post("/api/send-email/", handleSendEmail);

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
    console.warn(`[API 404] ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: `API route not found: ${req.method} ${req.url}`,
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
