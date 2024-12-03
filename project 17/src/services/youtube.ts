import { config } from '../config/env';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptProgress {
  currentMinute: number;
  totalMinutes: number;
  text: string;
}

export async function getYoutubeTranscript(
  videoId: string,
  onProgress?: (progress: TranscriptProgress) => void
): Promise<string> {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  const url = new URL('https://www.searchapi.io/api/v1/search');
  url.searchParams.append('engine', 'youtube_transcripts');
  url.searchParams.append('video_id', videoId);
  url.searchParams.append('api_key', config.searchapi.apiKey);
  url.searchParams.append('transcript_type', 'manual'); // Prefer manual transcripts
  url.searchParams.append('lang', 'en'); // Prefer English transcripts

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error('API error:', data);
      
      if (data.error?.message?.includes('used all of the searches')) {
        throw new Error('Service temporarily unavailable. Please try again later.');
      }
      
      throw new Error(data.error?.message || 'Failed to fetch transcript');
    }

    let transcriptSegments: TranscriptSegment[] = [];

    if (!data.transcripts || data.transcripts.length === 0) {
      // Try auto-generated transcripts if manual not available
      url.searchParams.set('transcript_type', 'auto');
      const autoResponse = await fetch(url.toString());
      const autoData = await autoResponse.json();

      if (!autoResponse.ok || !autoData.transcripts || autoData.transcripts.length === 0) {
        throw new Error('No transcript available for this video');
      }

      transcriptSegments = autoData.transcripts;
    } else {
      transcriptSegments = data.transcripts;
    }

    // Calculate total duration in minutes
    const totalDuration = transcriptSegments.reduce(
      (acc, segment) => Math.max(acc, segment.start + segment.duration),
      0
    );
    const totalMinutes = Math.ceil(totalDuration / 60);

    // Process transcript in minute-long chunks
    let currentText = '';
    let currentMinute = 0;
    let buffer = '';
    const sentenceEnders = /[.!?]/;

    // Group segments by minute
    const segmentsByMinute: { [key: number]: TranscriptSegment[] } = {};
    transcriptSegments.forEach(segment => {
      const minute = Math.floor(segment.start / 60);
      if (!segmentsByMinute[minute]) {
        segmentsByMinute[minute] = [];
      }
      segmentsByMinute[minute].push(segment);
    });

    // Process each minute
    for (let minute = 0; minute <= totalMinutes; minute++) {
      const minuteSegments = segmentsByMinute[minute] || [];
      
      // Process segments for this minute
      minuteSegments.forEach(segment => {
        const processedText = segment.text
          .trim()
          .replace(/\[[^\]]*\]:\s*/g, '')
          .replace(/\(\d{1,2}:\d{2}\)/g, '')
          .replace(/\[.*?\]|\(.*?\)/g, '')
          .replace(/[♪♫►]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\b(?:um|uh|ah|er|mm|hmm)\b/gi, '')
          .replace(/\[Music\]|\[Applause\]|\[Laughter\]|\[Background Noise\]/gi, '')
          .replace(/\(\s*\)/g, '')
          .trim();

        if (processedText) {
          buffer += (buffer ? ' ' : '') + processedText;

          // If segment ends with sentence-ending punctuation, flush buffer
          if (sentenceEnders.test(processedText[processedText.length - 1])) {
            currentText += (currentText ? ' ' : '') + buffer;
            buffer = '';
          }
        }
      });

      // Report progress
      if (onProgress) {
        onProgress({
          currentMinute: minute + 1,
          totalMinutes,
          text: currentText
        });
      }

      // Add a small delay to prevent overwhelming the UI
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Add any remaining buffer content
    if (buffer) {
      currentText += (currentText ? ' ' : '') + buffer;
    }

    // Final cleanup
    const transcript = currentText
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      .replace(/([.!?])+/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (!transcript) {
      throw new Error('No readable transcript content found');
    }

    return transcript;
  } catch (error: any) {
    console.error('YouTube transcript error:', error);
    throw error instanceof Error ? error : new Error('Failed to get transcript');
  }
}

export function extractVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle direct video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    const urlObj = new URL(url);
    
    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      // Regular watch URLs
      if (urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      }
      // Shorts and embed URLs
      const match = urlObj.pathname.match(/\/(shorts|embed|v)\/([^/?]+)/);
      if (match) return match[2];
    }
    // Handle youtu.be URLs
    else if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
  } catch {
    // If URL parsing fails, check if the input is a direct video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
  }

  return null;
}