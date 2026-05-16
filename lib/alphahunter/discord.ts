import { Client, GatewayIntentBits, REST, Routes, ChannelType } from "discord.js";

export interface DiscordMessage {
  id: string;
  content: string;
  author: string;
  authorId: string;
  channel: string;
  channelId: string;
  guild: string;
  guildId: string;
  timestamp: number;
  mentions: number;
}

interface Config {
  token: string;
  channels?: string[];
  guilds?: string[];
}

class DiscordService {
  private client: Client | null = null;
  private config: Config | null = null;
  private messageCache: DiscordMessage[] = [];
  private maxCacheSize = 100;

  async initialize(token: string, channels?: string[], guilds?: string[]): Promise<boolean> {
    this.config = { token, channels, guilds };
    
    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      await new Promise<void>((resolve, reject) => {
        this.client!.once("ready", () => {
          console.log(`[Discord] Logged in as ${this.client!.user?.tag}`);
          resolve();
        });
        
        this.client!.once("error", reject);
        this.client!.login(token);
      });

      this.client.on("messageCreate", (message) => {
        if (message.author.bot) return;
        
        if (this.config?.channels && !this.config.channels.includes(message.channelId)) {
          return;
        }

        this.addToCache({
          id: message.id,
          content: message.content,
          author: message.author.username,
          authorId: message.author.id,
          channel: message.channelId,
          channelId: message.channelId,
          guild: message.guildId || "DM",
          guildId: message.guildId || "DM",
          timestamp: message.createdTimestamp,
          mentions: message.mentions.users.size,
        });
      });

      console.log(`[Discord] Connected to ${this.client.guilds.cache.size} servers`);
      return true;
    } catch (error) {
      console.error("[Discord] Failed to initialize:", error);
      return false;
    }
  }

  private addToCache(msg: DiscordMessage) {
    this.messageCache.unshift(msg);
    if (this.messageCache.length > this.maxCacheSize) {
      this.messageCache = this.messageCache.slice(0, this.maxCacheSize);
    }
  }

  async fetchRecentMessages(limit: number = 50): Promise<DiscordMessage[]> {
    if (!this.client) {
      console.log("[Discord] Client not initialized, returning mock data");
      return this.getMockMessages(limit);
    }

    const messages: DiscordMessage[] = [];
    const channels = this.config?.channels || [];

    for (const channelId of channels) {
      try {
        const channel = await this.client.channels.fetch(channelId);
        if (channel && channel.type === ChannelType.GuildText) {
          const msgs = await channel.messages.fetch({ limit: Math.ceil(limit / channels.length) });
          for (const [_, msg] of msgs) {
            if (!msg.author.bot) {
              messages.push({
                id: msg.id,
                content: msg.content,
                author: msg.author.username,
                authorId: msg.author.id,
                channel: channel.name,
                channelId: channel.id,
                guild: channel.guild?.name || "Unknown",
                guildId: channel.guildId || "",
                timestamp: msg.createdTimestamp,
                mentions: msg.mentions.users.size,
              });
            }
          }
        }
      } catch (error) {
        console.error(`[Discord] Failed to fetch channel ${channelId}:`, error);
      }
    }

    return messages.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  getCachedMessages(): DiscordMessage[] {
    return this.messageCache;
  }

  getChannels(): { id: string; name: string; guild: string }[] {
    if (!this.client) return [];
    
    const channels: { id: string; name: string; guild: string }[] = [];
    
    for (const guild of this.client.guilds.cache.values()) {
      for (const channel of guild.channels.cache.values()) {
        if (channel.type === ChannelType.GuildText) {
          channels.push({
            id: channel.id,
            name: channel.name,
            guild: guild.name,
          });
        }
      }
    }
    
    return channels;
  }

  destroy() {
    this.client?.destroy();
    this.client = null;
    this.messageCache = [];
  }

  private getMockMessages(limit: number): DiscordMessage[] {
    const channels = ["general", "trading", "defi", "alpha", "signals"];
    const messages = [
      "Just bought more ETH, bull run incoming 🚀",
      "This dip is buying opportunity",
      "Looks like we're heading to new highs",
      "Protocol TVL increasing, bullish signal",
      "Large whale moving funds to exchange",
      "DeFi TVL breaking resistance",
      "Network activity at all-time high",
      "Bearish divergence on 4h chart",
      "Stop loss triggered at 3200",
      "Take profit at 3500",
      "RSI oversold, bounce incoming",
      "Volume spike detected",
      "Gas fees increasing, network busy",
      "New partnership announced",
      "Token unlock tomorrow",
    ];

    return Array.from({ length: limit }, (_, i) => ({
      id: `msg-${i}-${Date.now()}`,
      content: messages[Math.floor(Math.random() * messages.length)],
      author: `user${Math.floor(Math.random() * 1000)}`,
      authorId: `user${Math.floor(Math.random() * 1000)}`,
      channel: channels[Math.floor(Math.random() * channels.length)],
      channelId: `channel-${Math.floor(Math.random() * 5)}`,
      guild: "CryptoCommunity",
      guildId: "guild-1",
      timestamp: Date.now() - Math.random() * 3600000,
      mentions: Math.floor(Math.random() * 3),
    }));
  }
}

export const discordService = new DiscordService();