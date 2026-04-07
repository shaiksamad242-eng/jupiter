import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // API Route for sending emails
  app.post("/api/send-email", async (req, res) => {
    console.log("Received POST request to /api/send-email", req.body);
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
  });

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
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const rootIndex = path.join(process.cwd(), 'index.html');
    
    console.log("Serving static files from:", distPath);
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      // Try dist first, then root
      const distIndex = path.join(distPath, 'index.html');
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.sendFile(rootIndex);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
