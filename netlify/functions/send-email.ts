import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

const handler: Handler = async (event, context) => {
  console.log(`[Netlify Function] ENTERING send-email. Method: ${event.httpMethod}`);

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { name, email, phone, experience, role } = body;

  if (!name || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name and Email are required." }),
    };
  }

  const smtpUser = (process.env.SMTP_USER || process.env.SMTP_USERNAME || "").trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "").trim();
  const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || "465");

  if (!smtpUser || !smtpPass) {
    console.error("SMTP credentials missing in environment variables.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "SMTP credentials missing on server." }),
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const mailOptions = {
    from: `"Jupiter Website Form" <${smtpUser}>`,
    to: `manager@jupiterinfotech.co.in, ${smtpUser}`,
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
        <p style="font-size: 12px; color: #666;">Sent from Jupiter Website (Netlify Function).</p>
      </div>
    `,
  };

  try {
    console.log("Attempting to send email via SMTP...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  } catch (error: any) {
    console.error("SMTP Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send email.",
        details: error.message,
        code: error.code,
      }),
    };
  }
};

export { handler };
