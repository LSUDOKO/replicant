import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { parse } from "url";
import { AlphaHunterService } from "../lib/alphahunter/services";

const PORT = parseInt(process.env.WS_PORT || "3001");
const SIGNAL_INTERVAL_MS = parseInt(process.env.SIGNAL_INTERVAL_MS || "60000");

interface Client {
  ws: WebSocket;
  subscriptions: Set<number>;
}

const clients: Map<number, Client> = new Map();
const alphaHunter = new AlphaHunterService();

let signalInterval: NodeJS.Timeout | null = null;

async function generateAndBroadcastSignal() {
  try {
    console.log(`[WS] Generating signal...`);
    const signal = await alphaHunter.generateSignal(1);
    
    const signalPayload = {
      type: "signal",
      data: {
        agentId: 1,
        signalType: signal.signal === "BUY" ? 0 : signal.signal === "SELL" ? 2 : 1,
        confidence: Math.round(signal.confidence * 100),
        target: signal.target,
        reasoning: signal.reasoning,
        sources: signal.sources,
        timestamp: Math.floor(signal.timestamp / 1000),
        teeAttestation: signal.teeAttestation,
        verified: true,
      },
    };

    const payloadStr = JSON.stringify(signalPayload);
    
    for (const [agentId, client] of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payloadStr);
        console.log(`[WS] Broadcast to agent ${agentId}`);
      }
    }
  } catch (error) {
    console.error("[WS] Signal generation error:", error);
  }
}

function startSignalGeneration() {
  if (signalInterval) {
    clearInterval(signalInterval);
  }
  signalInterval = setInterval(generateAndBroadcastSignal, SIGNAL_INTERVAL_MS);
  console.log(`[WS] Auto-signal enabled: every ${SIGNAL_INTERVAL_MS / 1000}s`);
}

function handleConnection(ws: WebSocket, req: URL) {
  const agentId = parseInt(req.searchParams.get("agentId") || "1");
  
  console.log(`[WS] Client connected: agent ${agentId}`);
  
  const client: Client = {
    ws,
    subscriptions: new Set([agentId]),
  };
  clients.set(agentId, client);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === "subscribe") {
        const targetAgentId = data.agentId || agentId;
        client.subscriptions.add(targetAgentId);
        clients.set(targetAgentId, client);
        ws.send(JSON.stringify({ type: "subscribed", agentId: targetAgentId }));
        console.log(`[WS] Client subscribed to agent ${targetAgentId}`);
      }
      
      if (data.type === "unsubscribe") {
        const targetAgentId = data.agentId;
        client.subscriptions.delete(targetAgentId);
        ws.send(JSON.stringify({ type: "unsubscribed", agentId: targetAgentId }));
      }

      if (data.type === "generate") {
        generateAndBroadcastSignal();
      }
    } catch (error) {
      console.error("[WS] Message error:", error);
    }
  });

  ws.on("close", () => {
    console.log(`[WS] Client disconnected: agent ${agentId}`);
    client.subscriptions.forEach((id) => {
      const c = clients.get(id);
      if (c && c.subscriptions.size === 0) {
        clients.delete(id);
      }
    });
  });

  ws.on("error", (error) => {
    console.error("[WS] WebSocket error:", error);
  });

  ws.send(JSON.stringify({
    type: "connected",
    agentId,
    message: "Connected to REPLICANT AlphaHunter real-time feed"
  }));
}

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url || "", true);
  
  if (parsedUrl.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ 
      status: "ok", 
      clients: clients.size,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const wss = new WebSocketServer({ server });

wss.on("connection", handleConnection);

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║    REPLICANT ALPHAHUNTER WEBSOCKET SERVER                 ║
╠═══════════════════════════════════════════════════════════╣
║  WebSocket: ws://localhost:${PORT}                        ║
║  Health:     http://localhost:${PORT}/health              ║
║  Subscriptions: ws://localhost:${PORT}?agentId=<id>       ║
╠═══════════════════════════════════════════════════════════╣
║  Auto-signal: every ${SIGNAL_INTERVAL_MS / 1000}s                             ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  startSignalGeneration();
});

process.on("SIGTERM", () => {
  console.log("[WS] Shutting down...");
  if (signalInterval) clearInterval(signalInterval);
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

export { server, wss };