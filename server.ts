import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { Resend } from "resend";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase Admin
const adminApp = initializeApp({
  projectId: firebaseConfig.projectId,
});
// Specifying the database ID for Firestore Admin
const dbAdmin = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
const authAdmin = getAuth(adminApp);

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

console.log("AI initialized. Gemini Key present:", !!process.env.GEMINI_API_KEY);
console.log("Resend initialized:", !!process.env.RESEND_API_KEY);

const PRODUCTS = [
  { id: "sheng_monthly", name: "镜微·省 月度会员", price: 19.9 },
  { id: "sheng_yearly", name: "镜微·省 年度会员", price: 168 },
  { id: "ten_report_single", name: "10 次内省洞察报告", price: 9.9 }
];

// OTP Endpoints
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  try {
    // Save to temp collection
    await dbAdmin.collection("otp_verifications").doc(email).set({
      otp,
      expiresAt,
      attempts: 0
    });

    if (resend) {
      await resend.emails.send({
        from: '镜微 JINGWEI <auth@jingwei.app>', // Note: in dev this might need setup, but Resend allows onboarding@resend.dev
        to: email,
        subject: '您的验证码 - 镜微 JINGWEI',
        html: `<p>您的验证码是 <strong>${otp}</strong>。有效期为 10 分钟。</p><p>如果这不是您本人的操作，请忽略此邮件。</p>`
      }).catch(err => {
        console.error("Resend error (likely unverified domain or key):", err);
        // Fallback for development: just log it
      });
    }

    // In development environment without API key, we log the code for debugging
    if (!process.env.RESEND_API_KEY) {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: "OTP sent" });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const doc = await dbAdmin.collection("otp_verifications").doc(email).get();
    
    if (!doc.exists) {
      return res.status(400).json({ error: "No OTP request found" });
    }

    const data = doc.data();
    if (Date.now() > data?.expiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (data?.attempts >= 5) {
      return res.status(400).json({ error: "Too many attempts" });
    }

    if (data?.otp !== otp) {
      await doc.ref.update({ attempts: FieldValue.increment(1) });
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Correct OTP
    await doc.ref.delete();

    // Find or create user
    let user;
    try {
      user = await authAdmin.getUserByEmail(email);
    } catch {
      user = await authAdmin.createUser({
        email,
        emailVerified: true,
        displayName: email.split("@")[0],
      });
    }

    const customToken = await authAdmin.createCustomToken(user.uid);
    res.json({ customToken, isNewUser: !user.displayName });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.post("/api/create-order", (req, res) => {
  const { productId, userId } = req.body;
  const product = PRODUCTS.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  res.json({
    orderId,
    product,
    status: "pending",
    createdAt: new Date().toISOString()
  });
});

app.post("/api/simulate-payment", async (req, res) => {
  const { orderId, userId, productId } = req.body;
  
  res.json({
    success: true,
    orderId,
    status: "paid",
    paidAt: new Date().toISOString(),
    entitlement: productId.includes("sheng") ? "sheng" : "single_report"
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
