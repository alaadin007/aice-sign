import { config } from '../config/env';

interface GoogleResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
  date?: string;
}

export async function searchWebsite(url: string): Promise<string> {
  if (!config.searchapi.apiKey) {
    throw new Error('SearchAPI key is not configured');
  }

  try {
    // Extract domain and any meaningful path parts from URL
    const urlObj = new URL(url);
    const searchQuery = `site:${urlObj.hostname} ${urlObj.pathname.split('/').filter(Boolean).join(' ')}`;

    const searchUrl = new URL('https://www.searchapi.io/api/v1/search');
    searchUrl.searchParams.append('engine', 'google');
    searchUrl.searchParams.append('q', searchQuery);
    searchUrl.searchParams.append('api_key', config.searchapi.apiKey);
    searchUrl.searchParams.append('num', '10');
    searchUrl.searchParams.append('filter', '1');
    
    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to search website content');
    }
    
    const data = await response.json();
    const results = data.organic_results || [];
    
    if (!results.length) {
      throw new Error('No content found for this URL');
    }

    // Combine all relevant content
    let fullText = '';

    // Add main result
    const mainResult = results[0];
    fullText += `Title: ${mainResult.title}\n\n`;
    fullText += `Source: ${mainResult.source || urlObj.hostname}\n`;
    if (mainResult.date) {
      fullText += `Date: ${mainResult.date}\n`;
    }
    fullText += `\nContent:\n${mainResult.snippet}\n\n`;

    // Add additional context from other results
    if (results.length > 1) {
      fullText += 'Additional Context:\n\n';
      results.slice(1).forEach((result: GoogleResult, index: number) => {
        if (result.snippet && !result.snippet.includes('Access denied')) {
          fullText += `Source ${index + 1}: ${result.title}\n`;
          fullText += `${result.snippet}\n\n`;
        }
      });
    }

    return fullText.trim();
  } catch (error: any) {
    console.error('Error searching website:', error);
    
    if (error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your configuration.');
    }
    
    if (error.message.includes('exceeded your current quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    
    if (error.message.includes('rate limit')) {
      throw new Error('Too many requests. Please try again in a few moments.');
    }

    throw new Error(error.message || 'Failed to fetch content from website');
  }
}