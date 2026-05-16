/**
 * Bi-Directional Discord Service
 * Scrapes sentiment from Discord channels and broadcasts trading signals
 */

import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from "discord.js";

export interface SignalData {
  asset: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  currentPrice: number;
  entryPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  reasoning: string;
  teeAttestation: string;
  storageRoot: string;
}

export class DiscordService {
  private static client: Client | null = null;
  private static isReady = false;

  /**
   * Initialize Discord bot client
   */
  private static async getClient(): Promise<Client> {
    if (this.client && this.isReady) {
      return this.client;
    }

    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error("DISCORD_BOT_TOKEN not configured");
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    await this.client.login(token);
    
    // Wait for ready event
    if (!this.isReady) {
      await new Promise<void>((resolve) => {
        this.client!.once("ready", () => {
          this.isReady = true;
          console.log("[DiscordService] Bot connected:", this.client!.user?.tag);
          resolve();
        });
      });
    }

    return this.client;
  }

  /**
   * Scrape sentiment from Discord channel
   * @param channelId - Discord channel ID
   * @param messageLimit - Number of recent messages to fetch
   */
  static async scrapeSentiment(
    channelId: string,
    messageLimit = 50
  ): Promise<string> {
    try {
      const client = await this.getClient();
      const channel = await client.channels.fetch(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        throw new Error("Invalid channel or not a text channel");
      }

      const messages = await channel.messages.fetch({ limit: messageLimit });
      
      // Filter and clean messages
      const cleanedMessages = messages
        .filter((msg) => {
          // Exclude bot messages, system messages, and messages with only links
          return (
            !msg.author.bot &&
            msg.content.length > 10 &&
            !msg.content.startsWith("http")
          );
        })
        .map((msg) => {
          // Clean message content
          return msg.content
            .replace(/<@!?\d+>/g, "") // Remove mentions
            .replace(/<#\d+>/g, "") // Remove channel links
            .replace(/https?:\/\/\S+/g, "") // Remove URLs
            .trim();
        })
        .filter((content) => content.length > 0);

      return cleanedMessages.join(" | ");
    } catch (error) {
      console.error("[DiscordService] Failed to scrape sentiment:", error);
      return ""; // Return empty string on error
    }
  }

  /**
   * Broadcast trading signal to Discord channel
   * @param channelId - Discord channel ID
   * @param signal - Signal data to broadcast
   */
  static async broadcastSignal(
    channelId: string,
    signal: SignalData
  ): Promise<void> {
    try {
      const client = await this.getClient();
      const channel = await client.channels.fetch(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        throw new Error("Invalid channel or not a text channel");
      }

      // Determine embed color based on signal type
      const color =
        signal.signal === "BUY"
          ? 0x00ff88 // Green
          : signal.signal === "SELL"
          ? 0xd946ef // Magenta
          : 0x8b5cf6; // Violet

      const embed = new EmbedBuilder()
        .setTitle("🚨 AlphaHunter Autonomous Signal")
        .setColor(color)
        .setDescription(
          `**${signal.signal}** signal generated with **${signal.confidence}%** confidence`
        )
        .addFields(
          { name: "Asset Pair", value: signal.asset, inline: true },
          {
            name: "Signal",
            value: `${signal.signal} (${signal.confidence}%)`,
            inline: true,
          },
          {
            name: "Current Price",
            value: `$${signal.currentPrice.toFixed(2)}`,
            inline: true,
          }
        );

      if (signal.entryPrice) {
        embed.addFields({
          name: "Entry Price",
          value: `$${signal.entryPrice.toFixed(2)}`,
          inline: true,
        });
      }

      if (signal.takeProfit) {
        embed.addFields({
          name: "Take Profit",
          value: `$${signal.takeProfit.toFixed(2)}`,
          inline: true,
        });
      }

      if (signal.stopLoss) {
        embed.addFields({
          name: "Stop Loss",
          value: `$${signal.stopLoss.toFixed(2)}`,
          inline: true,
        });
      }

      embed.addFields(
        { name: "Reasoning", value: signal.reasoning.slice(0, 1024) },
        {
          name: "TEE Attestation",
          value: `\`${signal.teeAttestation.slice(0, 16)}...${signal.teeAttestation.slice(-12)}\``,
          inline: true,
        },
        {
          name: "Storage Root",
          value: `\`${signal.storageRoot.slice(0, 16)}...${signal.storageRoot.slice(-12)}\``,
          inline: true,
        }
      );

      embed.setFooter({
        text: "Sealed execution verified on 0G Compute • Autonomous AI Agent",
      });
      embed.setTimestamp();

      await channel.send({ embeds: [embed] });
      console.log("[DiscordService] Signal broadcasted successfully");
    } catch (error) {
      console.error("[DiscordService] Failed to broadcast signal:", error);
      throw error;
    }
  }

  /**
   * Cleanup Discord client connection
   */
  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
    }
  }
}
