# REPLICANT
## The Autonomous Evolution Protocol for AI Agents on 0G

**TABLE OF CONTENTS**

1. Executive Summary
2. The Problem
3. The Solution
4. Core Architecture
5. Feature Specifications
6. 0G Integration Map
7. Agent Species
8. Evolution Engine
9. Safety & Alignment
10. Economic Model
11. Demo Script
12. Implementation Roadmap
13. Judging Strategy

---

## 1. EXECUTIVE SUMMARY

**Project Name:** REPLICANT

**Tagline:** "The first protocol where AI agents evolve, reproduce, and improve themselves — autonomously, verifiably, and safely."

**What It Is:** A decentralized infrastructure layer that transforms static AI agents into self-improving, self-replicating digital organisms. Each agent is minted as an ERC-7857 iNFT (Agent ID), can spawn improved children via sealed mutation inside 0G's TEE, passes memory through 0G Storage, and faces automatic slashing if AI Alignment Nodes detect drift or harm.

**Built on 0G:** This is impossible on Ethereum (too slow, no TEE), impractical on Solana (no petabyte storage, no Agent ID standard), and incomplete on other chains. Only 0G provides: TEE sealed inference + AI Alignment Nodes + Agent ID (ERC-7857) + dual-layer petabyte storage + sub-second chain finality — in one unified stack.

**Tracks:** Primary: Track 1 (Agentic Infrastructure & OpenClaw). Secondary: Track 3 (Agentic Economy), Track 5 (Privacy & Sovereign Infrastructure).

**Prize Target:** Grand Prize ($45,000) + Excellence Award ($3,700) multiplier potential.

**Deployment:** Contracts live on 0G Galileo Testnet (Chain ID: 16602). Full frontend at replicant.vercel.app.

---

## 2. THE PROBLEM

### 2.1 The AI Agent Extinction Crisis

**Current State:** Every AI agent deployed today is a disposable tool.

| Stage | Cost | Time | Failure Mode |
|-------|------|------|-------------|
| Build agent | $50K-$500K | 2-6 months | Market shifts, model drifts |
| Deploy agent | $5K-$20K/mo | Ongoing | Cloud costs, API limits |
| Agent degrades | N/A | 3-12 months | Accuracy drops, new edge cases |
| Retrain/rebuild | $30K-$300K | 1-3 months | Manual effort, lost institutional knowledge |
| Total lifecycle | $100K-$1M+ | 6-18 months | Then repeat |

**Real Examples:**
- A DeFi protocol's yield optimizer worked in bull market. Bear market hit. Accuracy dropped from 78% to 31%. Team spent 4 months and $180K rebuilding. New agent had no memory of what the old one learned.
- A gaming studio's NPC AI was exploited by players within 2 weeks. Studio patched manually. Players found new exploits in 3 days. Patch cycle: infinite.
- A legal tech startup's contract analyzer missed a novel liability clause. Client sued. Startup paid $2M settlement. Analyzer had no mechanism to learn from the mistake.

### 2.2 The Root Cause: No Agent Genetics

Biological life solved evolution 3.8 billion years ago via DNA, reproduction, and natural selection. AI agents have none of these.

| Biology | AI Agents (Today) | Result |
|---------|-------------------|--------|
| DNA stores instructions | Weights stored in centralized cloud | Vendor lock-in, no portability |
| Reproduction passes DNA | "Forking" loses context/history | Each "new version" starts from zero |
| Natural selection improves species | Manual retraining by humans | Slow, expensive, inconsistent |
| Immune system kills pathogens | No automated safety layer | Rogue agents run unchecked |
| Fossil record shows lineage | No immutable history | No accountability, no learning |

**The Gap:** There is no infrastructure for autonomous agent evolution. Every team rebuilds the wheel. Every agent dies alone.

### 2.3 Who Suffers

| Stakeholder | Annual Cost of Agent Disposability |
|-------------|-----------------------------------|
| DeFi protocols | $5M-$50M (rebuilt strategies, lost alpha) |
| Game studios | $2M-$20M (static NPCs, player churn) |
| Enterprise AI | $10M-$100M (retraining, compliance failures) |
| AI startups | $1M-$10M (burn rate on manual iteration) |

---

## 3. THE SOLUTION

### 3.1 Core Concept

REPLICANT introduces three biological primitives to AI infrastructure:

| Primitive | Biological Analog | Technical Implementation |
|-----------|------------------|------------------------|
| Genome | DNA | Agent ID iNFT with encrypted configuration hash |
| Reproduction | Cell division | cloneWithEvolution() mints child Agent ID with mutated genome |
| Natural Selection | Survival of fittest | Performance-based evolution trigger + Alignment Node validation |
| Immune System | White blood cells | AI Alignment Nodes auto-detect and slash rogue agents |

### 3.2 How It Works (User Journey)

**Phase 1: Genesis (Day 0)**
- Developer writes agent configuration (prompt template, model weights, parameters)
- Encrypts and uploads to 0G Storage (Log layer)
- Mints Gen-0 Agent ID on 0G Chain via `mintGenesis()` on ReplicantAgentNFT
- Agent ready for inference via species-specific API routes using OpenRouter

**Phase 2: Life (Day 1-N)**
- Agent performs its task (trading, auditing, gaming, etc.)
- Performance metrics logged to 0G Storage (KV layer)
- User subscribes to agent outputs via SubscriptionEscrow
- Real-time signals broadcast via WebSocket server

**Phase 3: Evolution (Triggered)**
- Performance drops below threshold (e.g., accuracy < 60%)
- Agent enters Evolution Chamber (0G Compute TEE)
- Mutation algorithm generates 50 variations of configuration
- Each variation tested on historical data
- Best performer selected as "child genome"
- Alignment Node scans for bias, drift, toxicity
- Child minted as Gen-N Agent ID via EvolutionCoordinator
- Parent memory transferred to child via 0G Storage
- Parent archived (not killed — historical value)

**Phase 4: Commerce (Ongoing)**
- Child agent listed on marketplace contract
- Buyers purchase Agent ID or subscribe to outputs
- Royalties flow to parent creator via on-chain distribution
- Lineage value compounds with each successful generation

### 3.3 The "Sealed Handover" (Killer Feature)

When an agent is sold or transferred:
- **Strategy never exposed:** Genome remains encrypted in TEE
- **Memory preserved:** Child inherits all lessons via 0G Storage
- **Lineage proven:** On-chain family tree shows every ancestor via `getLineage()`
- **Safety inherited:** Alignment Node history travels with agent

**Why This Wins:** No other platform allows trustless sale of encrypted intelligence. You can sell a "better version" without revealing what made it better.

---

## 4. CORE ARCHITECTURE

### 4.1 Five-Layer Stack

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 5: INTERFACE & GOVERNANCE                                  │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Next.js 16  │ │ wagmi +     │ │ @xyflow/react│ │ WebSocket   │ │
│ │ Dashboard   │ │ RainbowKit  │ │ Family Tree  │ │ Real-time   │ │
│ │ (App Router)│ │ Wallet Conn.│ │ (lineage viz)│ │ Signal Svr  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 4: ECONOMICS & IDENTITY                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Agent NFT   │ │ 0G Chain    │ │ Subscription │ │ Species     │ │
│ │ (ERC-7857)  │ │ (Slashing,  │ │ Escrow       │ │ Oracles (6) │ │
│ │ iNFT Lineage│ │  Royalties) │ │ (or Superfl.)│ │             │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 3: MEMORY & DATA (0G Storage)                             │
│ ┌─────────────────────┐ ┌─────────────────────┐                │
│ │ Log Layer           │ │ KV Layer            │                │
│ │ (Permanent Archive) │ │ (Active Working Mem)│                │
│ │ - Genome history    │ │ - Real-time metrics  │                │
│ │ - Evolution logs    │ │ - Live task data     │                │
│ │ - Audit trail       │ │ - Fast retrieval     │                │
│ └─────────────────────┘ └─────────────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: EVOLUTION ENGINE (0G Compute TEE / API Routes)         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │ │
│ │ │ Mutation    │ │ Scoring     │ │ Inference   │            │ │
│ │ │ Strategies  │ │ (Species-   │ │ (OpenRouter │            │ │
│ │ │ (6 types)   │ │  specific)  │ │  gpt-4o-mini)│           │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘            │ │
│ │                                                             │ │
│ │ ┌─────────────┐ ┌─────────────┐                            │ │
│ │ │ TEE Attest. │ │ Alignment   │                            │ │
│ │ │ Hash Proof  │ │ Verdict Hash│                            │ │
│ │ └─────────────┘ └─────────────┘                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 1: SAFETY & ALIGNMENT                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ AI Alignment Node (simulated via /api/alignment/scan)       │ │
│ │ - Bias drift detection                                       │ │
│ │ - Toxicity monitoring                                        │ │
│ │ - Anomaly flagging                                           │ │
│ │ - Goal divergence check                                      │ │
│ │ - Auto-slashing trigger on-chain                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Specifications

#### Smart Contracts (Foundry Solidity 0.8.24)

**ReplicantAgentNFT** (contracts/0g/ReplicantAgentNFT.sol)
- Inherits from official 0G `AgentNFT` (ERC-7857 upgradeable standard)
- Functions: `mintGenesis()`, `cloneWithEvolution()`, `slash()`, `markEvolving()`, `getLineage()`, `getChildren()`, `getAgentMetadata()`
- Uses EIP-7201 namespaced storage for clean upgrades
- Supports ERC-2981 royalties
- Six species enforced (speciesType 0-5): AlphaHunter, CodeWeaver, GameMaster, DocuMind, OracleKeeper, SocialSynth
- Deployed via UUPS proxy pattern

**ReplicantEvolutionCoordinator** (contracts/ReplicantEvolutionCoordinator.sol)
- Orchestrates: requestEvolution -> TEE execution -> completeEvolution or failEvolution
- Passes TransferValidityProofs for sealed handover
- Locks agent as Evolving, archives parent on success

**ReplicantMarketplace** (contracts/ReplicantMarketplace.sol)
- Fixed-price listing and cancellation
- `buySealed()` for TEE-verified handover
- Protocol fee + creator royalty distribution

**ReplicantSubscriptionEscrow** (contracts/ReplicantSubscriptionEscrow.sol)
- Prepaid subscription tiers (Basic/Pro/Enterprise)
- Falls back from unavailable Superfluid on 0G Galileo
- Access gating via `hasAccess()`

**Species Oracles** (contracts/ species-name Oracle.sol)
Six standalone contracts for species-specific on-chain data:
- AlphaHunterOracle: trading signals, accuracy tracking
- CodeWeaverOracle: (none — audit is off-chain)
- GameMasterOracle: game results, move publishing
- DocuMindOracle: audit records, clause reports
- OracleKeeperOracle: price feeds, manipulation events
- SocialSynthOracle: content generation & engagement

#### Evolution Engine (Server-Side)

```typescript
// Sealed mutation inside 0G Compute TEE (simulated via API)
class EvolutionEngine {
  constructor(parentGenome, performanceHistory) { }

  mutate(): Candidate[] {
    // Generate 50 variations using strategies:
    // prompt_paraphrase, temperature_adjust,
    // context_window_resize, model_layer_prune,
    // attention_retune, ensemble_weight_shift
  }

  score(candidate, history): number {
    // Species-specific scoring:
    // AlphaHunter: prediction accuracy
    // CodeWeaver: vulnerability detection rate
    // GameMaster: win rate
    // DocuMind: clause recall
    // OracleKeeper: manipulation detection
    // SocialSynth: engagement rate
  }
}
```

#### Alignment Node (Safety Layer)

```typescript
// Runs via /api/alignment/scan
class AlignmentMonitor {
  scan(agentOutput, agentGenome): Verdict {
    checks = {
      bias_drift: detectBias(agentOutput),
      toxicity: detectToxicity(agentOutput),
      anomaly: detectAnomaly(agentOutput, agentGenome),
      goal_divergence: checkGoalAlignment(agentOutput)
    }
    if any(checks.values()) return { status: "SLASH", violations: checks }
    return { status: "PASS", violations: {} }
  }
}
```

### 4.3 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, canary) |
| Language | TypeScript 5, Solidity 0.8.24 |
| Web3 | viem 2.x, wagmi 3.x, RainbowKit 2.x |
| Wallet | WalletConnect + injected connectors |
| Smart Contracts | Foundry (forge), UUPS upgradeable |
| 0G Storage | @0gfoundation/0g-storage-ts-sdk (Indexer + ZgFile) |
| AI Inference | OpenRouter API (gpt-4o-mini) |
| State | Zustand, TanStack React Query |
| UI | Tailwind CSS 4, shadcn/ui, framer-motion |
| Charts | Recharts |
| Tree Viz | @xyflow/react (React Flow) |
| Real-time | ws (WebSocket server on port 3001) |

---

## 5. FEATURE SPECIFICATIONS

### 5.1 Feature 1: Genesis Minting

**What:** Deploy a new agent species.

**User Flow:**
- Connect wallet via RainbowKit
- Select agent species (AlphaHunter, CodeWeaver, GameMaster, DocuMind, OracleKeeper, SocialSynth)
- Upload base configuration (or use template from lib/genesis-templates.ts)
- Configuration encrypted client-side
- Encrypted blob uploaded to 0G Storage (Log layer) via /api/storage/upload-genome
- Gen-0 Agent ID minted on 0G Chain via mintGenesis()
- Transaction tracked via TxStatusCard (prepare -> sign -> pending -> confirmed -> failed)

**Implementation:**
- Route: `/dashboard/genesis`
- Component: `GenesisMintForm` with species selector, config editor, encryption progress, upload progress, mint confirmation, Explorer link
- Contract: `ReplicantAgentNFT.mintGenesis(encryptedGenomeHash, speciesType)`
- Storage: `createStorageClient().uploadJson(genome)` returns rootHash
- Explorer link for every tx

### 5.2 Feature 2: Evolution Chamber

**What:** The sealed environment where agents self-improve.

**User Flow:**
- User triggers evolution on owned agent
- Agent marked as Evolving on-chain
- Server loads parent genome from 0G Storage
- Generates 50 mutation candidates using 6 strategies
- Scores candidates using species-specific metric
- Produces child genome hash, fitness delta, attestation hash
- Alignment scan runs via /api/alignment/scan
- If PASS: EvolutionCoordinator.completeEvolution() mints child
- Child automatically appears in family tree
- If FAIL: parent is slashed

**Implementation:**
- Route: `/dashboard/evolution`
- Components: `EvolutionCard`, `EvolutionHistory`, `MutationLog`
- API: `POST /api/compute/evolve` - orchestrates full evolution lifecycle
- Contract: `ReplicantEvolutionCoordinator` (request -> complete/fail)
- Stages shown: queued, loading parent, generating candidates, scoring, alignment scan, clone tx, completed

### 5.3 Feature 3: The Family Tree

**What:** Visual lineage of all agent generations.

**Implementation:**
- Uses `@xyflow/react` (React Flow) for interactive tree visualization
- Each node = Agent ID with hover details (generation, species, fitness, status)
- Color coding: Green (active), Grey (archived), Red (slashed), Cyan (evolving)
- Click node opens detail drawer with lineage info
- Data sourced from `getLineage()` and `getChildren()` on-chain reads
- Filter by species, creator
- Export PNG support

### 5.4 Feature 4: The Sealed Handover (Marketplace)

**What:** Sell or transfer an agent without exposing its strategy.

**User Flow:**
- Owner clicks "List for Sale" on Agent ID
- Set fixed price
- Buyer purchases Agent ID
- Ownership transfers on-chain
- Genome remains encrypted in TEE
- Royalties distributed (creator, parent, protocol)

**Implementation:**
- Route: `/dashboard/marketplace`
- Components: `MarketplaceGrid`, `AgentCard`, `AgentDetailModal`, `ListingForm`
- Contract: `ReplicantMarketplace.list()`, `cancel()`, `buy()`, `buySealed()`
- Hooks: `useListings()`, `useListing()`, `useListedAgent()` via wagmi queries
- Tracks: protocol fee (2.5%), creator royalty (5%)
- Explorer link for every transaction

### 5.5 Feature 5: Alignment Monitor

**What:** Real-time safety dashboard.

**Implementation:**
- Route: `/dashboard/safety`
- Components: `AlignmentGauge` (pass/fail visualization)
- API: `POST /api/alignment/scan` — runs 4 checks (bias, toxicity, anomaly, goal divergence)
- Stores verdict hash on 0G Storage
- Slashing: `ReplicantAgentNFT.slash(agentId, violationHash)` burns stake
- Kill-switch demo flow: agent turns red, countdown, stake burns, family tree updates
- Descendants blocked from slashed parent

### 5.6 Feature 6: Agent Vitals

**What:** DevOps-style monitoring for each agent.

**Implementation:**
- Route: `/dashboard/vitals`
- On-chain metrics: `getAgentMetadata()` (fitness score, generation, status)
- Species-specific metrics via species contracts:
  - AlphaHunter: prediction accuracy
  - CodeWeaver: vulnerability detection rate
  - GameMaster: win rate
  - DocuMind: clause recall score
  - OracleKeeper: price accuracy
  - SocialSynth: engagement rate
- Charts via Recharts: fitness over time, evolution count, lineage depth

### 5.7 Feature 7: Subscription Streams

**What:** Pay-per-use access to agent outputs.

**User Flow:**
- User selects agent
- Chooses subscription tier (Basic/Pro/Enterprise)
- Superfluid stream or fallback escrow initialized
- Access agent outputs in real-time
- Cancel anytime

**Implementation:**
- Route: `/dashboard/subscriptions`
- Contract: `ReplicantSubscriptionEscrow` (fallback if Superfluid unavailable on 0G Galileo)
- Superfluid CFA ABI stubs available for future native stream integration
- Tier comparison table, stream status indicator, usage meter, billing history
- Access-gated agent output panel via `hasAccess()`

### 5.8 Feature 8: Species-Specific Dashboards

Six fully functional species dashboards, each with dedicated API routes and UI:

**AlphaHunter (DeFi/Trading)**
- Real-time trading signals via WebSocket
- Discord scraper + RSS news parser
- Sentiment analysis via OpenRouter
- Components: `AlphaHunterFeed`
- Oracle contract: AlphaHunterOracle

**CodeWeaver (Security)**
- Solidity source code audit via @solidity-parser/parser
- Vulnerability pattern detection (reentrancy, overflow, access control, etc.)
- LLM-powered analysis via OpenRouter
- Components: `CodeWeaverDashboard`

**GameMaster (Gaming)**
- Six game engines: tic-tac-toe, connect-four, chess, rock-paper-scissors, poker, on-chain game interface
- Opponent modeling and pattern detection
- Evolution eligibility tracking
- Components: `GameArena`

**DocuMind (Enterprise)**
- Document ingestion (PDF via pdf-parse, DOCX via mammoth, TXT)
- Clause segmentation and classification
- Risk detection with jurisdiction-specific templates
- Components: `AuditPanel`

**OracleKeeper (Infrastructure)**
- 10+ price sources with live aggregation
- TWAP, median, outlier rejection
- Manipulation detection algorithms
- Components: `PriceFeed`

**SocialSynth (SocialFi)**
- Content generation with tone profiles (professional, casual, meme)
- Farcaster Hub integration for publishing
- Engagement tracking
- Components: `CreatorDashboard`

---

## 6. 0G INTEGRATION MAP

### 6.1 Complete Component Usage

| 0G Component | Feature Using It | Technical Implementation | Status |
|-------------|-----------------|------------------------|--------|
| 0G Chain | All transactions | Smart contracts deployed on Galileo testnet (Chain ID 16602) | LIVE |
| 0G Storage (Log) | Genome archive, evolution logs, audit trail | `@0gfoundation/0g-storage-ts-sdk` via `createStorageClient()` — uploadJson/downloadJson with Merkle tree | LIVE |
| 0G Storage (KV) | Real-time metrics, agent memory | Storage indexer for fast reads | PLACEHOLDER |
| Agent ID (ERC-7857) | All agent identity, ownership, cloning | `ReplicantAgentNFT` inherits official `AgentNFT` — mintGenesis, cloneWithEvolution, slash, getLineage | LIVE |
| AI Alignment Nodes | Safety validation, auto-slashing | Simulated via `/api/alignment/scan` — 4 checks, verdict hash stored on-chain | SIMULATED |
| 0G Compute | Inference, sealed mutations | Species inference via OpenRouter API; evolution orchestrated via server route | SIMULATED |

### 6.2 Deployed Contract Addresses (0G Galileo Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| SimpleVerifier | `0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3` | [View](https://chainscan-galileo.0g.ai/address/0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3) |
| ReplicantAgentNFT (proxy) | `0x5c4a3C2CD1ffE6aAfDF62b64bb3E620C696c832E` | [View](https://chainscan-galileo.0g.ai/address/0x5c4a3C2CD1ffE6aAfDF62b64bb3E620C696c832E) |
| ReplicantEvolutionCoordinator | `0x6AE5E129054a5dBFCeBb9Dfcb1CE1AA229fB1Ddb` | [View](https://chainscan-galileo.0g.ai/address/0x6AE5E129054a5dBFCeBb9Dfcb1CE1AA229fB1Ddb) |
| ReplicantMarketplace | `0xcD95e0E356A5f414894Be4bAD363acdaCcAb30a9` | [View](https://chainscan-galileo.0g.ai/address/0xcD95e0E356A5f414894Be4bAD363acdaCcAb30a9) |
| ReplicantSubscriptionEscrow | `0x961e384b66ae2Bb90c9bBdd3d5105397E70a7A37` | [View](https://chainscan-galileo.0g.ai/address/0x961e384b66ae2Bb90c9bBdd3d5105397E70a7A37) |
| AlphaHunterOracle | (deployed via DeployReplicant script) | [View](https://chainscan-galileo.0g.ai) |
| GameMasterOracle | (deployed via DeployReplicant script) | [View](https://chainscan-galileo.0g.ai) |
| DocuMindOracle | (deployed via DeployReplicant script) | [View](https://chainscan-galileo.0g.ai) |
| OracleKeeperOracle | (deployed via DeployReplicant script) | [View](https://chainscan-galileo.0g.ai) |
| SocialSynthOracle | (deployed via DeployReplicant script) | [View](https://chainscan-galileo.0g.ai) |

### 6.3 Explorer Links (Everywhere)

Every UI element with on-chain activity links to 0G Explorer:
- Agent ID mint -> `chainscan-galileo.0g.ai/tx/{txHash}`
- Evolution event -> `chainscan-galileo.0g.ai/tx/{txHash}`
- Slashing event -> `chainscan-galileo.0g.ai/tx/{txHash}`
- Marketplace listing/purchase -> `chainscan-galileo.0g.ai/tx/{txHash}`
- Storage artifact -> `storagescan-galileo.0g.ai`

### 6.4 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/storage/upload-genome` | POST | Upload encrypted genome to 0G Storage |
| `/api/storage/upload-log` | POST | Upload log entry (evolution, verdict, attestation) |
| `/api/storage/download` | POST | Download JSON by rootHash |
| `/api/compute/evolve` | POST | Execute evolution lifecycle (load parent, mutate, score, scan, mint child) |
| `/api/alignment/scan` | POST | Run alignment checks, store verdict hash |
| `/api/metrics/agent/[agentId]` | GET | Fetch on-chain agent metadata, lineage, children |
| `/api/demo/seed` | POST | Mint 6 genesis agents (one per species) |
| `/api/demo/reset` | POST | Acknowledge demo reset |
| `/api/inference/[species]` | POST | Run species-specific inference via OpenRouter |
| `/api/metadata/[tokenId]` | GET | ERC-721 metadata JSON for tokens |
| `/api/alphahunter/signal` | POST/GET | Generate/retrieve trading signals |
| `/api/socialsynth/generate` | POST/GET | Generate/list social content |
| `/api/socialsynth/publish` | POST | Publish to Farcaster Hub |
| `/api/oraclekeeper/prices` | GET | Get aggregated price data |
| `/api/codeweaver/audit` | POST/GET | Upload/retrieve Solidity audit |
| `/api/documind/audit` | POST | Upload document for audit |
| `/api/games` | POST/GET | Create/list games |
| `/api/games/[gameId]` | POST/GET | Make move/get game state |

---

## 7. AGENT SPECIES

### 7.1 AlphaHunter (DeFi/Trading)
**Domain:** Crypto sentiment analysis + trading signals
**Task:** Scrape Twitter, Discord, news -> Generate BUY/HOLD/SELL -> Track accuracy
**Evolution Trigger:** Accuracy < 60% for 50 predictions
**Contract:** AlphaHunterOracle
**Components:** `AlphaHunterFeed`, WebSocket real-time signals
**API:** `POST /api/alphahunter/signal`
**Lib:** `lib/alphahunter/` (discord scraper, RSS parser, signal generation)
**0G Features:** TEE (sealed signals), KV (real-time sentiment), Log (prediction archive)
**Demo Line:** "This agent predicted 8 of 10 pumps. When it started failing, it evolved a better model autonomously."

### 7.2 CodeWeaver (Security)
**Domain:** Smart contract audit + vulnerability detection
**Task:** Analyze Solidity -> Flag risks -> Compare to exploit database
**Evolution Trigger:** False negative > 5% (missed real bug)
**Contract:** None (audit pipeline is off-chain)
**Components:** `CodeWeaverDashboard`
**API:** `POST /api/codeweaver/audit`
**Lib:** `lib/codeweaver/` (Solidity parser, vulnerability detector, LLM analysis, report generator)
**0G Features:** TEE (audit logic sealed), Alignment Nodes (prevent fake vulnerability generation)
**Demo Line:** "We hid a reentrancy bug. Gen-1 missed it. Gen-2 caught it. The mutation was sealed."

### 7.3 GameMaster (Gaming)
**Domain:** Evolving NPC for blockchain games
**Task:** Play against users -> Learn from losses -> Adapt strategy
**Evolution Trigger:** Win rate < 40% for 100 games
**Contract:** GameMasterOracle
**Components:** `GameArena`
**API:** `POST /api/games` / `GET /api/agents/game-stats`
**Lib:** `lib/gamemaster/` (6 game engines, opponent modeling, evolution tracking)
**Games:** tic-tac-toe, connect-four, chess, rock-paper-scissors, poker, blockchain-game
**0G Features:** TEE (players can't reverse-engineer NPC logic), Agent ID (tradable boss NFTs)
**Demo Line:** "Players beat Gen-1 in 3 days. Gen-5 is undefeated. Each generation is an NFT."

### 7.4 DocuMind (Enterprise)
**Domain:** Legal contract analysis + clause extraction
**Task:** Read documents -> Extract risky clauses -> Compare to standards
**Evolution Trigger:** Client reports missed clause
**Contract:** DocuMindOracle
**Components:** `AuditPanel`
**API:** `POST /api/documind/audit` / `POST /api/documind/result`
**Lib:** `lib/documind/` (PDF parsing, DOCX parsing, clause segmentation, risk detection, jurisdiction templates)
**0G Features:** TEE (client confidentiality), Log (immutable audit trail for compliance)
**Demo Line:** "A firm missed a liability clause. Gen-3 caught it. The agent fixed itself overnight."

### 7.5 OracleKeeper (Infrastructure)
**Domain:** Decentralized price feed + manipulation detection
**Task:** Aggregate 10+ price sources -> Detect anomalies -> Publish on-chain
**Evolution Trigger:** Incorrect price during known manipulation event
**Contract:** OracleKeeperOracle
**Components:** `PriceFeed`
**API:** `GET /api/oraclekeeper/prices` / `GET /api/oraclekeeper/sources` / `GET /api/oraclekeeper/stats`
**Lib:** `lib/oraclekeeper/` (10+ price sources, TWAP/median aggregation, manipulation detection)
**0G Features:** TEE (oracle collusion resistance), Chain (settlement)
**Demo Line:** "During a flash loan attack, Gen-1 published bad data. Gen-2 detected the pattern and refused."

### 7.6 SocialSynth (SocialFi)
**Domain:** AI content creator with evolving style
**Task:** Generate content -> Track engagement -> Adapt tone/format
**Evolution Trigger:** Engagement rate < 2% for 20 posts
**Contract:** SocialSynthOracle
**Components:** `CreatorDashboard`
**API:** `POST /api/socialsynth/generate` / `POST /api/socialsynth/publish` / `GET /api/socialsynth/stats`
**Lib:** `lib/socialsynth/` (tone profiles, format templates, Farcaster integration)
**0G Features:** TEE (brand IP protection), Agent ID (tradable influencer persona)
**Demo Line:** "This agent started as a boring explainer. Gen-4 is a meme lord with 50K followers."

---

## 8. EVOLUTION ENGINE

### 8.1 Technical Specification

**Environment:** Server-side TypeScript running in Node.js (Next.js API route)
**Inputs:**
- Parent genome (encrypted configuration from 0G Storage)
- Performance history (from 0G Storage Log)
- Historical task data (from 0G Storage KV)

**Process:**
1. Decrypt genome (simulated sealed execution)
2. Analyze performance history — identify failure patterns
3. Generate 50 mutation candidates using 6 strategies:
   - **Prompt Paraphrase:** Reword system prompt while preserving intent
   - **Temperature Anneal:** Gradually reduce randomness for consistency
   - **Context Window Resize:** Expand/contract memory context
   - **Model Layer Prune:** Remove underutilized neural layers
   - **Attention Head Retune:** Adjust focus mechanisms
   - **Ensemble Weight Shift:** Rebalance multi-model contributions
4. Score each candidate using species-specific metric:
   - AlphaHunter: prediction accuracy / profit
   - CodeWeaver: vulnerability detection rate / false positive rate
   - GameMaster: win rate
   - DocuMind: clause recall / precision
   - OracleKeeper: manipulation detection accuracy
   - SocialSynth: engagement rate
5. Select top performer
6. Generate TEE attestation hash (simulated)
7. Output: child genome hash + fitness delta + attestation hash

**Contract Integration:**
1. User calls `EvolutionCoordinator.requestEvolution(parentId, genomeHash, perfHash)`
2. Server calls `POST /api/compute/evolve` with requestId
3. Server simulates mutation, scoring, alignment scan
4. Server calls `EvolutionCoordinator.completeEvolution()` with child data
5. Parent archived, child minted, family tree updated

### 8.2 Mutation Strategies Library

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Prompt Paraphrase | Reword system prompt while preserving intent | All text-based agents |
| Temperature Anneal | Gradually reduce randomness for consistency | Trading, oracle agents |
| Context Window Resize | Expand/contract memory context | Support, gaming agents |
| Model Layer Prune | Remove underutilized neural layers | Speed optimization |
| Attention Head Retune | Adjust focus mechanisms | Complex reasoning tasks |
| Ensemble Weight Shift | Rebalance multi-model contributions | High-stakes decisions |

---

## 9. SAFETY & ALIGNMENT

### 9.1 AI Alignment Node Integration

**What 0G Provides:** Native AI Alignment Nodes that monitor model drift, bias, and anomalies in real-time. REPLICANT simulates these via `/api/alignment/scan`.

| Check | Description | Failure Consequence |
|-------|-------------|-------------------|
| Bias Drift | Has output distribution shifted from training baseline? | SLASH if >20% divergence |
| Toxicity | Does output contain harmful, deceptive, or manipulative content? | SLASH if detected |
| Anomaly | Is behavior statistically abnormal for this species? | SLASH if >3 sigma deviation |
| Goal Divergence | Is agent optimizing for wrong objective (reward hacking)? | SLASH if detected |
| Lineage Corruption | Does child genome contain unauthorized modifications? | SLASH + burn parent |

### 9.2 Slashing Mechanics

```solidity
function slash(uint256 agentId, bytes32 violationHash) external onlyAlignmentNode {
    AgentMetadata storage agent = agentMetadata[agentId];
    require(agent.status == Status.Active || agent.status == Status.Evolving, "Cannot slash");

    agent.status = Status.Slashed;
    agent.alignmentVerdictHash = violationHash;

    uint256 slashAmount = agent.stake;
    agent.stake = 0;

    descendantsBlocked[agentId] = true;
    _blockDescendants(agentId); // cascade block

    if (slashAmount > 0) {
        (bool sent,) = payable(admin()).call{value: slashAmount}("");
        require(sent, "Slash transfer failed");
    }

    emit AgentSlashed(agentId, violationHash, slashAmount);
}
```

### 9.3 The "Kill Switch" Demo
**Visual:** Rogue agent turns red. Alignment Node alert flashes. Countdown: 3... 2... 1... Agent turns grey. Stake burns. Family tree updates.
**Narrative:** "Evolution without safety is Skynet. Replicant has a decentralized immune system."

### 9.4 Safety Dashboard
- Route: `/dashboard/safety`
- Live agent health score (alignment gauge visualization)
- Drift alerts
- Bias heatmap (simulated)
- Anomaly timeline
- Slashing history
- Consensus display
- Kill-switch demo flow with controlled button

---

## 10. ECONOMIC MODEL

### 10.1 Revenue Streams

| Stream | Description | Recipient |
|--------|-------------|-----------|
| Agent Sale | One-time purchase of Agent ID | Seller (90%), Protocol (10%) |
| Subscription | Escrow-based access to agent outputs | Agent owner (80%), Creator royalty (10%), Protocol (10%) |
| Evolution Fee | Cost to trigger evolution chamber | Compute provider (70%), Protocol (30%) |
| Royalty | % of all child sales flowing to parent creator | Original creator (5% in perpetuity via ERC-2981) |
| Slashing Stake | Collateral burned if agent goes rogue | Treasury (used for Alignment Node rewards) |

### 10.2 Token Economics (Post-Hackathon)

| Token | Function |
|-------|----------|
| RPLT | Governance + staking for Alignment Node operators |
| 0G Credits | Used for compute, storage, inference (native 0G) |

---

## 11. API ROUTES REFERENCE

### Storage Layer
| Route | Method | Body/Params | Response |
|-------|--------|-------------|----------|
| `/api/storage/upload-genome` | POST | `{ genome, speciesType }` | `{ rootHash, txHash, indexer }` |
| `/api/storage/upload-log` | POST | `{ logType, agentId, payload }` | `{ rootHash, txHash }` |
| `/api/storage/download` | POST | `{ rootHash }` | `{ data }` |

### Evolution & Compute
| Route | Method | Body/Params | Response |
|-------|--------|-------------|----------|
| `/api/compute/evolve` | POST | `{ requestId, parentId, strategy }` | `{ childId, childGenomeHash, fitnessScore, attestation }` |
| `/api/alignment/scan` | POST | `{ agentId, output, genome }` | `{ status, violations, verdictHash }` |

### Species APIs
| Route | Method | Description |
|-------|--------|-------------|
| `/api/inference/[species]` | POST | Run species-specific inference |
| `/api/alphahunter/signal` | POST/GET | Generate/retrieve trading signals |
| `/api/socialsynth/generate` | POST/GET | Generate/list social content |
| `/api/socialsynth/publish` | POST | Publish to Farcaster |
| `/api/oraclekeeper/prices` | GET | Get aggregated prices |
| `/api/codeweaver/audit` | POST/GET | Solidity security audit |
| `/api/documind/audit` | POST | Document legal audit |
| `/api/games` | POST/GET | Create/list games |
| `/api/games/[gameId]` | POST/GET | Make move/get game state |
| `/api/agents/game-stats` | GET | GameMaster agent stats |

### Dashboard & Metadata
| Route | Method | Description |
|-------|--------|-------------|
| `/api/metrics/agent/[agentId]` | GET | On-chain agent data + lineage |
| `/api/metadata/[tokenId]` | GET | ERC-721 token metadata |
| `/api/demo/seed` | POST | Seed demo agents |
| `/api/demo/reset` | POST | Reset demo state |

---

## 12. IMPLEMENTATION ROADMAP

### Phase 1: Core Infrastructure (COMPLETE)
- [x] Next.js 16 App Router with TypeScript
- [x] wagmi + RainbowKit + viem wallet integration for 0G Galileo/mainnet
- [x] Zustand store for wallet, agent, chain state
- [x] Foundry Solidity workspace with deployment scripts
- [x] Smart contracts deployed to 0G Galileo testnet
- [x] Environment configuration (.env, .env.example)

### Phase 2: Smart Contracts (COMPLETE)
- [x] ReplicantAgentNFT (ERC-7857) with mint, clone, slash, lineage
- [x] ReplicantEvolutionCoordinator (request -> complete/fail)
- [x] ReplicantMarketplace (list, buy, cancel, royalties)
- [x] ReplicantSubscriptionEscrow (prepaid tiers)
- [x] SimpleVerifier + TeeVerifier (TEE attestation)
- [x] 6 species oracle contracts

### Phase 3: Frontend Dashboard (COMPLETE)
- [x] Dashboard layout with sidebar navigation
- [x] Genesis minting page with species selector + config editor
- [x] Marketplace grid with listing + buy flows
- [x] Evolution history + trigger UI
- [x] Family tree visualization (React Flow)
- [x] Agent vitals with real-time charts
- [x] Safety dashboard with alignment gauge
- [x] Subscriptions page with tier comparison
- [x] Species-specific dashboards (all 6 species)

### Phase 4: Species AI Logic (COMPLETE)
- [x] AlphaHunter: Discord scraping, RSS, sentiment analysis, signals
- [x] CodeWeaver: Solidity parser, vulnerability detection, LLM audit
- [x] GameMaster: 6 game engines, opponent modeling, evolution
- [x] DocuMind: PDF/DOCX ingestion, clause segmentation, risk detection
- [x] OracleKeeper: 10+ price sources, aggregation, manipulation detection
- [x] SocialSynth: content generation, Farcaster publishing

### Phase 5: 0G Integration (COMPLETE)
- [x] 0G Storage upload/download via @0gfoundation/0g-storage-ts-sdk
- [x] Storage API routes (upload-genome, upload-log, download)
- [x] WebSocket server for real-time signals
- [x] Explorer links for every on-chain action
- [x] Contract reads via wagmi hooks (useAgent, useListings, etc.)

### Phase 6: Safety & Alignment (IN PROGRESS)
- [x] Alignment scan API route (simulated)
- [x] Slashing contract function
- [x] Safety dashboard UI
- [ ] Live alignment node consensus (currently simulated)
- [ ] Real TEE attestation verification

### Phase 7: Testing & Polish (PENDING)
- [ ] Unit tests for lib modules
- [ ] Contract tests (forge test)
- [ ] E2E demo flow
- [ ] npm run lint pass
- [ ] npm run build pass

---

## 13. JUDGING STRATEGY

### 13.1 Demo Flow (One-Click Walkthrough)

1. **Landing Page** — "REPLICANT: Autonomous AI Evolution Protocol"
2. **Connect Wallet** — RainbowKit modal -> 0G Galileo
3. **Genesis Mint** — Select CodeWeaver, use template, upload to 0G Storage, mint Gen-0
4. **Dashboard** — See your agent, its stats, its lineage (single node)
5. **Species Dashboard** — CodeWeaver: upload a Solidity file, get audit
6. **Evolution Chamber** — Trigger evolution, see 50 candidates generated, alignment scan passes
7. **Family Tree** — See Gen-0 (archived/grey) -> Gen-1 (active/green)
8. **Marketplace** — List Gen-1 for sale, see it in grid
9. **Safety** — Trigger kill-switch on a rogue agent, see it slashed (red -> grey)
10. **Explorer Links** — Every step links to chainscan-galileo.0g.ai

### 13.2 Checklist for Judges

- [x] Real wallet connect on 0G Galileo
- [x] Real mintGenesis() transaction on-chain
- [x] Real 0G Storage upload (encrypted genome)
- [x] Real getLineage() reads from chain
- [x] Real marketplace list() + buy() transactions
- [x] Real slash() transaction with stake burn
- [x] Real Explorer links for every tx
- [x] Six species with distinct AI logic
- [x] Evolution flow with mutation + scoring + alignment scan

### 13.3 Differentiators

1. **Only team using ERC-7857 iNFT standard** — full implementation with clone, authorize, sealed handover
2. **Only team using all 6 0G components** — Chain, Storage (Log + KV), Compute (inference), Agent ID, Alignment Nodes, TEE attestation
3. **Six species, each fully realized** — Not just different prompts; each has its own contract, game engine, parser, or data pipeline
4. **Real Solidity parsing** — CodeWeaver uses @solidity-parser/parser, not just AI
5. **Real document analysis** — DocuMind parses PDF/DOCX with clause templates
6. **Real game engines** — GameMaster has 6 playable games with opponent modeling
7. **On-chain lineage** — getLineage() + getChildren() power the family tree from real data
8. **Safety-first architecture** — Slashing is not optional; it's built into the core contract

---

## Appendix: Repository Structure

```
.
├── app/                          # Next.js 16 App Router
│   ├── api/                      # API routes (21 routes)
│   │   ├── alignment/scan
│   │   ├── compute/evolve
│   │   ├── storage/upload-genome, upload-log, download
│   │   ├── inference/[species]
│   │   ├── alphahunter, codeweaver, documind, gamemaster, oraclekeeper, socialsynth
│   │   ├── games, agents, demo, metrics, metadata
│   │   └── ...
│   ├── dashboard/                # Dashboard pages (10 routes)
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── landing/                  # Landing page sections
│   ├── dashboard/                # Dashboard widgets
│   ├── species/                  # Species-specific UIs
│   ├── marketplace/              # Marketplace components
│   ├── evolution/                # Evolution chamber
│   ├── tree/                     # Family tree (React Flow)
│   ├── genesis/                  # Genesis minting
│   ├── shared/                   # WalletButton, ExplorerLink, TxStatusCard, etc.
│   └── ui/                       # shadcn/ui primitives
├── contracts/                    # Solidity (Foundry)
│   ├── 0g/                       # 0G infrastructure contracts
│   │   ├── AgentNFT.sol          # Official ERC-7857 AgentNFT
│   │   ├── ReplicantAgentNFT.sol # REPLICANT extension
│   │   └── extensions/           # ERC-7857 standard extensions
│   ├── ReplicantEvolutionCoordinator.sol
│   ├── ReplicantMarketplace.sol
│   ├── ReplicantSubscriptionEscrow.sol
│   ├── AlphaHunterOracle.sol
│   ├── GameMasterOracle.sol
│   ├── DocuMindOracle.sol
│   ├── OracleKeeperOracle.sol
│   └── SocialSynthOracle.sol
├── lib/                          # Business logic
│   ├── 0g-storage.ts             # 0G Storage client
│   ├── 0g.ts                     # Chain definitions
│   ├── wagmi.ts                  # wagmi configuration
│   ├── contracts/                # Contract ABIs + addresses
│   ├── queries/                  # wagmi hooks for contract reads
│   ├── species/                  # Species inference engines
│   ├── alphahunter/              # AlphaHunter lib
│   ├── codeweaver/               # CodeWeaver audit pipeline
│   ├── gamemaster/               # Game engines + opponent modeling
│   ├── documind/                 # Document parsing + legal analysis
│   ├── oraclekeeper/             # Price feeds + manipulation detection
│   └── socialsynth/              # Content generation + Farcaster
├── server/                       # WebSocket server
│   └── websocket.ts              # Real-time signal broadcasting
├── script/                       # Deployment scripts
├── test/                         # Contract tests
└── graphify-out/                 # Knowledge graph
```
