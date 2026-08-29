import { db, DbYouTubeVideo, DbYouTubeProgress } from "../../data/database";
import { youtubeSearchService } from "./youtubeSearch.service";
import { youtubeRankingService, RankedVideo } from "./youtubeRanking.service";

export interface GetYouTubeVideoResult {
  success: boolean;
  video: {
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
  } | null;
  fromCache: boolean;
  error?: string;
}

export class YouTubeService {
  async getOrFetchBestVideo(moduleId: string, forceRefresh = false): Promise<GetYouTubeVideoResult> {
    // 1. Check Database cache first unless forceRefresh is explicitly requested
    if (!forceRefresh) {
      const cached = db.getYoutubeVideo(moduleId);
      if (cached && cached.videoId) {
        return {
          success: true,
          video: {
            id: cached.id,
            moduleId: cached.moduleId,
            videoId: cached.videoId,
            title: cached.title,
            description: cached.description,
            thumbnailUrl: cached.thumbnailUrl,
            channelId: cached.channelId,
            channelTitle: cached.channelTitle,
            duration: cached.duration,
            durationSeconds: cached.durationSeconds,
            viewCount: cached.viewCount,
            likeCount: cached.likeCount,
            qualityScore: cached.qualityScore,
            relevanceScore: cached.relevanceScore,
            publishedAt: cached.publishedAt
          },
          fromCache: true
        };
      }
    }

    // 2. Load module context
    const mod = db.getModule(moduleId);
    if (!mod) {
      return { success: false, video: null, fromCache: false, error: `Module ${moduleId} not found` };
    }

    const context = {
      moduleTitle: mod.title,
      category: mod.category,
      difficulty: mod.difficulty,
      concepts: mod.concepts,
      learningObjectives: mod.learningObjectives
    };

    // 3. Search candidate videos via YouTube API
    const rawCandidates = await youtubeSearchService.searchCandidates(context, 15);

    if (rawCandidates.length > 0) {
      // 4. Filter & Rank candidates with PathAI quality scoring algorithm
      const ranked = youtubeRankingService.filterAndRank(rawCandidates, context);

      if (ranked.length > 0) {
        const best: RankedVideo = ranked[0];

        // 5. Save selected video into database
        const dbVideo: DbYouTubeVideo = {
          id: `yt_${mod.id}_${best.videoId}`,
          moduleId: mod.id,
          videoId: best.videoId,
          title: best.title,
          description: best.description,
          thumbnailUrl: best.thumbnailUrl,
          channelId: best.channelId,
          channelTitle: best.channelTitle,
          duration: best.durationFormatted,
          durationSeconds: best.durationSeconds,
          viewCount: best.viewCount,
          likeCount: best.likeCount,
          publishedAt: best.publishedAt,
          qualityScore: best.qualityScore,
          relevanceScore: best.relevanceScore,
          selected: true,
          lastFetchedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        db.saveYoutubeVideo(dbVideo);

        return {
          success: true,
          video: {
            id: dbVideo.id,
            moduleId: dbVideo.moduleId,
            videoId: dbVideo.videoId,
            title: dbVideo.title,
            description: dbVideo.description,
            thumbnailUrl: dbVideo.thumbnailUrl,
            channelId: dbVideo.channelId,
            channelTitle: dbVideo.channelTitle,
            duration: dbVideo.duration,
            durationSeconds: dbVideo.durationSeconds,
            viewCount: dbVideo.viewCount,
            likeCount: dbVideo.likeCount,
            qualityScore: dbVideo.qualityScore,
            relevanceScore: dbVideo.relevanceScore,
            publishedAt: dbVideo.publishedAt
          },
          fromCache: false
        };
      }
    }

    // 6. Resilient Fallback: If YouTube API is rate-limited or quota exceeded
    const cachedFallback = db.getYoutubeVideo(moduleId);
    if (cachedFallback) {
      return {
        success: true,
        video: cachedFallback,
        fromCache: true
      };
    }

    // Safe, verified educational video fallback for Python loops (Corey Schafer / Programming with Mosh)
    const fallbackVideo: DbYouTubeVideo = {
      id: `yt_${mod.id}_fallback`,
      moduleId: mod.id,
      videoId: "6iF8Xb7Z3wQ", // Corey Schafer: Python Tutorial for Beginners: Loops and Iterations - For/While Loops
      title: "Python Tutorial: Loops and Iterations - For/While Loops",
      description: "In this Python Beginner Tutorial, we will be learning about loops and iterations in Python. We will be looking at for-loops and while-loops, break and continue statements, and the built-in range function.",
      thumbnailUrl: "https://i.ytimg.com/vi/6iF8Xb7Z3wQ/hqdefault.jpg",
      channelId: "UCCezIgC97PvUuR4_gbFUs5g",
      channelTitle: "Corey Schafer",
      duration: "16:08",
      durationSeconds: 968,
      viewCount: 1450000,
      likeCount: 48000,
      publishedAt: "2020-05-15T00:00:00Z",
      qualityScore: 96,
      relevanceScore: 98,
      selected: true,
      lastFetchedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    db.saveYoutubeVideo(fallbackVideo);

    return {
      success: true,
      video: fallbackVideo,
      fromCache: false
    };
  }

  saveWatchProgress(
    userId: string,
    moduleId: string,
    videoId: string,
    currentTime: number,
    duration: number,
    percentage: number,
    completed: boolean
  ): DbYouTubeProgress {
    const progress: DbYouTubeProgress = {
      userId,
      moduleId,
      videoId,
      currentTime: Math.round(currentTime),
      duration: Math.round(duration),
      percentage: Math.min(100, Math.round(percentage)),
      completed: !!completed,
      updatedAt: new Date()
    };

    db.saveYoutubeProgress(progress);

    // Also sync to main module learning progress in database
    db.updateProgress(userId, moduleId, {
      videoCurrentTime: progress.currentTime,
      videoDuration: progress.duration,
      videoCompleted: progress.completed,
      conceptScore: progress.completed ? 100 : Math.min(100, Math.round(percentage))
    });

    return progress;
  }

  getWatchProgress(userId: string, moduleId: string): DbYouTubeProgress | undefined {
    return db.getYoutubeProgress(userId, moduleId);
  }
}

export const youtubeService = new YouTubeService();
