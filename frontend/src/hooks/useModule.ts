import { useState, useEffect, useCallback } from "react";
import { fetchModule, ModuleData } from "../api/modules.api";

export function useModule(moduleId: string) {
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchModule(moduleId);
      setModuleData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load module");
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  return { moduleData, isLoading, error, refetch: loadModule };
}
