import { useState, useEffect, useCallback } from "react";
import { fetchBestYouTubeVideo, refreshYouTubeVideo, saveYouTubeProgress, YouTubeVideoData } from "../api/youtube.api";

export function useYoutubeVideo(moduleId: string) {
  const [video, setVideo] = useState<YouTubeVideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVideo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBestYouTubeVideo(moduleId);
      setVideo(data);
    } catch (err: any) {
      setError(err.message || "Unable to load a recommended video right now.");
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshNotice("Finding the best video...");
    try {
      const updated = await refreshYouTubeVideo(moduleId);
      setVideo(updated);
      setRefreshNotice("Video updated");
      setTimeout(() => setRefreshNotice(null), 3000);
    } catch (err: any) {
      setRefreshNotice("Already using the best match");
      setTimeout(() => setRefreshNotice(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const syncWatchProgress = async (currentTime: number, duration: number) => {
    if (!video?.videoId) return;
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const completed = percentage >= 90;
    await saveYouTubeProgress(moduleId, video.videoId, currentTime, duration, percentage, completed);
  };

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  return {
    video,
    isLoading,
    isRefreshing,
    refreshNotice,
    error,
    refetch: loadVideo,
    refreshVideo: handleRefresh,
    syncWatchProgress
  };
}
