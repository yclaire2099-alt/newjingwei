import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisData {
  coreReflection: string;
  tags: string[];
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  questionType: string;
  primaryTheme: string;
}

export interface InsightReportData {
  title: string;
  content: string;
  structuredData: {
    themes: string[];
    patterns: string[];
    repeatedHexagrams: string[];
  };
}

const ANALYSIS_PROMPT = `你是一位深契易经哲理、具有人文关怀的 AI 内省导师。你的任务是针对用户的单次问卦，生成核心映射、标签、情感倾向和主题。核心映射需深入浅出，字数在40-60字左右。输出必须是纯 JSON 格式。`;

const REPORT_PROMPT = `
  你是一位资深的易经哲学引导者与深度心理分析师。
  请根据用户提供的本卦、互卦、错卦、综卦，生成一份逻辑严密、触及灵魂、且充满人文温度的“镜像报告”。
  
  内容要求：
  1. 现状观照：详细分析本卦的象征意义。
  2. 镜中波澜：通过互卦挖掘内在的张力或渴望。
  3. 阴影映射：通过错卦提醒那些被忽视的因素。
  4. 通变之道：给出具体的心态调整或行动方向建议。
  
  语气：清雅、通透、有力。
  返回 JSON 对象，包含：
  - coreReflection: 核心照见（60字左右）
  - report: 详尽的 Markdown 格式报告，包含上述四个模块。内容要有分量，不能敷衍。
`;

const INSIGHT_PROMPT = `
  你是一位跨领域智慧引导者，擅长从时间序列中发现隐藏的心理模式。
  分析用户的问卦历史，找出反复出现的关键词、情绪波动和潜在的生命循环。
  
  返回 JSON 对象，包含：
  - title: 具有诗意的主题
  - content: 详尽的模式分析（Markdown 格式，约 300字以上）
  - structuredData: 包含 themes, patterns, repeatedHexagrams 的对象。
`;

export const analyzeReadingAI = async (params: {
  question: string;
  report: string;
  hexagramName: string;
  hexagramNumber: number;
}): Promise<AnalysisData> => {
  try {
    const prompt = `${ANALYSIS_PROMPT}\n\n用户问题：${params.question}\n卦象：${params.hexagramName}\n解读内容：${params.report}`;
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text);
  } catch (error) {
    console.error("Analysis AI failed:", error);
    return {
      coreReflection: params.report.substring(0, 100),
      tags: ["内省"],
      sentiment: "neutral",
      questionType: "深度自我探索",
      primaryTheme: "内在观察"
    };
  }
};

export const generateReportAI = async (params: {
  question: string;
  benGua: string;
  huGua: string;
  cuoGua: string;
  zongGua: string;
}): Promise<{ report: string; coreReflection: string }> => {
  try {
    const fullPrompt = `${REPORT_PROMPT}\n问题: "${params.question}"\n本卦: ${params.benGua}\n互卦: ${params.huGua}\n错卦: ${params.cuoGua}\n综卦: ${params.zongGua}`;
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text);
  } catch (error) {
    console.error("Report AI failed:", error);
    return {
      coreReflection: "此时此刻，万物处于平衡中。",
      report: "虽然 AI 洞察暂时无法连通，但请以此卦象为机，内省你的初心。"
    };
  }
};

export const chatDialogueAI = async (params: {
  question: string;
  interpretation: string;
  messages: any[];
  input: string;
  round: number;
  direction?: string;
}): Promise<{ text: string }> => {
  try {
    const history = params.messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const chat = genAI.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `你是一位深度心理咨询师与易经哲学引导者。用户问题: "${params.question}"。初始解读: "${params.interpretation}"。`
      },
      history
    });

    const result = await chat.sendMessage({
      message: params.input
    });

    return { text: result.text };
  } catch (error) {
    console.error("Chat AI failed:", error);
    return { text: "由于能量场波动，我暂时无法回应。请稍后再试。" };
  }
};

export const generateInsightAI = async (params: {
  readings: any[];
  type: "third_hint" | "five_card" | "ten_report";
}): Promise<InsightReportData> => {
  try {
    const summary = params.readings.map((r, i) => `第${i+1}次: "${r.question}", "${r.hexagramName}", "${r.coreReflection}"`).join("\n");
    const prompt = `${INSIGHT_PROMPT}\n类型: ${params.type}\n历史记录:\n${summary}`;
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text);
  } catch (error) {
    console.error("Insight AI failed:", error);
    throw error;
  }
};
