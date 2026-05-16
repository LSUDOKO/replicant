# AlphaHunter Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install & Configure (2 min)
```bash
# Already installed: discord.js, rss-parser
cp .env.example .env.local
npm run dev
```

### Step 2: Test Signal Generation (1 min)
```bash
# Open new terminal
curl -X POST http://localhost:3000/api/alphahunter/signal \
  -H "Content-Type: application/json" \
  -d '{"agentId": 1, "asset": "SOL/USDT"}'
```

### Step 3: View Terminal (1 min)
Open: http://localhost:3000/dashboard/agents/1

### Step 4: Run System Test (1 min)
```bash
./scripts/test-alphahunter.sh
```

## ✅ What Works Right Now (No Config Needed)

- ✅ **Binance API**: Live SOL/USDT prices
- ✅ **RSS Feeds**: CoinDesk, CoinTelegraph, Decrypt news
- ✅ **Rule-Based Analysis**: Sentiment scoring without LLM
- ✅ **Signal Generation**: BUY/HOLD/SELL with confidence
- ✅ **Professional UI**: Trading terminal with charts
- ✅ **Cryptographic Proofs**: TEE + Storage hashes

## 🔧 Optional Enhancements

### Add LLM Analysis (Recommended)
```bash
# Get key from https://openrouter.ai/settings
echo "OPENROUTER_API_KEY=sk-or-v1-..." >> .env.local
```
**Cost**: ~$0.01 per signal (~$7/month for hourly signals)

### Add Discord Integration
```bash
# Setup bot at https://discord.com/developers/applications
echo "DISCORD_BOT_TOKEN=..." >> .env.local
echo "DISCORD_CHANNEL_ID=..." >> .env.local
echo "DISCORD_BROADCAST_CHANNEL_ID=..." >> .env.local
```
**Cost**: FREE

### Setup Autonomous Operation
```bash
# Add to vercel.json
{
  "crons": [{
    "path": "/api/cron/alphahunter",
    "schedule": "0 * * * *"
  }]
}
```

## 📊 API Endpoints

### Generate Signal
```bash
POST /api/alphahunter/signal
Body: {"agentId": 1, "asset": "SOL/USDT"}
```

### Get Signal History
```bash
GET /api/alphahunter/signal?agentId=1&limit=20
```

### Autonomous Cron (Protected)
```bash
POST /api/cron/alphahunter
Header: Authorization: Bearer your_cron_secret
```

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `services/price-service.ts` | Binance API |
| `services/news-service.ts` | RSS feeds |
| `services/discord-service.ts` | Discord bot |
| `app/api/alphahunter/signal/route.ts` | Signal generation |
| `app/api/cron/alphahunter/route.ts` | Autonomous controller |
| `components/alphahunter/AlphaHunterTerminal.tsx` | Trading terminal UI |

## 🐛 Common Issues

### "Cannot fetch signals"
- Check server is running: `npm run dev`
- Verify API endpoint: `curl http://localhost:3000/api/alphahunter/signal?agentId=1`

### "Binance API failed"
- Check internet connection
- Verify no firewall blocking api.binance.com

### "Discord bot not connecting"
- Verify `DISCORD_BOT_TOKEN` is correct
- Check bot has Message Content Intent enabled
- Ensure bot is invited to server

## 📚 Full Documentation

- **Complete Setup**: [docs/alphahunter-setup.md](docs/alphahunter-setup.md)
- **Implementation Details**: [docs/alphahunter-implementation.md](docs/alphahunter-implementation.md)
- **Main README**: [ALPHAHUNTER.md](ALPHAHUNTER.md)

## 🎓 How It Works

```
Cron (hourly) → Fetch Data (Binance + RSS + Discord)
              → Analyze (LLM or Rule-based)
              → Generate Signal (BUY/HOLD/SELL)
              → Create Proofs (TEE + Storage)
              → Deliver (UI + Discord)
```

## 🏆 Demo Checklist

- [ ] Server running (`npm run dev`)
- [ ] Generate test signal (curl command above)
- [ ] View terminal (http://localhost:3000/dashboard/agents/1)
- [ ] Check signal appears in UI
- [ ] Verify countdown timer is running
- [ ] Confirm chart displays signal history
- [ ] Test Discord broadcast (if configured)

## 💡 Pro Tips

1. **No LLM?** Rule-based analysis works great for demos
2. **No Discord?** System works perfectly without it
3. **Testing?** Use `./scripts/test-alphahunter.sh`
4. **Production?** Add `CRON_SECRET` and setup Vercel Cron

## 🎯 Success Metrics

- ✅ Signal generated in < 5 seconds
- ✅ UI updates automatically
- ✅ Countdown timer shows next cycle
- ✅ Chart displays signal history
- ✅ Cryptographic proofs visible
- ✅ Discord broadcast (if configured)

---

**Need Help?** Check [docs/alphahunter-setup.md](docs/alphahunter-setup.md) for detailed troubleshooting.
