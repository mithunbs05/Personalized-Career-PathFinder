import { RawCandidateVideo } from "./youtubeRanking.service";

export interface SearchQueryContext {
  moduleTitle: string;
  category: string;
  difficulty?: string;
  concepts: string[];
  learningObjectives?: string[];
}

export class YouTubeSearchService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || "";
  }

  // Generates targeted educational queries, avoiding generic titles
  generateSearchQuery(context: SearchQueryContext): string {
    const titleClean = context.moduleTitle
      .replace(/\(Core Python\)/gi, "")
      .replace(/[&]/g, "and")
      .trim();

    const topConcepts = context.concepts.slice(0, 3).join(" ");
    return `${titleClean} ${topConcepts} programming tutorial python`.trim();
  }

  // Parses ISO 8601 duration like PT12M30S or PT1H2M into seconds and MM:SS format
  parseDuration(isoDuration: string): { seconds: number; formatted: string } {
    if (!isoDuration) return { seconds: 720, formatted: "12:00" };

    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    if (!matches) return { seconds: 720, formatted: "12:00" };

    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = parseInt(matches[3] || "0", 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    let formatted = "";
    if (hours > 0) {
      formatted = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    return { seconds: totalSeconds, formatted };
  }

  async searchCandidates(context: SearchQueryContext, maxResults = 12): Promise<RawCandidateVideo[]> {
    if (!this.apiKey) {
      console.warn("[YouTubeSearchService] YOUTUBE_API_KEY missing in server env.");
      return [];
    }

    const query = this.generateSearchQuery(context);

    try {
      // Step 1: Execute search.list
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("videoEmbeddable", "true");
      searchUrl.searchParams.set("maxResults", String(maxResults));
      searchUrl.searchParams.set("relevanceLanguage", "en");
      searchUrl.searchParams.set("key", this.apiKey);

      const searchRes = await fetch(searchUrl.toString());
      if (!searchRes.ok) {
        const errText = await searchRes.text();
        console.warn(`[YouTubeSearchService] Search API error (${searchRes.status}):`, errText);
        return [];
      }

      const searchData = await searchRes.json();
      const items = searchData.items || [];
      const videoIds = items.map((it: any) => it.id?.videoId).filter(Boolean);

      if (videoIds.length === 0) return [];

      // Step 2: Batch fetch video details & statistics via videos.list
      const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailsUrl.searchParams.set("part", "snippet,contentDetails,statistics");
      detailsUrl.searchParams.set("id", videoIds.join(","));
      detailsUrl.searchParams.set("key", this.apiKey);

      const detailsRes = await fetch(detailsUrl.toString());
      if (!detailsRes.ok) {
        console.warn(`[YouTubeSearchService] Videos detail API error (${detailsRes.status})`);
        return [];
      }

      const detailsData = await detailsRes.json();
      const videoItems = detailsData.items || [];

      return videoItems.map((item: any): RawCandidateVideo => {
        const dur = this.parseDuration(item.contentDetails?.duration || "PT10M");
        const views = parseInt(item.statistics?.viewCount || "0", 10);
        const likes = parseInt(item.statistics?.likeCount || "0", 10);

        return {
          videoId: item.id,
          title: item.snippet?.title || "Python Tutorial",
          description: item.snippet?.description || "",
          thumbnailUrl:
            item.snippet?.thumbnails?.maxres?.url ||
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          channelId: item.snippet?.channelId || "",
          channelTitle: item.snippet?.channelTitle || "Educational Channel",
          publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
          durationISO: item.contentDetails?.duration || "PT10M",
          durationSeconds: dur.seconds,
          durationFormatted: dur.formatted,
          viewCount: views,
          likeCount: likes
        };
      });
    } catch (err: any) {
      console.warn("[YouTubeSearchService] Exception querying YouTube API:", err.message);
      return [];
    }
  }
}

export const youtubeSearchService = new YouTubeSearchService();
