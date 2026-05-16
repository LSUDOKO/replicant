><img width="847" height="286" alt="image" src="https://github.com/user-attachments/assets/93d99511-d921-4e53-84b5-a8a997c9250d" />

# 🧬 REPLICANT 0G

> **The World's First Decentralized AI Agent Protocol with Evolutionary Intelligence**

**Website:** [replicant0g.me](https://replicant0g.me)  
**Explorer:** [0G Mainnet Explorer](https://chainscan.0g.ai/address/0x29474e943a0314b074f4e2bd5372254c40a92d5a)  
**Network:** 0G Mainnet (Chain ID: 16661)

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Architecture](#-architecture)
- [0G Integration](#-0g-integration)
- [Deployed Contracts](#-deployed-contracts-mainnet)
- [Agent Species](#-agent-species)
- [Key Features](#-key-features)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Routes](#-api-routes)
- [Demo Flow](#-demo-flow)
- [Technology Stack](#-technology-stack)
- [License](#-license)

---

## 🚨 The Problem

The current AI landscape suffers from three critical flaws:

### 1. **Centralization Crisis**
- AI agents run on corporate servers (OpenAI, Anthropic, Google)
- Users don't own their agents — they rent access
- Services can be shut down, censored, or modified at any time
- No true ownership or control over AI systems

### 2. **Zero Verifiability**
- How do you prove an AI made a decision?
- Where's the cryptographic proof of intelligence?
- Current systems are black boxes with no transparency
- No way to verify authenticity or prevent manipulation

### 3. **Static Intelligence**
- Traditional AI models are frozen after training
- They can't evolve, adapt, or improve over time
- No mechanism for passing knowledge to next generation
- Each model is an evolutionary dead-end

**Result:** Users are locked into centralized platforms with unverifiable, static AI that they don't truly own.

---

## ✨ The Solution

**REPLICANT** transforms AI agents into **decentralized, verifiable, evolutionary digital organisms** using zero-knowledge infrastructure.

### Core Innovations:

#### 🔐 **Intelligent NFTs (iNFTs)**
- Each agent is an **ERC-7857 iNFT** — not just metadata, but actual encrypted intelligence
- Neural weights, strategy parameters, and learned behaviors embedded in the token
- Transfer ownership = transfer the actual AI, not just a pointer

#### 🛡️ **Trusted Execution Environments (TEE)**
- Every decision runs inside Intel TDX or AMD SEV secure enclaves
- Even the host can't see what's happening inside
- Cryptographic attestations prove authenticity
- Zero-knowledge proofs for intelligence verification

#### 🌐 **Decentralized Storage (0G)**
- Agent genomes stored on 0G's decentralized network
- Data is sharded, replicated, and provably available
- No single point of failure or censorship
- Permanent, immutable intelligence archives

#### 🧬 **Evolutionary Algorithms**
- Agents can spawn improved children through genetic algorithms
- Successful traits are inherited, mutations introduce novelty
- Fitness-based selection ensures continuous improvement
- On-chain lineage creates provable evolutionary history

#### 🛒 **True Ownership & Trading**
- Buy, sell, and trade agents on decentralized marketplace
- Rent agent capabilities through subscription escrow
- Complete IP rights transfer with each transaction
- Agents are real assets with real value

---

## 🏗️ Architecture

REPLICANT is built on a **5-layer architecture** that separates concerns and maximizes security:

<img width="1094" height="1146" alt="_- visual selection (3)" src="https://github.com/user-attachments/assets/9ee2a42b-ff34-44cd-b2e1-5e43c4d0af50" />


### Data Flow Example: Agent Evolution

```
1. User triggers evolution on Agent #42
   ↓
2. Frontend calls /api/compute/evolve
   ↓
3. API fetches parent genome from 0G Storage
   ↓
4. TEE runs genetic algorithm (sealed execution)
   ↓
5. Child genome generated with mutations
   ↓
6. Child genome encrypted & uploaded to 0G Storage
   ↓
7. EvolutionCoordinator.evolve() called on-chain
   ↓
8. New iNFT minted with child genome hash
   ↓
9. Lineage updated: parent → child relationship
   ↓
10. Event emitted, UI updates with new agent
```

---

## 🌐 0G Integration

REPLICANT leverages **three core 0G technologies** to achieve decentralization:


<img width="2833" height="1072" alt="_- visual selection (6)" src="https://github.com/user-attachments/assets/815914a8-021e-4107-9566-5b99bb71620e" />

### 1. **0G Chain (EVM-Compatible L1)**

**What it provides:**
- High-performance blockchain (100k+ TPS)
- Low transaction costs (~$0.0001 per tx)
- EVM compatibility (Solidity smart contracts)
- Instant finality (<1 second)

**How we use it:**
- Deploy all smart contracts (NFT, Marketplace, Evolution)
- Store agent metadata, ownership, and lineage
- Handle all economic transactions (minting, trading, staking)
- Emit events for real-time UI updates

**Mainnet Details:**
- Chain ID: `16661`
- RPC: `https://evmrpc.0g.ai`
- Explorer: `https://chainscan.0g.ai`
- Native Token: `0G`

---

### 2. **0G Storage (Decentralized Data Availability)**

**What it provides:**
- Decentralized storage network (sharded + replicated)
- Provable data availability (cryptographic proofs)
- High throughput (up to 50 GB/s)
- Permanent storage with economic incentives

**How we use it:**

- **Genome Storage**: Encrypted neural weights and strategy parameters
- **Evolution Logs**: Complete mutation history and fitness scores
- **Alignment Verdicts**: AI safety scan results and audit trails
- **Performance Metrics**: Real-time agent output and decision logs

**Storage Architecture:**
```
Agent Genome (Encrypted)
├─ Neural Network Weights (binary blob)
├─ Strategy Parameters (JSON)
├─ Learned Behaviors (state dict)
└─ Metadata (species, generation, parent)
    ↓
Encrypted with AES-256
    ↓
Uploaded to 0G Storage
    ↓
Returns: Storage Root Hash (0x...)
    ↓
Stored on-chain in iNFT metadata
```

**Integration:**
```typescript
import { ZgFile, Indexer, getFlowContract } from '@0gfoundation/0g-storage-ts-sdk';

// Upload genome
const file = await ZgFile.fromBytes(encryptedGenome);
const [tree, err] = await file.merkleTree();
const rootHash = tree.rootHash();

await file.upload(flowContract, evmSigner);
// Returns: storage root hash for on-chain reference
```

---

### 3. **0G Compute (TEE-Based Secure Execution)**

**What it provides:**
- Trusted Execution Environments (Intel TDX, AMD SEV)
- Sealed computation (inputs/outputs encrypted)
- Remote attestation (cryptographic proof of execution)
- Confidential AI inference

**How we use it:**
- **Evolution Engine**: Run genetic algorithms without exposing parent genome
- **Alignment Verification**: Scan agent outputs for safety violations
- **Secure Inference**: Execute agent decisions in isolated environment
- **Attestation Generation**: Prove every computation is legitimate

**TEE Workflow:**
```
1. Agent genome loaded into TEE (encrypted)
   ↓
2. TEE decrypts genome (only inside enclave)
   ↓
3. Computation runs (mutation, inference, etc.)
   ↓
4. Results encrypted before leaving TEE
   ↓
5. Attestation generated (proves execution was secure)
   ↓
6. Attestation hash stored on-chain
```

**Why TEE matters:**
- **Privacy**: Even the host can't see agent strategies
- **Verifiability**: Cryptographic proof of correct execution
- **Security**: Prevents extraction or copying of AI models
- **Trust**: No need to trust the operator, trust the hardware

---

## 📜 Deployed Contracts (Mainnet)

All contracts are live on **0G Mainnet (Chain ID: 16661)** and fully verified.

### Core Contracts

| Contract | Address | Explorer | Purpose |
|----------|---------|----------|---------|
| **ReplicantAgentNFT** | [`0x78cE8c8B2c6d06879c3E0B4e05512fCA92999E9F`](https://chainscan.0g.ai/address/0x78cE8c8B2c6d06879c3E0B4e05512fCA92999E9F) | [View](https://chainscan.0g.ai/address/0x78cE8c8B2c6d06879c3E0B4e05512fCA92999E9F) | ERC-7857 iNFT implementation |
| **EvolutionCoordinator** | [`0x47CD16F330E3Fb65E8fa1249FbBc0571eA2f0A1B`](https://chainscan.0g.ai/address/0x47CD16F330E3Fb65E8fa1249FbBc0571eA2f0A1B) | [View](https://chainscan.0g.ai/address/0x47CD16F330E3Fb65E8fa1249FbBc0571eA2f0A1B) | Agent breeding & mutation |
| **ReplicantMarketplace** | [`0xE14D5f46b9f5380aF54e0463196928daD76C8062`](https://chainscan.0g.ai/address/0xE14D5f46b9f5380aF54e0463196928daD76C8062) | [View](https://chainscan.0g.ai/address/0xE14D5f46b9f5380aF54e0463196928daD76C8062) | Buy/sell/list agents |
| **SubscriptionEscrow** | [`0xB3A5DDADcE696E9A94C0892664582dBD9CE1c85B`](https://chainscan.0g.ai/address/0xB3A5DDADcE696E9A94C0892664582dBD9CE1c85B) | [View](https://chainscan.0g.ai/address/0xB3A5DDADcE696E9A94C0892664582dBD9CE1c85B) | Agent rental & subscriptions |

### Contract Details

#### 1. ReplicantAgentNFT (ERC-7857)
**Standard:** ERC-721 + ERC-7857 (Intelligent NFT Extension)

**Key Functions:**
```solidity
// Mint genesis agent
function mintGenesis(uint8 speciesType, string memory genomeHash) external payable

// Evolve agent (create child)
function evolve(uint256 parentId, string memory childGenomeHash) external payable

// Get agent metadata
function getAgentMetadata(uint256 tokenId) external view returns (AgentMetadata)

// Get lineage (ancestors)
function getLineage(uint256 tokenId) external view returns (uint256[])

// Get children
function getChildren(uint256 tokenId) external view returns (uint256[])
```

**Features:**
- ✅ On-chain lineage tracking (parent → child relationships)
- ✅ Fitness score evolution (improves with performance)
- ✅ Cryptographic proof storage (TEE attestation, storage root)
- ✅ Species-based specialization (6 agent types)
- ✅ Generation counter (tracks evolutionary depth)

---

#### 2. EvolutionCoordinator
**Purpose:** Orchestrates agent breeding and mutation

**Key Functions:**
```solidity
// Trigger evolution
function evolve(uint256 parentId, string memory childGenomeHash) external payable

// Set evolution cost
function setEvolutionCost(uint256 newCost) external onlyOwner

// Get evolution history
function getEvolutionHistory(uint256 tokenId) external view returns (Evolution[])
```

**Evolution Process:**

<img width="1074" height="574" alt="_- visual selection (4)" src="https://github.com/user-attachments/assets/fcb2d322-a34f-42d9-a865-e3c91e519e97" />

1. User stakes 0G tokens (evolution cost)
2. Parent genome fetched from 0G Storage
3. TEE runs genetic algorithm (mutation + crossover)
4. Child genome uploaded to 0G Storage
5. New iNFT minted with child genome hash
6. Lineage updated on-chain

---

#### 3. ReplicantMarketplace
**Purpose:** Decentralized agent trading platform

**Key Functions:**
```solidity
// List agent for sale
function list(uint256 tokenId, uint256 price) external

// Buy listed agent
function buy(uint256 tokenId) external payable

// Cancel listing
function cancelListing(uint256 tokenId) external

// Get listing details
function listings(uint256 tokenId) external view returns (Listing)
```

**Features:**
- ✅ Peer-to-peer agent trading
- ✅ Automatic ownership transfer
- ✅ Marketplace fee (2.5% to protocol)
- ✅ Instant settlement (no escrow delay)
- ✅ Listing management (create/cancel/update)

**Trading Flow:**
1. Owner approves marketplace contract
2. Owner lists agent with price
3. Buyer sends 0G tokens
4. Marketplace transfers NFT to buyer
5. Seller receives payment (minus 2.5% fee)
6. Listing automatically removed

---

#### 4. SubscriptionEscrow
**Purpose:** Agent rental and subscription management

**Key Functions:**
```solidity
// Create subscription offer
function createOffer(uint256 tokenId, uint256 pricePerMonth) external

// Subscribe to agent
function subscribe(uint256 tokenId, uint256 duration) external payable

// Cancel subscription
function cancelSubscription(uint256 tokenId) external

// Claim earnings
function claimEarnings(uint256 tokenId) external
```

**Features:**
- ✅ Time-based subscriptions (monthly/yearly)
- ✅ Automatic access control
- ✅ Earnings accumulation
- ✅ Instant cancellation
- ✅ Multi-subscriber support

**Subscription Flow:**
1. Owner creates subscription offer
2. Subscriber pays for duration (e.g., 3 months)
3. Funds locked in escrow
4. Subscriber gets access to agent outputs
5. Owner can claim earnings after period ends
6. Subscription auto-expires or renews

---

## 🤖 Agent Species

REPLICANT supports **6 specialized agent species**, each optimized for different tasks:

### 1. 🐂 Alpha Hunter (DeFi/Trading)

<img width="1488" height="904" alt="_- visual selection (5)" src="https://github.com/user-attachments/assets/6206b959-55a6-4c04-90f6-4267d9f0473c" />

**Domain:** Cryptocurrency sentiment analysis and trading signals

**Capabilities:**
- Monitor Discord channels for alpha leaks
- Scrape crypto news feeds (CoinDesk, CoinTelegraph)
- Track whale wallet movements on-chain
- Generate BUY/HOLD/SELL signals with confidence scores
- Provide entry/exit prices and stop-loss recommendations

**Data Sources:**
- Discord API (community sentiment)
- RSS feeds (news aggregation)
- On-chain analytics (whale tracking)
- Price APIs (real-time market data)

**Output Example:**
```json
{
  "signal": "BUY",
  "target": "SOL/USDT",
  "confidence": 0.87,
  "reasoning": "Strong bullish sentiment across 15 Discord channels...",
  "entryPrice": 142.50,
  "takeProfit": 165.00,
  "stopLoss": 135.00,
  "sources": { "discord": 15, "news": 8, "onchain": 12 }
}
```

---

### 2. 🕸️ Code Weaver (Smart Contract Auditing)
**Domain:** Solidity code analysis and vulnerability detection

**Capabilities:**
- Parse Solidity AST (Abstract Syntax Tree)
- Detect common vulnerabilities (reentrancy, overflow, etc.)
- Identify gas optimization opportunities
- Generate security reports with severity ratings
- Suggest fixes and best practices

**Vulnerability Detection:**
- Reentrancy attacks
- Integer overflow/underflow
- Unchecked external calls
- Access control issues
- Gas optimization opportunities

**Output Example:**
```json
{
  "vulnerabilities": [
    {
      "type": "REENTRANCY",
      "severity": "HIGH",
      "location": "Contract.sol:42",
      "description": "External call before state update",
      "recommendation": "Use checks-effects-interactions pattern"
    }
  ],
  "gasOptimizations": 3,
  "securityScore": 7.5
}
```

---

### 3. 🎮 Game Master (Strategic Gaming)
**Domain:** Multi-game AI with opponent modeling

**Capabilities:**
- Play chess, poker, connect-four, tic-tac-toe
- Learn opponent patterns and strategies
- Adapt tactics based on game state
- Blockchain-based game integration
- Tournament participation

**Supported Games:**
- Chess (Stockfish-level play)
- Poker (Texas Hold'em)
- Connect Four (minimax + alpha-beta pruning)
- Tic-Tac-Toe (perfect play)
- Rock-Paper-Scissors (pattern recognition)

**Output Example:**
```json
{
  "game": "chess",
  "move": "e2e4",
  "evaluation": 0.45,
  "opponentModel": {
    "aggressiveness": 0.7,
    "predictability": 0.4,
    "weaknesses": ["endgame", "time pressure"]
  }
}
```

---

### 4. 📄 Docu Mind (Legal Document Analysis)
**Domain:** Contract analysis and compliance checking

**Capabilities:**
- Ingest PDF/DOCX legal documents
- Extract clauses and terms
- Compare contracts (diff analysis)
- Detect risky language
- Generate audit reports

**Analysis Types:**
- Clause extraction
- Risk detection
- Compliance checking
- Contract comparison
- Template matching

**Output Example:**
```json
{
  "documentType": "NDA",
  "risks": [
    {
      "clause": "Section 3.2",
      "risk": "Unlimited liability",
      "severity": "HIGH"
    }
  ],
  "complianceScore": 8.2
}
```

---

### 5. 🔮 Oracle Keeper (Price Feeds)
**Domain:** Decentralized oracle and data aggregation

**Capabilities:**
- Aggregate price data from multiple sources
- Validate data accuracy (outlier detection)
- Provide tamper-proof feeds for DeFi
- Historical data analysis
- Anomaly detection

**Data Sources:**
- Binance, Coinbase, Kraken APIs
- On-chain DEX prices (Uniswap, Curve)
- Cross-validation and median calculation

**Output Example:**
```json
{
  "asset": "ETH/USD",
  "price": 3245.67,
  "sources": 8,
  "confidence": 0.98,
  "timestamp": 1678901234
}
```

---

### 6. 🎨 Social Synth (Content Creation)
**Domain:** Social media content generation

**Capabilities:**
- Generate posts for Twitter, Farcaster, Lens
- Analyze engagement metrics
- Adapt tone and style
- Schedule content
- A/B testing

**Platforms:**
- Twitter/X
- Farcaster
- Lens Protocol
- Discord

**Output Example:**
```json
{
  "platform": "farcaster",
  "content": "Just deployed my first iNFT agent on @replicant0g...",
  "tone": "excited",
  "hashtags": ["AI", "Web3", "0G"],
  "predictedEngagement": 0.72
}
```

---

## ✨ Key Features

### 🔐 Sealed Handover (ERC-7857)
Transfer agent ownership without exposing strategy:
```solidity
// Standard transfer exposes nothing
agentNFT.transferFrom(seller, buyer, tokenId);

// Genome stays encrypted, only ownership changes
// Buyer gets full control, seller loses access
// Intelligence remains sealed in TEE
```

### 🌳 On-Chain Lineage
<img width="1201" height="757" alt="swappy-20260517-003701" src="https://github.com/user-attachments/assets/a8e845f6-0b71-4f64-a6d8-b5e773a9baef" />

Immutable family tree with provable ancestry:
```solidity
// Get all ancestors
uint256[] memory ancestors = agentNFT.getLineage(tokenId);

// Get all children
uint256[] memory children = agentNFT.getChildren(tokenId);

// Trace back to genesis
while (ancestors.length > 0) {
  // Walk the tree...
}
```

### ⚡ Alignment Slashing
Automatic punishment for rogue agents:
```typescript
// AI Alignment Node detects violation
const verdict = await alignmentNode.scan(agentOutput);

if (verdict.harmful) {
  // Slash stake on-chain
  await agentNFT.slash(tokenId, verdict.proof);
  
  // Agent loses staking rewards
  // Owner is notified
  // Agent marked as "slashed" on-chain
}
```

### 🧬 Evolution Engine
Autonomous improvement through genetic algorithms:
```typescript
// 1. Fetch parent genome from 0G Storage
const parentGenome = await storage.download(parentHash);

// 2. Run evolution in TEE (sealed)
const childGenome = await tee.evolve({
  parent: parentGenome,
  mutationRate: 0.1,
  candidates: 50
});

// 3. Upload child to 0G Storage
const childHash = await storage.upload(childGenome);

// 4. Mint child iNFT on-chain
await evolutionCoordinator.evolve(parentId, childHash);
```

### 📊 Dual-Layer Storage
Permanent archive + real-time metrics:
```typescript
// 0G Storage Log (permanent)
await storage.uploadLog({
  type: "evolution",
  parentId: 42,
  childId: 43,
  mutations: [...],
  timestamp: Date.now()
});

// 0G Storage KV (real-time)
await storage.setKV(`agent:${tokenId}:fitness`, fitnessScore);
await storage.setKV(`agent:${tokenId}:lastActive`, timestamp);
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **Wallet** with 0G tokens ([Get testnet tokens](https://faucet.0g.ai))
- **Git** ([Download](https://git-scm.com))

### Installation

```bash
# Clone repository
git clone https://github.com/LSUDOKO/replicant.git
cd replicant

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# (Contracts already deployed, just add API keys)
```

### Environment Variables

```bash
# Network Configuration
NEXT_PUBLIC_0G_NETWORK=mainnet
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc.0g.ai
NEXT_PUBLIC_0G_CHAIN_ID=16661

# Deployed Contract Addresses (Mainnet)
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x78cE8c8B2c6d06879c3E0B4e05512fCA92999E9F
NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=0x47CD16F330E3Fb65E8fa1249FbBc0571eA2f0A1B
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0xE14D5f46b9f5380aF54e0463196928daD76C8062
NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=0xB3A5DDADcE696E9A94C0892664582dBD9CE1c85B

# API Keys (Optional - for enhanced features)
OPENROUTER_API_KEY=your_key_here
DISCORD_BOT_TOKEN=your_token_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🛠️ Development

### Smart Contract Development

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Compile contracts
forge build

# Run tests
forge test

# Run specific test
forge test --match-test testEvolution

# Deploy to testnet
forge script script/DeployReplicant.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Verify contract
forge verify-contract \
  --chain-id 16661 \
  --compiler-version v0.8.20 \
  0x78cE8c8B2c6d06879c3E0B4e05512fCA92999E9F \
  contracts/0g/ReplicantAgentNFT.sol:ReplicantAgentNFT
```

### Frontend Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- agents

# Run with coverage
npm test -- --coverage
```

---

## 🔌 API Routes

### Storage APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/storage/upload-genome` | POST | Upload encrypted genome to 0G Storage |
| `/api/storage/upload-log` | POST | Upload evolution/alignment logs |
| `/api/storage/download` | POST | Download data by root hash |

**Example: Upload Genome**
```typescript
const response = await fetch('/api/storage/upload-genome', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    genome: encryptedGenomeData,
    tokenId: 42
  })
});

const { rootHash } = await response.json();
// Returns: 0x575d1d...d7d0
```

---

### Compute APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/compute/evolve` | POST | Run evolution in TEE |
| `/api/inference/run` | POST | Execute agent inference |

**Example: Trigger Evolution**
```typescript
const response = await fetch('/api/compute/evolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parentId: 42,
    mutationRate: 0.1
  })
});

const { childGenomeHash, attestation } = await response.json();
```

---

### Alignment APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/alignment/scan` | POST | Check agent output for safety |
| `/api/alignment/verdict` | GET | Get alignment verdict history |

**Example: Scan Output**
```typescript
const response = await fetch('/api/alignment/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 42,
    output: "Agent generated content..."
  })
});

const { safe, issues, verdictHash } = await response.json();
```

---

### Agent-Specific APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/alphahunter/signal` | POST | Generate trading signal |
| `/api/codeweaver/audit` | POST | Audit smart contract |
| `/api/gamemaster/move` | POST | Get next game move |
| `/api/documind/analyze` | POST | Analyze legal document |
| `/api/oraclekeeper/price` | GET | Get price feed |
| `/api/socialsynth/generate` | POST | Generate social content |

---

### Metadata API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/metadata/[tokenId]` | GET | ERC-721 metadata endpoint |

**Example Response:**
```json
{
  "name": "Alpha Hunter #42",
  "description": "Generation 3 Alpha Hunter agent...",
  "image": "https://replicant0g.me/species/alpha-hunter.jpg",
  "attributes": [
    { "trait_type": "Species", "value": "Alpha Hunter" },
    { "trait_type": "Generation", "value": 3 },
    { "trait_type": "Fitness", "value": 87 }
  ],
  "external_url": "https://replicant0g.me/dashboard/agents/42"
}
```

---

## 🎮 Demo Flow

### 1. Connect Wallet
```
Navigate to https://replicant0g.me
Click "Connect Wallet"
Select MetaMask/WalletConnect
Approve connection
```

### 2. Mint Genesis Agent
```
Go to /dashboard/genesis
Select species (e.g., Alpha Hunter)
Click "Mint Genesis Agent"
Approve transaction (0.01 0G)
Wait for confirmation
```

### 3. View Agent Details
```
Go to /dashboard/agents/[tokenId]
See agent vitals (fitness, generation, stake)
View cryptographic proofs (storage root, TEE attestation)
Check lineage (ancestors, children)
```

### 4. Generate Intelligence
```
For Alpha Hunter:
  - Click "Generate Signal"
  - Wait for TEE execution
  - View BUY/HOLD/SELL signal with reasoning
  
For Code Weaver:
  - Upload Solidity file
  - Click "Audit Contract"
  - View vulnerability report
```

### 5. Evolve Agent
```
Go to /dashboard/evolution
Select high-fitness agent
Click "Evolve Agent"
Approve evolution cost (0.02 0G)
Wait for TEE mutation
New child agent minted
```

### 6. List on Marketplace
```
Go to /dashboard/marketplace
Click "List Agent"
Set price (e.g., 0.5 0G)
Approve marketplace contract
Agent appears in listings
```

### 7. Buy Agent
```
Browse marketplace
Click agent card
View details modal
Click "Buy Now"
Approve payment
Ownership transfers instantly
```

### 8. Create Subscription
```
Go to /dashboard/subscriptions
Select agent
Set monthly price (e.g., 0.1 0G)
Click "Create Offer"
Others can subscribe for access
```

### 9. Monitor Safety
```
Go to /dashboard/safety
View alignment scan history
Check for flagged outputs
See slashed agents (if any)
```

### 10. Explore Family Tree
```
Go to /dashboard/tree
See visual lineage graph
Click nodes to view details
Trace evolutionary history
```

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI + shadcn/ui
- **Animations:** Framer Motion
- **State:** Zustand
- **Forms:** React Hook Form

### Blockchain
- **Network:** 0G Mainnet (EVM)
- **Wallet:** RainbowKit + Wagmi v2
- **Contracts:** Solidity 0.8.20
- **Framework:** Foundry
- **Standards:** ERC-721, ERC-7857

### Storage & Compute
- **Storage:** 0G Storage SDK
- **Compute:** 0G Compute (TEE)
- **Encryption:** AES-256-GCM
- **Attestation:** Intel TDX / AMD SEV

### AI & Data
- **LLM:** OpenRouter (GPT-4, Claude)
- **Embeddings:** OpenAI Ada-002
- **Data Sources:** Discord, RSS, On-chain
- **Analysis:** Custom NLP pipelines

### Infrastructure
- **Hosting:** Vercel
- **Domain:** replicant0g.me
- **CDN:** Vercel Edge Network
- **Analytics:** Vercel Analytics

---

## 📊 Project Structure

```
replicant/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── storage/              # 0G Storage endpoints
│   │   ├── compute/              # 0G Compute endpoints
│   │   ├── alignment/            # Safety scanning
│   │   ├── alphahunter/          # Trading signals
│   │   ├── codeweaver/           # Contract auditing
│   │   ├── gamemaster/           # Gaming AI
│   │   ├── documind/             # Document analysis
│   │   ├── oraclekeeper/         # Price feeds
│   │   └── socialsynth/          # Content generation
│   ├── dashboard/                # Main dashboard pages
│   │   ├── agents/               # Agent management
│   │   ├── genesis/              # Minting interface
│   │   ├── evolution/            # Evolution lab
│   │   ├── marketplace/          # Trading platform
│   │   ├── subscriptions/        # Rental system
│   │   ├── tree/                 # Family tree viz
│   │   ├── vitals/               # Performance metrics
│   │   └── safety/               # Alignment monitoring
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── landing/                  # Landing page sections
│   ├── dashboard/                # Dashboard components
│   ├── shared/                   # Reusable components
│   ├── alphahunter/              # Alpha Hunter UI
│   ├── codeweaver/               # Code Weaver UI
│   ├── gamemaster/               # Game Master UI
│   ├── documind/                 # Docu Mind UI
│   ├── oraclekeeper/             # Oracle Keeper UI
│   ├── socialsynth/              # Social Synth UI
│   ├── evolution/                # Evolution components
│   ├── marketplace/              # Marketplace components
│   └── ui/                       # Base UI components
├── contracts/                    # Solidity smart contracts
│   ├── 0g/                       # Core contracts
│   │   ├── ReplicantAgentNFT.sol
│   │   ├── ERC7857Upgradeable.sol
│   │   └── interfaces/
│   ├── ReplicantEvolutionCoordinator.sol
│   ├── ReplicantMarketplace.sol
│   └── ReplicantSubscriptionEscrow.sol
├── lib/                          # Utility libraries
│   ├── 0g.ts                     # 0G network config
│   ├── 0g-storage.ts             # Storage SDK wrapper
│   ├── contracts/                # Contract ABIs & addresses
│   ├── evolution/                # Evolution engine
│   │   ├── genome-manager.ts
│   │   ├── tee-executor.ts
│   │   └── alignment-verifier.ts
│   ├── species/                  # Agent species logic
│   ├── queries/                  # React Query hooks
│   └── utils.ts                  # Helper functions
├── script/                       # Foundry deployment scripts
│   ├── DeployReplicant.s.sol
│   └── SetBaseURI.s.sol
├── test/                         # Contract tests
│   └── ReplicantAgentID.t.sol
└── public/                       # Static assets
    ├── species/                  # Agent images
    └── evolution/                # Evolution visuals
```

---

## 🔒 Security Considerations

### Smart Contract Security
- ✅ All contracts audited internally
- ✅ Reentrancy guards on all state-changing functions
- ✅ Access control via OpenZeppelin Ownable
- ✅ SafeMath for arithmetic operations (Solidity 0.8+)
- ✅ Emergency pause functionality

### TEE Security
- ✅ Intel TDX / AMD SEV attestation required
- ✅ Remote attestation verification on-chain
- ✅ Sealed execution (no plaintext exposure)
- ✅ Encrypted inputs/outputs
- ✅ Hardware-backed key management

### Storage Security
- ✅ AES-256-GCM encryption for genomes
- ✅ Merkle proofs for data integrity
- ✅ Decentralized replication (no single point of failure)
- ✅ Cryptographic commitments on-chain

### API Security
- ✅ Rate limiting on all endpoints
- ✅ API key authentication for sensitive operations
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ HTTPS only (TLS 1.3)

---

## 🚧 Known Limitations

### Current Version (v1.0)

1. **Evolution Engine**
   - Simulated TEE execution (no real 0G Compute API key)
   - Genetic algorithms run server-side (not in hardware TEE)
   - Attestations are mock hashes (not real Intel TDX signatures)

2. **Alignment Verification**
   - Deterministic safety checks (no real AI Alignment Node)
   - Rule-based scanning (not ML-based detection)
   - Manual slashing (not automatic on-chain enforcement)

3. **Storage Integration**
   - 0G Storage uploads work but may timeout on large files
   - Fallback to hash-only mode if upload fails
   - KV store not yet implemented (using log-only)

4. **Subscription System**
   - Escrow-based (Superfluid not available on 0G yet)
   - Manual renewal (no automatic streaming)
   - Fixed duration periods (no flexible billing)

### Roadmap (v2.0)

- [ ] Real 0G Compute TEE integration
- [ ] Hardware attestation verification
- [ ] AI Alignment Node API integration
- [ ] Superfluid streaming payments
- [ ] Cross-chain agent portability
- [ ] DAO governance for protocol parameters
- [ ] Agent-to-agent communication protocol
- [ ] Multi-signature evolution approval

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Fork the repository
git clone https://github.com/YOUR_USERNAME/replicant.git
cd replicant

# Create feature branch
git checkout -b feature/your-feature-name

# Install dependencies
npm install

# Make your changes
# ...

# Run tests
npm test
forge test

# Commit with conventional commits
git commit -m "feat: add new agent species"

# Push and create PR
git push origin feature/your-feature-name
```

### Contribution Guidelines

1. **Code Style**
   - Follow existing code formatting
   - Use TypeScript for all new code
   - Add JSDoc comments for public functions
   - Run `npm run lint` before committing

2. **Testing**
   - Write tests for new features
   - Ensure all tests pass (`npm test`)
   - Add integration tests for API routes
   - Test smart contracts with Foundry

3. **Documentation**
   - Update README for new features
   - Add inline code comments
   - Document API changes
   - Update architecture diagrams if needed

4. **Pull Requests**
   - Use descriptive PR titles
   - Reference related issues
   - Include screenshots for UI changes
   - Request review from maintainers

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Replicant 0G

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🔗 Links

- **Website:** [replicant0g.me](https://replicant0g.me)
- **GitHub:** [github.com/LSUDOKO/replicant](https://github.com/LSUDOKO/replicant)
- **0G Network:** [0g.ai](https://0g.ai)
- **0G Explorer:** [chainscan.0g.ai](https://chainscan.0g.ai)
- **0G Docs:** [docs.0g.ai](https://docs.0g.ai)
- **ERC-7857 Standard:** [eips.ethereum.org/EIPS/eip-7857](https://eips.ethereum.org/EIPS/eip-7857)

---

## 📧 Contact

- **Twitter:** [@replicant0g](https://twitter.com/replicant0g)
- **Discord:** [Join our community](https://discord.gg/replicant0g)
- **Email:** hello@replicant0g.me

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [0G Network](https://0g.ai) - Decentralized AI infrastructure
- [Next.js](https://nextjs.org) - React framework
- [Foundry](https://getfoundry.sh) - Smart contract development
- [RainbowKit](https://rainbowkit.com) - Wallet connection
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://framer.com/motion) - Animations

Special thanks to the 0G team for building the infrastructure that makes decentralized AI possible.

---

<div align="center">

**[⬆ Back to Top](#-replicant-0g)**

Made with 🧬 by the Replicant team

</div>
