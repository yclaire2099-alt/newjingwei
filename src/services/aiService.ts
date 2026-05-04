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

export const analyzeReadingAI = async (params: {
  question: string;
  report: string;
  hexagramName: string;
  hexagramNumber: number;
}): Promise<AnalysisData> => {
  const response = await fetch("/api/analyze-reading", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error("Analysis failed");
  return response.json();
};

export const generateInsightAI = async (params: {
  readings: any[];
  type: "third_hint" | "five_card" | "ten_report";
}): Promise<InsightReportData> => {
  const response = await fetch("/api/generate-insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error("Insight generation failed");
  return response.json();
};
