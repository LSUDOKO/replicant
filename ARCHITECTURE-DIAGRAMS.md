# 🏗️ REPLICANT Architecture - Mermaid Diagrams

## 1. Complete System Architecture (5 Layers)

```mermaid
graph TB
    subgraph "Layer 5: User Interface"
        UI[React Dashboard]
        Landing[Landing Page]
        Genesis[Genesis Minting]
        Evolution[Evolution Chamber]
        Marketplace[Marketplace]
        Tree[Family Tree]
        Terminal[Trading Terminal]
    end

    subgraph "Layer 4: Economics & Identity"
        AgentNFT[ReplicantAgentNFT<br/>ERC-7857 iNFT]
        EvolutionCoord[Evolution Coordinator]
        MarketContract[Marketplace Contract]
        Escrow[Subscription Escrow]
        Superfluid[Superfluid Streams]
    end

    subgraph "Layer 3: Memory & Data - 0G STORAGE"
        StorageLog[0G Storage Log<br/>Immutable Archive]
        StorageKV[0G Storage KV<br/>Real-Time Metrics]
        Genomes[Encrypted Genomes]
        EvolutionLogs[Evolution Logs]
        Attestations[TEE Attestations]
        Verdicts[Alignment Verdicts]
    end

    subgraph "Layer 2: Evolution Engine - 0G COMPUTE TEE"
        TEE[0G Compute TEE]
        Decrypt[Genome Decryption]
        Mutation[Mutation Algorithm]
        Simulation[Fitness Simulation]
        Reencrypt[Re-encryption]
    end

    subgraph "Layer 1: Safety & Alignment"
        AlignmentNode[AI Alignment Node]
        BiasCheck[Bias Detection]
        GoalCheck[Goal Divergence]
        HarmCheck[Harmfulness Check]
        HonestyCheck[Honesty Validation]
        Slashing[Slashing Mechanism]
    end

    UI --> AgentNFT
    UI --> EvolutionCoord
    UI --> MarketContract
    UI --> Escrow
    
    AgentNFT --> StorageLog
    EvolutionCoord --> TEE
    EvolutionCoord --> AlignmentNode
    
    TEE --> Decrypt
    TEE --> Mutation
    TEE --> Simulation
    TEE --> Reencrypt
    
    TEE --> StorageLog
    TEE --> Attestations
    
    AlignmentNode --> BiasCheck
    AlignmentNode --> GoalCheck
    AlignmentNode --> HarmCheck
    AlignmentNode --> HonestyCheck
    AlignmentNode --> Verdicts
    AlignmentNode --> Slashing
    
    MarketContract --> AgentNFT
    Escrow --> Superfluid
    
    StorageLog --> Genomes
    StorageLog --> EvolutionLogs
    StorageKV --> Terminal

    style StorageLog fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageKV fill:#8b5cf6,stroke:#fff,color:#fff
    style TEE fill:#8b5cf6,stroke:#fff,color:#fff
    style AlignmentNode fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 2. 0G Integration Deep Dive

```mermaid
graph TB
    subgraph "REPLICANT Application"
        Frontend[Next.js Frontend]
        API[API Routes]
        Contracts[Smart Contracts]
    end

    subgraph "0G Chain - Galileo Testnet"
        Blockchain[0G Blockchain<br/>1M+ TPS, <1s Finality]
        AgentNFT[ReplicantAgentNFT<br/>0x026a3279...]
        Evolution[EvolutionCoordinator<br/>0x61792dC3...]
        Market[Marketplace<br/>0x15dB35f1...]
    end

    subgraph "0G Storage - Decentralized Storage"
        StorageNode1[Storage Node 1]
        StorageNode2[Storage Node 2]
        StorageNode3[Storage Node 3]
        
        subgraph "Storage Log - Immutable"
            GenomeData[Encrypted Genomes<br/>AES-256]
            EvolutionData[Evolution History]
            AttestationData[TEE Attestations]
            VerdictData[Alignment Verdicts]
        end
        
        subgraph "Storage KV - Real-Time"
            Metrics[Agent Metrics]
            Signals[Trading Signals]
            Performance[Performance Data]
            Memory[Working Memory]
        end
    end

    subgraph "0G Compute - TEE Network"
        TEENode1[TEE Node 1<br/>Intel SGX]
        TEENode2[TEE Node 2<br/>AMD SEV]
        TEENode3[TEE Node 3<br/>ARM TrustZone]
        
        subgraph "Sealed Execution"
            DecryptGenome[Decrypt Parent Genome]
            GenerateMutations[Generate 50 Candidates]
            RunSimulations[Run 1000 Simulations]
            SelectBest[Select Best Candidate]
            EncryptChild[Encrypt Child Genome]
            ProduceAttestation[Produce Attestation]
        end
    end

    Frontend --> API
    API --> Contracts
    Contracts --> Blockchain
    
    Blockchain --> AgentNFT
    Blockchain --> Evolution
    Blockchain --> Market
    
    API --> StorageNode1
    API --> StorageNode2
    API --> StorageNode3
    
    StorageNode1 --> GenomeData
    StorageNode1 --> EvolutionData
    StorageNode2 --> AttestationData
    StorageNode2 --> VerdictData
    StorageNode3 --> Metrics
    StorageNode3 --> Signals
    
    Evolution --> TEENode1
    Evolution --> TEENode2
    Evolution --> TEENode3
    
    TEENode1 --> DecryptGenome
    DecryptGenome --> GenerateMutations
    GenerateMutations --> RunSimulations
    RunSimulations --> SelectBest
    SelectBest --> EncryptChild
    EncryptChild --> ProduceAttestation
    
    ProduceAttestation --> AttestationData
    EncryptChild --> GenomeData
    
    style Blockchain fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageNode1 fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageNode2 fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageNode3 fill:#8b5cf6,stroke:#fff,color:#fff
    style TEENode1 fill:#8b5cf6,stroke:#fff,color:#fff
    style TEENode2 fill:#8b5cf6,stroke:#fff,color:#fff
    style TEENode3 fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 3. Evolution Flow with 0G Integration

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant EvolutionCoord as Evolution Coordinator<br/>(0G Chain)
    participant AgentNFT as Agent NFT<br/>(0G Chain)
    participant API as API Routes
    participant TEE as 0G Compute TEE
    participant Storage as 0G Storage
    participant Alignment as AI Alignment Node

    User->>Frontend: Click "Trigger Evolution"
    Frontend->>EvolutionCoord: requestEvolution(agentId)
    EvolutionCoord->>AgentNFT: Verify ownership
    AgentNFT-->>EvolutionCoord: Owner confirmed
    EvolutionCoord->>EvolutionCoord: Create requestId
    EvolutionCoord-->>Frontend: EvolutionRequested event
    
    Frontend->>API: POST /api/compute/evolve
    API->>Storage: Download parent genome
    Storage-->>API: Encrypted genome data
    
    API->>TEE: Submit evolution job
    Note over TEE: Sealed Execution Environment
    TEE->>TEE: Decrypt parent genome
    TEE->>TEE: Generate 50 mutation candidates
    TEE->>TEE: Run 1000 simulations
    TEE->>TEE: Select best candidate (highest fitness)
    TEE->>TEE: Encrypt child genome
    TEE->>TEE: Generate TEE attestation
    TEE->>Storage: Upload child genome
    Storage-->>TEE: Storage root hash
    TEE-->>API: childGenomeHash, storageRootHash, teeAttestationHash
    
    API-->>Frontend: Evolution data
    Frontend->>API: POST /api/alignment/scan
    API->>Alignment: Submit child genome for verification
    
    Note over Alignment: Safety Checks
    Alignment->>Alignment: Bias detection
    Alignment->>Alignment: Goal divergence check
    Alignment->>Alignment: Harmfulness check
    Alignment->>Alignment: Honesty validation
    Alignment->>Alignment: Generate verdict hash
    Alignment-->>API: alignmentVerdictHash, passed=true
    
    API-->>Frontend: Alignment passed
    Frontend->>EvolutionCoord: completeEvolution(requestId, hashes, fitness)
    EvolutionCoord->>AgentNFT: cloneWithProof(parentId, childData)
    AgentNFT->>AgentNFT: Mint child NFT
    AgentNFT->>AgentNFT: Update lineage
    AgentNFT->>Storage: Upload evolution log
    AgentNFT-->>EvolutionCoord: childId
    EvolutionCoord-->>Frontend: EvolutionCompleted event
    
    Frontend-->>User: Success! Child Agent ID: 42
```

---

## 4. Alpha Hunter Data Flow with External APIs

```mermaid
graph TB
    subgraph "Cron Trigger"
        Vercel[Vercel Cron<br/>Every Hour]
        CronAPI[/api/cron/alphahunter]
    end

    subgraph "Data Sources - External APIs"
        Binance[Binance API<br/>Real-time Prices]
        RSS[RSS Feeds<br/>CoinDesk, CoinTelegraph]
        Discord[Discord Bot<br/>Community Sentiment]
        Farcaster[Farcaster/Neynar<br/>Warpcast Casts]
        Lens[Lens Protocol<br/>Hey.xyz Posts]
        Etherscan[Etherscan API<br/>Whale Tracking]
        CoinGecko[CoinGecko API<br/>Market Data]
        FearGreed[Fear & Greed Index<br/>alternative.me]
    end

    subgraph "Signal Generation"
        SignalAPI[/api/alphahunter/signal]
        
        subgraph "Data Processing"
            PriceService[Price Service]
            NewsService[News Service]
            DiscordService[Discord Service]
            FarcasterService[Farcaster Service]
            LensService[Lens Service]
            WhaleService[Whale Tracker]
            MarketService[Market Data Service]
        end
        
        subgraph "Analysis Engine"
            SentimentCalc[Sentiment Calculation<br/>40% Weight]
            WhaleCalc[Whale Activity<br/>30% Weight]
            MarketCalc[Market Structure<br/>30% Weight]
            FinalScore[Final Score Calculation]
        end
        
        subgraph "LLM Analysis - Optional"
            OpenRouter[OpenRouter API]
            Claude[Claude 3.5 Sonnet]
            Fallback[Rule-Based Fallback]
        end
        
        subgraph "Signal Output"
            SignalType[BUY/HOLD/SELL]
            Confidence[Confidence Score]
            Reasoning[Detailed Reasoning]
            Prices[Entry/TP/SL Prices]
        end
    end

    subgraph "0G Integration"
        TEECommit[TEE Attestation Hash]
        StorageCommit[0G Storage Root Hash]
        StorageUpload[Upload to 0G Storage]
    end

    subgraph "Delivery"
        DiscordBroadcast[Discord Rich Embed]
        Dashboard[Dashboard Update]
        Database[In-Memory Store<br/>TODO: PostgreSQL]
    end

    Vercel --> CronAPI
    CronAPI --> SignalAPI
    
    SignalAPI --> PriceService
    SignalAPI --> NewsService
    SignalAPI --> DiscordService
    SignalAPI --> FarcasterService
    SignalAPI --> LensService
    SignalAPI --> WhaleService
    SignalAPI --> MarketService
    
    PriceService --> Binance
    NewsService --> RSS
    DiscordService --> Discord
    FarcasterService --> Farcaster
    LensService --> Lens
    WhaleService --> Etherscan
    MarketService --> CoinGecko
    MarketService --> FearGreed
    
    PriceService --> SentimentCalc
    NewsService --> SentimentCalc
    DiscordService --> SentimentCalc
    FarcasterService --> SentimentCalc
    LensService --> SentimentCalc
    
    WhaleService --> WhaleCalc
    MarketService --> MarketCalc
    
    SentimentCalc --> FinalScore
    WhaleCalc --> FinalScore
    MarketCalc --> FinalScore
    
    FinalScore --> OpenRouter
    OpenRouter --> Claude
    Claude --> SignalType
    FinalScore --> Fallback
    Fallback --> SignalType
    
    SignalType --> Confidence
    Confidence --> Reasoning
    Reasoning --> Prices
    
    Prices --> TEECommit
    TEECommit --> StorageCommit
    StorageCommit --> StorageUpload
    
    StorageUpload --> DiscordBroadcast
    StorageUpload --> Dashboard
    StorageUpload --> Database

    style Binance fill:#f59e0b,stroke:#fff,color:#000
    style RSS fill:#f59e0b,stroke:#fff,color:#000
    style Discord fill:#f59e0b,stroke:#fff,color:#000
    style Farcaster fill:#f59e0b,stroke:#fff,color:#000
    style Lens fill:#f59e0b,stroke:#fff,color:#000
    style Etherscan fill:#f59e0b,stroke:#fff,color:#000
    style CoinGecko fill:#f59e0b,stroke:#fff,color:#000
    style FearGreed fill:#f59e0b,stroke:#fff,color:#000
    style StorageUpload fill:#8b5cf6,stroke:#fff,color:#fff
    style TEECommit fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageCommit fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 5. Marketplace Flow with Sealed Handover

```mermaid
sequenceDiagram
    participant Seller
    participant Frontend
    participant Marketplace as Marketplace Contract<br/>(0G Chain)
    participant AgentNFT as Agent NFT<br/>(0G Chain)
    participant Buyer
    participant TEE as 0G Compute TEE
    participant Storage as 0G Storage

    Note over Seller: LISTING PROCESS
    Seller->>Frontend: Enter tokenId & price
    Frontend->>AgentNFT: approve(marketplace, tokenId)
    AgentNFT-->>Frontend: Approval confirmed
    Frontend->>Marketplace: list(tokenId, price)
    Marketplace->>AgentNFT: Verify approval
    Marketplace->>Marketplace: Create listing
    Marketplace-->>Frontend: AgentListed event
    
    Note over Buyer: PURCHASE PROCESS
    Buyer->>Frontend: Click "Buy Now"
    Frontend->>Marketplace: buy(tokenId) + 0G tokens
    Marketplace->>Marketplace: Verify listing active
    Marketplace->>Marketplace: Calculate fees
    Note over Marketplace: Platform: 10%<br/>Royalty: 5%<br/>Seller: 85%
    
    Marketplace->>AgentNFT: iTransferFrom(seller, buyer, tokenId)
    Note over AgentNFT: Sealed Transfer Initiated
    
    AgentNFT->>Storage: Download encrypted genome
    Storage-->>AgentNFT: Encrypted genome data
    
    AgentNFT->>TEE: Re-encryption request
    Note over TEE: Sealed Re-encryption
    TEE->>TEE: Decrypt genome with seller's key
    TEE->>TEE: Re-encrypt with buyer's key
    TEE->>TEE: Generate new attestation
    TEE->>Storage: Upload re-encrypted genome
    Storage-->>TEE: New storage root hash
    TEE-->>AgentNFT: newGenomeHash, attestationHash
    
    AgentNFT->>AgentNFT: Update genome hash
    AgentNFT->>AgentNFT: Transfer ownership
    AgentNFT-->>Marketplace: Transfer complete
    
    Marketplace->>Marketplace: Distribute payments
    Marketplace->>Seller: Send 85% of price
    Marketplace->>Marketplace: Send 10% to treasury
    Marketplace->>Marketplace: Send 5% to creator
    
    Marketplace-->>Frontend: AgentSold event
    Frontend-->>Buyer: Success! Agent is yours
    
    Note over Buyer: Genome is now encrypted<br/>for buyer's wallet<br/>Seller cannot access it
```

---

## 6. Smart Contract Architecture

```mermaid
classDiagram
    class ReplicantAgentNFT {
        +uint256 nextTokenId
        +mapping genomeHashes
        +mapping parentIds
        +mapping childIds
        +mapping fitnessScores
        +mapping alignmentScores
        +mint(address, string, uint8) uint256
        +cloneWithProof(uint256, bytes32, bytes32, bytes32, bytes32, uint256) uint256
        +iTransferFrom(address, address, uint256, bytes32)
        +getLineage(uint256) uint256[]
        +getChildren(uint256) uint256[]
        +slash(uint256, bytes32)
    }

    class EvolutionCoordinator {
        +uint256 nextRequestId
        +mapping requests
        +address teeExecutor
        +address alignmentNode
        +requestEvolution(uint256) uint256
        +completeEvolution(uint256, bytes32, bytes32, bytes32, bytes32, uint256) uint256
        +failEvolution(uint256, string)
        +setTeeExecutor(address)
        +setAlignmentNode(address)
    }

    class Marketplace {
        +mapping listings
        +uint256 platformFee
        +uint256 royaltyFee
        +address treasury
        +list(uint256, uint256)
        +buy(uint256)
        +unlist(uint256)
        +pause(uint256)
        +unpause(uint256)
    }

    class SubscriptionEscrow {
        +mapping subscriptions
        +mapping balances
        +subscribe(uint256, uint256, uint256)
        +release(uint256)
        +refund(uint256)
        +withdraw(uint256)
    }

    class ERC7857Upgradeable {
        <<interface>>
        +genomeHash(uint256) bytes32
        +parentId(uint256) uint256
        +fitnessScore(uint256) uint256
        +alignmentScore(uint256) uint256
    }

    class ERC721 {
        <<OpenZeppelin>>
        +balanceOf(address) uint256
        +ownerOf(uint256) address
        +transferFrom(address, address, uint256)
        +approve(address, uint256)
    }

    ReplicantAgentNFT --|> ERC7857Upgradeable
    ReplicantAgentNFT --|> ERC721
    EvolutionCoordinator --> ReplicantAgentNFT
    Marketplace --> ReplicantAgentNFT
    SubscriptionEscrow --> ReplicantAgentNFT
```

---

## 7. Frontend Architecture

```mermaid
graph TB
    subgraph "Next.js 15 App Router"
        App[app/layout.tsx]
        Providers[app/providers.tsx]
        
        subgraph "Pages"
            Landing[app/page.tsx]
            Dashboard[app/dashboard/page.tsx]
            Genesis[app/dashboard/genesis/page.tsx]
            Evolution[app/dashboard/evolution/page.tsx]
            Marketplace[app/dashboard/marketplace/page.tsx]
            Tree[app/dashboard/tree/page.tsx]
            AgentDetail[app/dashboard/agents/[id]/page.tsx]
        end
        
        subgraph "API Routes"
            StorageAPI[app/api/storage/*]
            ComputeAPI[app/api/compute/*]
            AlignmentAPI[app/api/alignment/*]
            AlphaHunterAPI[app/api/alphahunter/*]
            CronAPI[app/api/cron/*]
            MetadataAPI[app/api/metadata/*]
        end
    end

    subgraph "Components"
        subgraph "Landing"
            Hero[Hero.tsx]
            Features[HowItWorks.tsx]
            SpeciesGrid[SpeciesGrid.tsx]
        end
        
        subgraph "Dashboard"
            Sidebar[DashboardSidebar.tsx]
            Stats[StatsCards.tsx]
            Activity[ActivityFeed.tsx]
        end
        
        subgraph "Genesis"
            MintForm[GenesisMintForm.tsx]
        end
        
        subgraph "Evolution"
            EvolutionCard[EvolutionCard.tsx]
            MutationLog[MutationLog.tsx]
            EvolutionHistory[EvolutionHistory.tsx]
        end
        
        subgraph "Marketplace"
            MarketGrid[MarketplaceGrid.tsx]
            AgentCard[AgentCard.tsx]
            DetailModal[AgentDetailModal.tsx]
            ListingForm[ListingForm.tsx]
        end
        
        subgraph "Alpha Hunter"
            Terminal[AlphaHunterTerminal.tsx]
            Feed[AlphaHunterFeed.tsx]
        end
        
        subgraph "Shared"
            WalletButton[WalletButton.tsx]
            NetworkGuard[NetworkGuard.tsx]
            INFTBadge[INFTBadge.tsx]
            ExplorerLink[ExplorerLink.tsx]
        end
    end

    subgraph "State Management"
        Zustand[Zustand Store]
        WalletState[Wallet State]
        AgentState[Active Agent State]
        ChainState[Chain Status State]
    end

    subgraph "Web3 Integration"
        Wagmi[wagmi v2]
        Viem[viem]
        WalletConnect[WalletConnect]
        Contracts[Contract ABIs]
    end

    subgraph "External Services"
        Binance[Binance API]
        Discord[Discord Bot]
        Farcaster[Farcaster API]
        Lens[Lens Protocol]
        Etherscan[Etherscan API]
    end

    App --> Providers
    Providers --> Landing
    Providers --> Dashboard
    
    Dashboard --> Genesis
    Dashboard --> Evolution
    Dashboard --> Marketplace
    Dashboard --> Tree
    Dashboard --> AgentDetail
    
    Genesis --> MintForm
    Evolution --> EvolutionCard
    Evolution --> MutationLog
    Evolution --> EvolutionHistory
    Marketplace --> MarketGrid
    Marketplace --> AgentCard
    Marketplace --> DetailModal
    AgentDetail --> Terminal
    
    MintForm --> Wagmi
    EvolutionCard --> Wagmi
    MarketGrid --> Wagmi
    
    Wagmi --> Viem
    Wagmi --> WalletConnect
    Wagmi --> Contracts
    
    Providers --> Zustand
    Zustand --> WalletState
    Zustand --> AgentState
    Zustand --> ChainState
    
    AlphaHunterAPI --> Binance
    AlphaHunterAPI --> Discord
    AlphaHunterAPI --> Farcaster
    AlphaHunterAPI --> Lens
    AlphaHunterAPI --> Etherscan
    
    ComputeAPI --> TEE[0G Compute TEE]
    StorageAPI --> Storage[0G Storage]
    AlignmentAPI --> Alignment[AI Alignment Node]

    style TEE fill:#8b5cf6,stroke:#fff,color:#fff
    style Storage fill:#8b5cf6,stroke:#fff,color:#fff
    style Alignment fill:#8b5cf6,stroke:#fff,color:#fff
```

