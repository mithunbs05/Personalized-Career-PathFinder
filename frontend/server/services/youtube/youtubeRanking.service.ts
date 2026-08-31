// YouTube Video Quality & Relevance Ranking Service

export interface RawCandidateVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  durationISO: string;
  durationSeconds: number;
  durationFormatted: string;
  viewCount: number;
  likeCount: number;
}

export interface RankedVideo extends RawCandidateVideo {
  relevanceScore: number;
  qualityScore: number;
  isFilteredOut: boolean;
  filterReason?: string;
}

export interface RankingContext {
  moduleTitle: string;
  category: string;
  difficulty: string;
  concepts: string[];
  learningObjectives: string[];
}

export class YouTubeRankingService {
  // Weights: Relevance 35%, Educational 20%, Engagement 15%, Views 10%, Channel Quality 10%, Duration 5%, Recency 5%
  private weights = {
    relevance: 0.35,
    educational: 0.20,
    engagement: 0.15,
    views: 0.10,
    channel: 0.10,
    duration: 0.05,
    recency: 0.05
  };

  private educationalKeywords = [
    'tutorial', 'explained', 'course', 'guide', 'programming', 'code',
    'python', 'for loop', 'iteration', 'beginner', 'learn', 'mastery',
    'step by step', 'walkthrough', 'deep dive', 'crash course'
  ];

  private negativeKeywords = [
    'shorts', '#shorts', 'tiktok', 'reaction', 'meme', 'song', 'music',
    'gameplay', 'trailer', 'funny', 'parody', 'unboxing', 'drama'
  ];

  private trustedChannels = [
    'freecodecamp', 'programming with mosh', 'corey schafer', 'tech with tim',
    'sentdex', 'cs dojo', 'arjan codes', 'mCoding', 'clever programmer',
    'traversy media', 'fireship', 'neuralnine', 'keith galli', 'bro code',
    'edureka', 'simplilearn', 'telusko', 'freecodecamp.org'
  ];

  filterAndRank(candidates: RawCandidateVideo[], context: RankingContext): RankedVideo[] {
    const scored: RankedVideo[] = candidates.map(c => this.scoreCandidate(c, context));
    
    // Sort by final quality score descending
    return scored
      .filter(c => !c.isFilteredOut)
      .sort((a, b) => b.qualityScore - a.qualityScore);
  }

  private scoreCandidate(video: RawCandidateVideo, context: RankingContext): RankedVideo {
    const titleLower = video.title.toLowerCase();
    const descLower = video.description.toLowerCase();
    const combinedText = `${titleLower} ${descLower}`;

    // 1. Check Filters
    // Duration filter: Filter out videos < 60 seconds (Shorts) or > 6 hours (huge compilations)
    if (video.durationSeconds > 0 && video.durationSeconds < 60) {
      return { ...video, relevanceScore: 0, qualityScore: 0, isFilteredOut: true, filterReason: 'Shorts (< 60s)' };
    }

    for (const neg of this.negativeKeywords) {
      if (titleLower.includes(neg)) {
        return { ...video, relevanceScore: 0, qualityScore: 0, isFilteredOut: true, filterReason: `Negative keyword: ${neg}` };
      }
    }

    // 2. Relevance Score (35%)
    let matchHits = 0;
    const targetWords = [
      ...context.moduleTitle.toLowerCase().split(/\s+/),
      ...context.concepts.map(c => c.toLowerCase())
    ].filter(w => w.length > 2 && !['and', 'for', 'the', 'with'].includes(w));

    targetWords.forEach(word => {
      if (titleLower.includes(word)) matchHits += 2;
      else if (descLower.includes(word)) matchHits += 1;
    });

    const maxHits = Math.max(1, targetWords.length * 2);
    const relevanceScore = Math.min(100, Math.round((matchHits / maxHits) * 100));

    // 3. Educational Match Score (20%)
    let eduHits = 0;
    this.educationalKeywords.forEach(kw => {
      if (titleLower.includes(kw) || descLower.includes(kw)) eduHits++;
    });
    const educationalScore = Math.min(100, eduHits * 20);

    // 4. Engagement Score (15%): Likes per 100 views ratio
    let engagementScore = 70;
    if (video.viewCount > 1000 && video.likeCount > 0) {
      const ratio = (video.likeCount / video.viewCount) * 100; // typical 2% - 8%
      engagementScore = Math.min(100, Math.round(ratio * 15) + 30);
    }

    // 5. Views Score (10%)
    let viewScore = 60;
    if (video.viewCount > 1000000) viewScore = 100;
    else if (video.viewCount > 250000) viewScore = 90;
    else if (video.viewCount > 50000) viewScore = 80;
    else if (video.viewCount > 5000) viewScore = 70;

    // 6. Channel Quality (10%)
    let channelScore = 70;
    const channelLower = video.channelTitle.toLowerCase();
    if (this.trustedChannels.some(tc => channelLower.includes(tc))) {
      channelScore = 100;
    }

    // 7. Duration Score (5%): Sweet spot for focused lesson is 5–25 mins (300 - 1500s)
    let durationScore = 70;
    if (video.durationSeconds >= 300 && video.durationSeconds <= 1800) {
      durationScore = 100;
    } else if (video.durationSeconds > 1800 && video.durationSeconds <= 3600) {
      durationScore = 85;
    }

    // 8. Recency Score (5%)
    let recencyScore = 80;
    try {
      const pubYear = new Date(video.publishedAt).getFullYear();
      if (pubYear >= 2023) recencyScore = 100;
      else if (pubYear >= 2020) recencyScore = 85;
      else recencyScore = 70;
    } catch (e) {
      recencyScore = 80;
    }

    // Weighted Final PathAI Quality Match Score
    const finalScore = Math.round(
      relevanceScore * this.weights.relevance +
      educationalScore * this.weights.educational +
      engagementScore * this.weights.engagement +
      viewScore * this.weights.views +
      channelScore * this.weights.channel +
      durationScore * this.weights.duration +
      recencyScore * this.weights.recency
    );

    return {
      ...video,
      relevanceScore,
      qualityScore: Math.max(60, Math.min(99, finalScore)),
      isFilteredOut: false
    };
  }
}

export const youtubeRankingService = new YouTubeRankingService();
