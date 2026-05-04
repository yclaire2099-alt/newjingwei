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

const ANALYSIS_PROMPT = `你是一位深契易经哲理、具有人文关怀的 AI 内省导师。
你的任务是基于用户的问卦记录，生成结构化的内省分析。

要求：
1. coreReflection (一句话照见)：用一种“映照”而非“指教”的口吻，指出用户问题背后可能存在的心理动机或内在张力。字数控制在 40-60 字。
2. tags (议题标签)：提供 3-5 个客观的议题标签，如“自我价值”、“边界感”、“深层恐惧”、“选择焦虑”等。
3. sentiment (情绪倾向)：从 ["positive", "neutral", "negative", "mixed"] 中选择一个。
4. questionType (问题类型)：如“职业决策”、“情感纠葛”、“自我认同”等。
5. primaryTheme (核心主题)：一两个词概括核心议题。

输出必须是纯 JSON 格式，不要包含任何 Markdown 标识：
{
  "coreReflection": "...",
  "tags": ["...", "..."],
  "sentiment": "...",
  "questionType": "...",
  "primaryTheme": "..."
}`;

const INSIGHT_PROMPT = `你是一位资深的心理内省导师与易经智慧传承者。
你的任务是回顾用户的一系列内省足迹，识别出其中反复出现的“模式”。

要求：
- 语气：温柔、客观、克制、坚定。
- 不做预测、不给建议、不做诊断。
- 重点在于“发现规律”和“提出一个更深的问题”。
- 根据记录数量（3条、5条或10条）提供不同深度的洞察。

输出必须是纯 JSON 格式，不要包含任何 Markdown 标识：
{
  "title": "...",
  "content": "...",
  "structuredData": {
    "themes": ["...", "..."],
    "patterns": ["...", "..."],
    "repeatedHexagrams": ["...", "..."]
  }
}`;

app.post("/api/analyze-reading", async (req, res) => {
  const { question, report, hexagramName } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in process.env");
    return res.status(500).json({ error: "Gemini API key missing" });
  }

  try {
    const prompt = `${ANALYSIS_PROMPT}\n\n用户问题：${question}\n卦象：${hexagramName}\n解读内容：${report}`;
    
    // Using a more widely available model
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: prompt
    }).catch(err => {
      console.warn("Gemini API call failed (likely quota), using fallback logic.", err.message);
      return null;
    });

    if (!response || !response.text) {
      // Fallback data if API fails or quota exceeded
      return res.json({
        coreReflection: report.substring(0, 100),
        tags: ["内省"],
        sentiment: "neutral",
        questionType: "深度自我探索",
        primaryTheme: "内在观察"
      });
    }

    const text = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseError) {
      console.error("Analysis Parse Error:", text);
      res.json({
        coreReflection: report.substring(0, 100),
        tags: ["内省"],
        sentiment: "neutral",
        questionType: "未分类",
        primaryTheme: "自我发现"
      });
    }
  } catch (error: any) {
    console.error("AI Analysis critical error:", error);
    // Even on critical error, return a fallback to avoid blocking the UI
    res.json({
      coreReflection: report.substring(0, 100),
      tags: ["系统暂时繁忙"],
      sentiment: "neutral",
      questionType: "自动保存",
      primaryTheme: "待分析"
    });
  }
});

app.post("/api/generate-insight", async (req, res) => {
  const { readings, type } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key missing" });
  }

  try {
    const readingsSummary = readings.map((r: any, i: number) => 
      `第${i+1}次: 问题"${r.question}", 卦象"${r.hexagramName}", 核心照见"${r.coreReflection}"`
    ).join("\n");
    
    const prompt = `${INSIGHT_PROMPT}\n\n当前类型：${type} (3次提示, 5次内省卡, 或 10次长期洞察)\n历史记录：\n${readingsSummary}`;
    
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini");
    }

    const text = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseError) {
      console.error("Insight Parse Error:", text);
      res.status(500).json({ error: "Insight parsing failed" });
    }
  } catch (error: any) {
    console.error("AI Insight Error details:", error);
    res.status(500).json({ error: error.message || "Internal AI Error" });
  }
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
