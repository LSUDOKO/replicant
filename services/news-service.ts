/**
 * Free News Aggregator Service
 * Fetches latest crypto news from RSS feeds (no API keys required)
 */

import Parser from "rss-parser";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: number;
}

export class NewsService {
  private parser: Parser;
  
  private readonly RSS_FEEDS = [
    { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", name: "CoinDesk" },
    { url: "https://cointelegraph.com/rss", name: "CoinTelegraph" },
    { url: "https://decrypt.co/feed", name: "Decrypt" },
  ];

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AlphaHunter/1.0)",
      },
    });
  }

  /**
   * Fetch latest crypto news from RSS feeds
   * @param limit - Maximum number of articles to return
   */
  async fetchLatestNews(limit = 10): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];

    for (const feed of this.RSS_FEEDS) {
      try {
        const feedData = await this.parser.parseURL(feed.url);
        
        for (const item of feedData.items || []) {
          if (!item.title) continue;

          const pubDate = item.pubDate || item.isoDate;
          
          articles.push({
            id: item.guid || item.link || `${Date.now()}-${Math.random()}`,
            title: item.title,
            summary: this.cleanSummary(item.contentSnippet || item.content || ""),
            url: item.link || "",
            source: feed.name,
            publishedAt: pubDate ? new Date(pubDate).getTime() : Date.now(),
          });
        }
      } catch (error) {
        console.error(`[NewsService] Failed to fetch ${feed.name}:`, error);
        // Continue with other feeds
      }
    }

    // Sort by date and return latest
    return articles
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, limit);
  }

  /**
   * Clean and truncate article summary
   */
  private cleanSummary(text: string): string {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .slice(0, 500); // Limit length
  }

  /**
   * Calculate sentiment score from news articles
   * Returns value between -1 (bearish) and 1 (bullish)
   */
  calculateSentiment(articles: NewsArticle[]): number {
    const positiveWords = [
      "bullish", "surge", "rally", "gain", "rise", "up", "growth",
      "adoption", "breakout", "all-time high", "record", "positive",
      "breakthrough", "partnership", "launch", "upgrade"
    ];
    
    const negativeWords = [
      "bearish", "crash", "drop", "fall", "down", "loss", "decline",
      "hack", "scam", "ban", "regulation", "negative", "risk",
      "warning", "concern", "threat", "vulnerability"
    ];

    let score = 0;
    
    for (const article of articles) {
      const text = (article.title + " " + article.summary).toLowerCase();
      
      for (const word of positiveWords) {
        if (text.includes(word)) score += 1;
      }
      
      for (const word of negativeWords) {
        if (text.includes(word)) score -= 1;
      }
    }

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score / Math.max(articles.length, 1)));
  }
}
