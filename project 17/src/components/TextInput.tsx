import React, { useState } from 'react';
import { Send, Youtube } from 'lucide-react';
import { cn } from '../lib/utils';
import { getYoutubeTranscript, extractVideoId } from '../services/youtube';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function TextInput({ value, onChange, onSubmit, isLoading }: TextInputProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [transcriptProgress, setTranscriptProgress] = useState<{
    currentMinute: number;
    totalMinutes: number;
  } | null>(null);

  const handleYoutubeSubmit = async () => {
    try {
      setYoutubeLoading(true);
      setYoutubeError(null);
      setTranscriptProgress(null);

      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL or video ID');
      }

      const transcript = await getYoutubeTranscript(videoId, (progress) => {
        setTranscriptProgress({
          currentMinute: progress.currentMinute,
          totalMinutes: progress.totalMinutes
        });
        // Update text as we receive it
        onChange(progress.text);
      });

      setYoutubeUrl('');
      setTranscriptProgress(null);
    } catch (error: any) {
      setYoutubeError(error.message);
      onChange(''); // Clear any partial text on error
    } finally {
      setYoutubeLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="text" className="text-sm font-medium text-gray-200">
          Enter your text for assessment
        </label>
        <div className="flex gap-2">
          <textarea
            id="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 min-h-[150px] p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your text here..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="youtube" className="text-sm font-medium text-gray-200">
            Or get transcript from YouTube video
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="youtube"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL or video ID"
              className="flex-1 p-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleYoutubeSubmit}
              disabled={youtubeLoading || !youtubeUrl.trim()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg",
                "hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {youtubeLoading ? (
                transcriptProgress ? (
                  `Processing ${transcriptProgress.currentMinute}/${transcriptProgress.totalMinutes} min...`
                ) : (
                  "Loading..."
                )
              ) : (
                <>
                  <Youtube className="w-4 h-4" />
                  Get Transcript
                </>
              )}
            </button>
          </div>
          {youtubeError && (
            <p className="text-sm text-red-400">{youtubeError}</p>
          )}
          {transcriptProgress && (
            <div className="mt-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ 
                    width: `${(transcriptProgress.currentMinute / transcriptProgress.totalMinutes) * 100}%` 
                  }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Processing minute {transcriptProgress.currentMinute} of {transcriptProgress.totalMinutes}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg",
            "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? "Generating..." : "Generate Assessment"}
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}