#!/bin/bash

# AlphaHunter System Test Script
# Tests all components of the autonomous trading agent

echo "🧪 AlphaHunter System Test"
echo "=========================="
echo ""

# Check if server is running
echo "1. Checking if Next.js server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server not running. Start with: npm run dev"
    exit 1
fi

echo ""
echo "2. Testing Binance Price API..."
PRICE_TEST=$(curl -s "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT")
if echo "$PRICE_TEST" | grep -q "price"; then
    echo "   ✅ Binance API working"
    echo "   📊 Current SOL/USDT: $(echo $PRICE_TEST | grep -o '"price":"[^"]*"' | cut -d'"' -f4)"
else
    echo "   ❌ Binance API failed"
fi

echo ""
echo "3. Testing News RSS Feeds..."
RSS_TEST=$(curl -s "https://www.coindesk.com/arc/outboundfeeds/rss/" | head -n 20)
if echo "$RSS_TEST" | grep -q "rss"; then
    echo "   ✅ CoinDesk RSS working"
else
    echo "   ⚠️  CoinDesk RSS may be down (not critical)"
fi

echo ""
echo "4. Testing Signal Generation API..."
SIGNAL_TEST=$(curl -s -X POST http://localhost:3000/api/alphahunter/signal \
    -H "Content-Type: application/json" \
    -d '{"agentId": 1, "asset": "SOL/USDT"}')

if echo "$SIGNAL_TEST" | grep -q "signal"; then
    echo "   ✅ Signal generation working"
    SIGNAL_TYPE=$(echo $SIGNAL_TEST | grep -o '"signalType":[0-9]' | cut -d':' -f2)
    CONFIDENCE=$(echo $SIGNAL_TEST | grep -o '"confidence":[0-9.]*' | cut -d':' -f2)
    
    case $SIGNAL_TYPE in
        0) SIGNAL_NAME="BUY" ;;
        1) SIGNAL_NAME="HOLD" ;;
        2) SIGNAL_NAME="SELL" ;;
        *) SIGNAL_NAME="UNKNOWN" ;;
    esac
    
    echo "   📈 Generated: $SIGNAL_NAME (Confidence: $(echo "$CONFIDENCE * 100" | bc)%)"
else
    echo "   ❌ Signal generation failed"
    echo "   Error: $SIGNAL_TEST"
fi

echo ""
echo "5. Testing Signal History API..."
HISTORY_TEST=$(curl -s "http://localhost:3000/api/alphahunter/signal?agentId=1&limit=5")
if echo "$HISTORY_TEST" | grep -q "signals"; then
    COUNT=$(echo $HISTORY_TEST | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "   ✅ Signal history working"
    echo "   📊 Total signals: $COUNT"
else
    echo "   ❌ Signal history failed"
fi

echo ""
echo "6. Checking Environment Variables..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists"
    
    if grep -q "DISCORD_BOT_TOKEN=" .env.local && [ -n "$(grep "DISCORD_BOT_TOKEN=" .env.local | cut -d'=' -f2)" ]; then
        echo "   ✅ Discord bot token configured"
    else
        echo "   ⚠️  Discord bot token not set (optional)"
    fi
    
    if grep -q "OPENROUTER_API_KEY=" .env.local && [ -n "$(grep "OPENROUTER_API_KEY=" .env.local | cut -d'=' -f2)" ]; then
        echo "   ✅ OpenRouter API key configured"
    else
        echo "   ⚠️  OpenRouter API key not set (will use rule-based analysis)"
    fi
    
    if grep -q "CRON_SECRET=" .env.local && [ -n "$(grep "CRON_SECRET=" .env.local | cut -d'=' -f2)" ]; then
        echo "   ✅ Cron secret configured"
    else
        echo "   ⚠️  Cron secret not set (recommended for production)"
    fi
else
    echo "   ⚠️  .env.local not found. Copy from .env.example"
fi

echo ""
echo "7. Testing Cron Endpoint..."
CRON_TEST=$(curl -s http://localhost:3000/api/cron/alphahunter)
if echo "$CRON_TEST" | grep -q "healthy"; then
    echo "   ✅ Cron endpoint accessible"
else
    echo "   ❌ Cron endpoint failed"
fi

echo ""
echo "=========================="
echo "✨ Test Complete!"
echo ""
echo "Next Steps:"
echo "1. Visit http://localhost:3000/dashboard/agents/1 to see the terminal"
echo "2. Configure Discord bot for real-time sentiment (optional)"
echo "3. Add OpenRouter API key for LLM analysis (optional)"
echo "4. Setup cron job for autonomous operation"
echo ""
echo "📚 Documentation: docs/alphahunter-setup.md"
