import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

const handler: Handler = async (event, context) => {
  const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || "").trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "").trim();
  const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || "465");

  const maskedUser = smtpUser ? `${smtpUser.substring(0, 3)}...${smtpUser.split('@')[1]}` : "MISSING";

  if (!smtpUser || !smtpPass) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: "error", 
        message: `SMTP credentials missing. Current User: ${maskedUser}` 
      }),
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.verify();
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: "success", 
        message: "SMTP Connection verified on Netlify!",
        details: { host: smtpHost, port: smtpPort, user: smtpUser }
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: "error", 
        message: `SMTP Connection failed: ${error.message}`,
        code: error.code
      }),
    };
  }
};

export { handler };
