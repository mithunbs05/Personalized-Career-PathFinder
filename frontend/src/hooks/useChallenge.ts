import { useState, useEffect, useCallback, useRef } from "react";
import { fetchChallenge, saveChallengeDraft, ChallengeData } from "../api/challenges.api";
import { transformModule } from "../api/modules.api";

export function useChallenge(moduleId: string, initialDraft?: string) {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadChallenge = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchChallenge(moduleId);
      setChallenge(data);
      if (initialDraft) {
        setCode(initialDraft);
      } else {
        setCode(data.starterCode);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load challenge");
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, initialDraft]);

  const transform = async (forceRegenerate = false) => {
    setIsTransforming(true);
    setError(null);
    try {
      const data = await transformModule(moduleId, forceRegenerate);
      setChallenge(data);
      setCode(data.starterCode);
      return data;
    } catch (err: any) {
      setError(err.message || "Transformation failed");
    } finally {
      setIsTransforming(false);
    }
  };

  // Debounced autosave
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    if (challenge?.id) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      autosaveTimeoutRef.current = setTimeout(() => {
        saveChallengeDraft(challenge.id, newCode).catch(() => {});
      }, 1000);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  return {
    challenge,
    code,
    isLoading,
    isTransforming,
    error,
    setCode: handleCodeChange,
    transform,
    refetch: loadChallenge
  };
}
