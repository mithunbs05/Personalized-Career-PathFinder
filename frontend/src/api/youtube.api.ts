// YouTube API Client for PathAI Content Transformer

export interface YouTubeVideoData {
  id?: string;
  moduleId: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  duration: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  qualityScore: number;
  relevanceScore: number;
  publishedAt: string;
}

export async function fetchBestYouTubeVideo(moduleId: string): Promise<YouTubeVideoData> {
  const res = await fetch(`/api/modules/${moduleId}/youtube-video`);
  if (!res.ok) {
    throw new Error(`Failed to retrieve YouTube video for module ${moduleId}`);
  }
  const data = await res.json();
  return data.video;
}

export async function refreshYouTubeVideo(moduleId: string): Promise<YouTubeVideoData> {
  const res = await fetch(`/api/modules/${moduleId}/youtube-video/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    throw new Error(`Failed to refresh YouTube video for module ${moduleId}`);
  }
  const data = await res.json();
  return data.video;
}

export async function saveYouTubeProgress(
  moduleId: string,
  videoId: string,
  currentTime: number,
  duration: number,
  percentage: number,
  completed = false
): Promise<any> {
  const res = await fetch(`/api/modules/${moduleId}/youtube-progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoId,
      currentTime,
      duration,
      percentage,
      completed
    })
  });
  if (!res.ok) {
    console.warn("Failed to save YouTube watch progress");
  }
  return await res.json();
}
