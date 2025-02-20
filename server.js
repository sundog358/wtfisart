const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const app = express();
const router = express.Router();

// Enable CORS
app.use(cors());

// Middleware for parsing JSON and serving static files
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname)));

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  pool: true,
  maxConnections: 3,
  rateDelta: 20000,
  rateLimit: 5,
});

// Verify SMTP connection on startup
transporter
  .verify()
  .then(() => {
    console.log("SMTP Server is ready to take our messages");
  })
  .catch((error) => {
    console.error("SMTP Verification Error:", {
      message: error.message,
      code: error.code,
      command: error.command,
    });
  });

// Mount the router before other routes
app.use("/api", router);

// Contact form endpoint
router.post("/contact", async (req, res) => {
  try {
    console.log("Received contact form submission:", req.body);
    const { name, email, subject, message } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!name || !email || !subject || !message) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    try {
      // Verify connection before sending
      await transporter.verify();

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully. Message ID:", info.messageId);
      res.json({ success: true, message: "Message sent successfully" });
    } catch (emailError) {
      console.error("Email Error:", emailError);
      console.error("Detailed email error:", {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode,
        stack: emailError.stack,
      });

      let errorMessage = "Failed to send message";
      switch (emailError.code) {
        case "EAUTH":
          errorMessage =
            "Authentication failed. Please check email credentials.";
          break;
        case "ESOCKET":
        case "ECONNECTION":
          errorMessage = "Connection to email server failed. Please try again.";
          break;
        case "EMESSAGE":
          errorMessage = "Invalid message format. Please check your input.";
          break;
        default:
          errorMessage = "Email server error. Please try again later.";
      }
      console.log("Sending error response:", errorMessage);
      res.status(500).json({ success: false, message: errorMessage });
      return;
    }
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
    });

    let errorMessage = "Failed to send message";
    if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed";
    } else if (error.code === "ESOCKET") {
      errorMessage = "Network connection error";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Failed to connect to email server";
    } else if (error.code === "EENVELOPE") {
      errorMessage = "Invalid email address format";
    } else if (error.code === "EMESSAGE") {
      errorMessage = "Message format error";
    }

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development" ? error.message : errorMessage,
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

// Test route to verify server is running
router.get("/test", (req, res) => {
  res.json({ status: "Server is running" });
});

// Serve HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, `${page}.html`);
  res.sendFile(filePath);
});

// Handle routes
app.get("/about", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "about.html"));
});

app.get("/gallery", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "gallery.html"));
});

app.get("/timeline", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "timeline.html"));
});

app.get("/sources", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "sources.html"));
});

app.get("/contact", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "contact.html"));
});

// Add a test route to verify email functionality
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "If you receive this, the email configuration is working!",
    });
    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  // Ensure we send JSON response even in error cases
  res.setHeader("Content-Type", "application/json");

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Server error: Please try again later"
        : err.message,
  });
});

// Handle 404 with JSON response
app.use((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
