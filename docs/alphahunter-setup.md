# AlphaHunter Autonomous Trading Agent Setup

AlphaHunter is a fully autonomous crypto trading signal generator that combines real-time data from Discord, RSS news feeds, and Binance price API to generate BUY/HOLD/SELL signals with cryptographic proofs.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS CYCLE                          │
│  (Triggered by Cron Job every hour)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA INGESTION                             │
├─────────────────────────────────────────────────────────────┤
│  1. Binance API    → Live SOL/USDT price (free, no auth)   │
│  2. RSS Feeds      → CoinDesk, CoinTelegraph, Decrypt      │
│  3. Discord Bot    → Scrape 50 recent messages from channel│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   LLM PROCESSING (TEE Simulation)            │
├─────────────────────────────────────────────────────────────┤
│  • Combines price, news, and sentiment data                 │
│  • Sends to Claude 3.5 Sonnet via OpenRouter (optional)    │
│  • Fallback: Rule-based sentiment analysis                  │
│  • Generates: BUY/HOLD/SELL + Confidence + Targets         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CRYPTOGRAPHIC COMMITMENT                   │
├─────────────────────────────────────────────────────────────┤
│  • TEE Attestation Hash (keccak256)                         │
│  • 0G Storage Root Hash                                      │
│  • Timestamp + Signal data                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SIGNAL DELIVERY                            │
├─────────────────────────────────────────────────────────────┤
│  1. Save to database/memory                                  │
│  2. Update Next.js dashboard (real-time)                    │
│  3. Broadcast to Discord (Rich Embed with color coding)     │
└─────────────────────────────────────────────────────────────┘
```

## Features

### ✅ 100% Free Data Sources
- **Binance Public API**: Real-time crypto prices (no API key required)
- **RSS Feeds**: CoinDesk, CoinTelegraph, Decrypt (no authentication)
- **Discord**: Community sentiment via bot (free tier)

### ✅ Autonomous Operation
- Runs on cron schedule (every hour)
- No manual "Generate Signal" button needed
- Countdown timer shows next cycle

### ✅ Professional Trading Terminal UI
- **Performance Analytics**: 30D ROI, Win Rate, Total Signals, Current Position
- **Signal Confidence Chart**: Visual history of last 20 signals
- **Live Feed**: Detailed signal cards with reasoning and proofs
- **Cryptographic Verification**: TEE attestation + 0G Storage hashes

### ✅ Discord Integration
- **Scraping**: Reads community sentiment from designated channel
- **Broadcasting**: Posts beautiful Rich Embeds with signal details
- **Color Coding**: Green (BUY), Violet (HOLD), Magenta (SELL)

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Optional but recommended: OpenRouter for LLM-based analysis
OPENROUTER_API_KEY=your_openrouter_key_here

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=channel_id_to_scrape_sentiment
DISCORD_BROADCAST_CHANNEL_ID=channel_id_to_post_signals

# Cron Security (for production)
CRON_SECRET=your_random_secret_string
```

### 2. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token → `DISCORD_BOT_TOKEN`
5. Enable these intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to OAuth2 → URL Generator
7. Select scopes: `bot`
8. Select permissions: `Read Messages`, `Send Messages`, `Embed Links`
9. Copy the generated URL and invite bot to your server
10. Right-click on your Discord channel → Copy ID → `DISCORD_CHANNEL_ID`

### 3. OpenRouter Setup (Optional)

1. Go to [OpenRouter](https://openrouter.ai/settings)
2. Create an account and generate an API key
3. Add credits ($5 minimum recommended)
4. Copy key → `OPENROUTER_API_KEY`

**Note**: If not configured, AlphaHunter uses rule-based sentiment analysis (still works great!)

### 4. Install Dependencies

```bash
npm install discord.js rss-parser
```

### 5. Test the System

#### Manual Test (Development)
```bash
# Start the dev server
npm run dev

# In another terminal, trigger a signal generation
curl -X POST http://localhost:3000/api/alphahunter/signal \
  -H "Content-Type: application/json" \
  -d '{"agentId": 1, "asset": "SOL/USDT"}'
```

#### Test Discord Integration
```bash
# Check if bot is connected
curl http://localhost:3000/api/cron/alphahunter

# Trigger autonomous cycle
curl -X POST http://localhost:3000/api/cron/alphahunter \
  -H "Authorization: Bearer your_cron_secret"
```

### 6. Setup Cron Job (Production)

#### Option A: Vercel Cron (Recommended)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/alphahunter",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### Option B: External Cron Service

Use [cron-job.org](https://cron-job.org) or similar:
- URL: `https://your-app.vercel.app/api/cron/alphahunter`
- Method: POST
- Header: `Authorization: Bearer your_cron_secret`
- Schedule: `0 * * * *` (every hour)

## API Endpoints

### `POST /api/alphahunter/signal`
Generate a new trading signal manually.

**Request:**
```json
{
  "agentId": 1,
  "asset": "SOL/USDT"
}
```

**Response:**
```json
{
  "signal": {
    "agentId": 1,
    "signalType": 0,
    "confidence": 0.87,
    "target": "SOL/USDT",
    "entryPrice": 145.20,
    "takeProfit": 152.00,
    "stopLoss": 140.00,
    "reasoning": "Analyzed 10 news articles and 42 community messages...",
    "sources": { "discord": 42, "news": 10, "onchain": 0 },
    "timestamp": 1234567890,
    "teeAttestation": "0x8f3d...9e1a",
    "storageHash": "0x4a2b...7c3d",
    "verified": true
  }
}
```

### `GET /api/alphahunter/signal?agentId=1&limit=20`
Fetch historical signals.

### `POST /api/cron/alphahunter`
Autonomous cycle endpoint (protected by `CRON_SECRET`).

## Discord Signal Format

When a signal is generated, AlphaHunter posts a Rich Embed to Discord:

```
🚨 AlphaHunter Autonomous Signal

Signal: BUY (87%)
Asset Pair: SOL/USDT
Current Price: $145.20
Entry Price: $145.20
Take Profit: $152.00
Stop Loss: $140.00

Reasoning:
Analyzed 10 news articles and 42 community messages. Bullish sentiment 
detected with positive momentum indicators. Whale accumulation patterns 
observed on-chain.

TEE Attestation: 0x8f3d...9e1a
Storage Root: 0x4a2b...7c3d

Sealed execution verified on 0G Compute • Autonomous AI Agent
```

## Troubleshooting

### Discord Bot Not Connecting
- Verify `DISCORD_BOT_TOKEN` is correct
- Check bot has proper intents enabled
- Ensure bot is invited to your server
- Verify channel IDs are correct (right-click → Copy ID)

### No News Articles Fetched
- RSS feeds may be temporarily down
- Check network connectivity
- Verify no firewall blocking RSS requests

### LLM Analysis Failing
- Check `OPENROUTER_API_KEY` is valid
- Verify you have credits in OpenRouter account
- System will fallback to rule-based analysis automatically

### Signals Not Appearing in UI
- Check browser console for errors
- Verify API endpoint is accessible
- Check signal store is being populated

## Production Checklist

- [ ] Set `CRON_SECRET` to a strong random string
- [ ] Configure Vercel Cron or external cron service
- [ ] Test Discord bot in a private channel first
- [ ] Monitor OpenRouter usage and costs
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Implement database persistence (replace in-memory store)
- [ ] Add rate limiting to API endpoints
- [ ] Configure CORS if needed

## Cost Analysis

| Service | Cost | Notes |
|---------|------|-------|
| Binance API | **FREE** | Public endpoints, no auth |
| RSS Feeds | **FREE** | Standard RSS parsing |
| Discord Bot | **FREE** | Free tier sufficient |
| OpenRouter (optional) | ~$0.01/signal | Claude 3.5 Sonnet |
| Vercel Hosting | **FREE** | Hobby plan works |

**Total**: $0-$7.20/month (depending on signal frequency and LLM usage)

## Next Steps

1. **Add More Assets**: Extend to ETH, BTC, ARB, OP
2. **On-Chain Data**: Integrate real blockchain event monitoring
3. **Database**: Replace in-memory store with PostgreSQL/MongoDB
4. **WebSocket**: Real-time signal updates without polling
5. **Backtesting**: Historical performance analysis
6. **User Subscriptions**: Allow users to subscribe to specific agents
7. **Mobile App**: React Native app for push notifications

## Support

For issues or questions:
- Check the [main README](../README.md)
- Review [architecture docs](./architecture.md)
- Open an issue on GitHub
