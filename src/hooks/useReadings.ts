import { useState, useEffect } from "react";
import { 
  ReadingRecord, 
  getUserReadings, 
  saveReading, 
  migrateLocalReadings,
  getInsightReports,
  saveInsightReport,
  InsightReport
} from "@/services/readingService";
import { useAuth } from "./useAuth";
import { analyzeReadingAI, generateInsightAI } from "@/services/aiService";

export const useReadings = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [insightReports, setInsightReports] = useState<InsightReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [readingsData, insightsData] = await Promise.all([
        getUserReadings(user.uid),
        getInsightReports(user.uid)
      ]);
      setReadings(readingsData);
      setInsightReports(insightsData);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setReadings([]);
      setInsightReports([]);
    }
  }, [user]);

  const addReading = async (reading: Omit<ReadingRecord, "id">) => {
    if (!user) return null;
    
    // Perform AI analysis
    let analysis = {
      coreReflection: reading.report.substring(0, 100),
      tags: [] as string[],
      sentiment: "neutral",
      questionType: "未知",
      primaryTheme: "内省"
    };

    try {
      const aiData = await analyzeReadingAI({
        question: reading.question,
        report: reading.report,
        hexagramName: reading.hexagramName,
        hexagramNumber: reading.hexagramNumber
      });
      analysis = {
        ...analysis,
        ...aiData
      };
    } catch (e) {
      console.error("AI Analysis failed, using fallback", e);
    }

    const id = await saveReading(user.uid, {
      ...reading,
      ...analysis
    }, false); // Default to free for now
    
    await fetchData();
    return id;
  };

  const checkAndGenerateInsights = async (currentReadings: ReadingRecord[]) => {
    if (!user) return;
    const count = currentReadings.length;
    const existingTypes = insightReports.map(r => r.type);

    let type: "third_hint" | "five_card" | "ten_report" | null = null;
    if (count === 3 && !existingTypes.includes("third_hint")) type = "third_hint";
    else if (count === 5 && !existingTypes.includes("five_card")) type = "five_card";
    else if (count === 10 && !existingTypes.includes("ten_report_preview")) type = "ten_report";

    if (type) {
      try {
        const insightAi = await generateInsightAI({ readings: currentReadings, type });
        await saveInsightReport(user.uid, {
          type: type === "ten_report" ? "ten_report_preview" : type,
          title: insightAi.title,
          content: insightAi.content,
          structuredData: insightAi.structuredData,
          relatedReadingIds: currentReadings.map(r => r.id),
          isPaid: false,
          createdAt: null
        });
        await fetchData();
      } catch (e) {
        console.error("Insight generation failed", e);
      }
    }
  };

  useEffect(() => {
    if (readings.length > 0 && user) {
      checkAndGenerateInsights(readings);
    }
  }, [readings.length, user?.uid]);

  const migrate = async (localData: any[]) => {
    if (!user || localData.length === 0) return;
    await migrateLocalReadings(user.uid, localData);
    await fetchData();
  };

  return { 
    readings, 
    insightReports, 
    loading, 
    addReading, 
    migrate, 
    refresh: fetchData 
  };
};
