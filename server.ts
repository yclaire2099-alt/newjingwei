import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

console.log("AI initialized. Gemini Key present:", !!process.env.GEMINI_API_KEY);

const PRODUCTS = [
  { id: "sheng_monthly", name: "镜微·省 月度会员", price: 19.9 },
  { id: "sheng_yearly", name: "镜微·省 年度会员", price: 168 },
  { id: "ten_report_single", name: "10 次内省洞察报告", price: 9.9 }
];

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
