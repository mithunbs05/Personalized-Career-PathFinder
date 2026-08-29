import { useState, useEffect, useCallback } from "react";
import { fetchAIContent, fetchAIInsight, fetchTranscript, AIContentBundle, AIInsightData, TranscriptItem } from "../api/modules.api";

export function useAIInstructor(moduleId: string) {
  const [content, setContent] = useState<AIContentBundle | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [insight, setInsight] = useState<AIInsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [aiContent, transcriptList, aiInsight] = await Promise.all([
        fetchAIContent(moduleId).catch(() => null),
        fetchTranscript(moduleId).catch(() => []),
        fetchAIInsight(moduleId).catch(() => null)
      ]);

      if (aiContent) setContent(aiContent);
      setTranscripts(transcriptList);
      if (aiInsight) setInsight(aiInsight);
    } catch (err) {
      console.warn("Failed to load AI instructor data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { content, transcripts, insight, isLoading, refetch: loadData };
}
