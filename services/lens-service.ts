/**
 * Lens Protocol Sentiment Scraping Service
 * Uses Lens GraphQL API (FREE) to scrape Hey.xyz posts
 * API: https://docs.lens.xyz/docs/introduction
 */

export interface LensPost {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  stats: {
    upvotes: number;
    comments: number;
    mirrors: number;
  };
}

export class LensService {
  private static readonly LENS_API = "https://api-v2.lens.dev";

  /**
   * Scrape recent posts from Lens Protocol
   * @param limit - Number of posts to fetch
   */
  static async scrapeSentiment(limit = 50): Promise<string> {
    try {
      const query = `
        query ExplorePublications($request: ExplorePublicationRequest!) {
          explorePublications(request: $request) {
            items {
              ... on Post {
                id
                metadata {
                  ... on TextOnlyMetadataV3 {
                    content
                  }
                  ... on ArticleMetadataV3 {
                    content
                  }
                }
                by {
                  handle {
                    localName
                  }
                }
                createdAt
                stats {
                  upvotes
                  comments
                  mirrors
                }
              }
            }
          }
        }
      `;

      const variables = {
        request: {
          limit,
          orderBy: "LATEST",
        },
      };

      const response = await fetch(this.LENS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        console.error(`[LensService] API error: ${response.status}`);
        return "";
      }

      const data = await response.json();
      const posts: LensPost[] = [];

      // Parse posts from response
      if (data.data?.explorePublications?.items) {
        for (const item of data.data.explorePublications.items) {
          const content = item.metadata?.content;
          if (content && content.length > 10) {
            posts.push({
              id: item.id,
              content: this.cleanText(content),
              author: item.by?.handle?.localName || "unknown",
              timestamp: new Date(item.createdAt).getTime(),
              stats: {
                upvotes: item.stats?.upvotes || 0,
                comments: item.stats?.comments || 0,
                mirrors: item.stats?.mirrors || 0,
              },
            });
          }
        }
      }

      console.log(`[LensService] Fetched ${posts.length} posts from Lens`);

      // Return concatenated text for sentiment analysis
      return posts.map(p => p.content).join(" | ");
    } catch (error) {
      console.error("[LensService] Failed to scrape:", error);
      return "";
    }
  }

  /**
   * Scrape posts with specific hashtags
   */
  static async scrapeByHashtags(
    hashtags: string[] = ["crypto", "ethereum", "defi"],
    limit = 25
  ): Promise<string> {
    try {
      const query = `
        query SearchPublications($request: SearchPublicationsRequest!) {
          searchPublications(request: $request) {
            items {
              ... on Post {
                id
                metadata {
                  ... on TextOnlyMetadataV3 {
                    content
                    tags
                  }
                }
                by {
                  handle {
                    localName
                  }
                }
                createdAt
              }
            }
          }
        }
      `;

      const variables = {
        request: {
          query: hashtags.map(tag => `#${tag}`).join(" OR "),
          limit,
        },
      };

      const response = await fetch(this.LENS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        console.error(`[LensService] Search API error: ${response.status}`);
        return "";
      }

      const data = await response.json();
      const posts: string[] = [];

      if (data.data?.searchPublications?.items) {
        for (const item of data.data.searchPublications.items) {
          const content = item.metadata?.content;
          if (content && content.length > 10) {
            posts.push(this.cleanText(content));
          }
        }
      }

      console.log(`[LensService] Fetched ${posts.length} posts by hashtags`);
      return posts.join(" | ");
    } catch (error) {
      console.error("[LensService] Failed to search:", error);
      return "";
    }
  }

  /**
   * Calculate sentiment score from Lens posts
   * Returns value between -1 (bearish) and 1 (bullish)
   */
  static calculateSentiment(text: string): number {
    const bullishWords = [
      "bullish", "optimistic", "growth", "adoption", "innovation",
      "breakthrough", "partnership", "launch", "upgrade", "positive"
    ];
    
    const bearishWords = [
      "bearish", "pessimistic", "decline", "concern", "risk",
      "warning", "threat", "vulnerability", "negative", "caution"
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const word of bullishWords) {
      const matches = (lowerText.match(new RegExp(word, "g")) || []).length;
      score += matches;
    }

    for (const word of bearishWords) {
      const matches = (lowerText.match(new RegExp(word, "g")) || []).length;
      score -= matches;
    }

    // Normalize to -1 to 1 range
    const maxScore = Math.max(Math.abs(score), 10);
    return Math.max(-1, Math.min(1, score / maxScore));
  }

  /**
   * Clean post text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/https?:\/\/\S+/g, "") // Remove URLs
      .replace(/@[\w]+/g, "") // Remove mentions
      .replace(/#[\w]+/g, "") // Remove hashtags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .slice(0, 500); // Limit length
  }
}
