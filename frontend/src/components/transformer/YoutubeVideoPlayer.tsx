import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Eye,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { YouTubeVideoData } from '../../api/youtube.api';

interface YoutubeVideoPlayerProps {
  video: YouTubeVideoData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshNotice: string | null;
  error: string | null;
  onRefresh: () => void;
  onRetry: () => void;
  moduleTitle: string;
}

export const YoutubeVideoPlayer: React.FC<YoutubeVideoPlayerProps> = ({
  video,
  isLoading,
  isRefreshing,
  refreshNotice,
  error,
  onRefresh,
  onRetry,
  moduleTitle
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const formatNumber = (num: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-3.5">
      
      {/* Dark Video Container (#0B0D0F) */}
      <div className="bg-[#0B0D0F] rounded-2xl overflow-hidden border border-slate-800 shadow-sm relative flex flex-col">
        
        {/* Top Bar inside Player Container */}
        <div className="px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400 bg-black/50 border-b border-slate-800/60 z-20">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A3D] animate-pulse"></span>
            <span className="font-semibold text-slate-200">YouTube Educational Stream</span>
          </div>

          <div className="flex items-center gap-3">
            {refreshNotice && (
              <span className="text-[10px] text-[#8B7CFF] font-medium animate-pulse">
                {refreshNotice}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Search and compare YouTube candidates again"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#8B7CFF]' : ''}`} />
              <span>{isRefreshing ? 'Finding...' : 'Find Better Video'}</span>
            </button>
          </div>
        </div>

        {/* Video Viewport Area */}
        <div className="relative aspect-video bg-[#0B0D0F] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#8B7CFF] border-t-transparent animate-spin"></div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span>Finding the best lesson video...</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Analyzing topic • Comparing educational tutorials • Selecting best match
                </p>
              </div>
            </div>
          )}

          {/* Error fallback state */}
          {!isLoading && error && !video && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 max-w-sm">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-200">
                  Unable to load a recommended video right now.
                </p>
                <p className="text-[11px] text-slate-400">
                  Your coding challenge and lesson transcript remain fully available.
                </p>
              </div>
              <button
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Real Embedded YouTube IFrame */}
          {!isLoading && video?.videoId && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
              className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>
      </div>

      {/* Video Information Row Below Player */}
      {video && (
        <div className="px-1 space-y-2">
          
          {/* Title & Channel line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">{video.channelTitle}</span>
                <span>•</span>
                <span>{video.duration || '12 min'}</span>
                <span>•</span>
                <span>YouTube Lesson</span>
              </div>
            </div>

            {/* PathAI Match Score Pill */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#8B7CFF]">
              <Sparkles className="w-3 h-3" />
              <span>PathAI Match Score: {video.qualityScore}%</span>
            </div>
          </div>

          {/* AI Selected Explanation & Real YouTube Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            
            {/* AI Selected label */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8B7CFF] font-semibold">✦ AI Selected:</span>
              <span>Best match for {moduleTitle} based on concept coverage.</span>
            </div>

            {/* Real Metrics */}
            <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400 shrink-0">
              {video.viewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(video.viewCount)} views</span>
                </span>
              )}
              {video.likeCount > 0 && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{formatNumber(video.likeCount)} likes</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
