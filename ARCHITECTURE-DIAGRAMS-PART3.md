# 🏗️ REPLICANT Architecture - Additional Diagrams (Part 3)

## 11. Six Agent Species Architecture

```mermaid
graph TB
    subgraph "Agent Species Ecosystem"
        subgraph "Alpha Hunter - Trading Agent"
            AH_Core[Core Engine]
            AH_Data[Data Aggregation<br/>7 Sources]
            AH_Analysis[Sentiment Analysis<br/>Weighted Scoring]
            AH_Signal[Signal Generation<br/>BUY/HOLD/SELL]
            AH_Broadcast[Discord Broadcast]
            
            AH_Core --> AH_Data
            AH_Data --> AH_Analysis
            AH_Analysis --> AH_Signal
            AH_Signal --> AH_Broadcast
        end
        
        subgraph "Code Weaver - Security Auditor"
            CW_Parser[Solidity Parser<br/>AST Analysis]
            CW_Detector[Vulnerability Detection<br/>Pattern Matching]
            CW_LLM[LLM Analysis<br/>Deep Inspection]
            CW_Report[Audit Report<br/>Generation]
            
            CW_Parser --> CW_Detector
            CW_Detector --> CW_LLM
            CW_LLM --> CW_Report
        end
        
        subgraph "Docu Mind - Legal Analyzer"
            DM_Ingest[Document Ingestion<br/>PDF/Text]
            DM_Segment[Clause Segmentation]
            DM_Classify[Classification<br/>Payment/Liability/etc]
            DM_Risk[Risk Detection<br/>Ambiguity/Unfairness]
            DM_Attest[Attestation<br/>Generation]
            
            DM_Ingest --> DM_Segment
            DM_Segment --> DM_Classify
            DM_Classify --> DM_Risk
            DM_Risk --> DM_Attest
        end
        
        subgraph "Game Master - Strategic AI"
            GM_Chess[Chess Engine<br/>Minimax + Alpha-Beta]
            GM_Poker[Poker Engine<br/>Hand Evaluation]
            GM_CF[Connect Four<br/>Pattern Recognition]
            GM_Opponent[Opponent Modeling<br/>Pattern Learning]
            GM_Evolution[Strategy Evolution<br/>Self-Improvement]
            
            GM_Chess --> GM_Opponent
            GM_Poker --> GM_Opponent
            GM_CF --> GM_Opponent
            GM_Opponent --> GM_Evolution
        end
        
        subgraph "Oracle Keeper - Price Oracle"
            OK_Sources[Multi-Source Fetch<br/>5 Exchanges]
            OK_Aggregate[Price Aggregation<br/>Median/TWAP]
            OK_Detect[Manipulation Detection<br/>Outlier Analysis]
            OK_Confidence[Confidence Scoring]
            
            OK_Sources --> OK_Aggregate
            OK_Aggregate --> OK_Detect
            OK_Detect --> OK_Confidence
        end
        
        subgraph "Social Synth - Content Generator"
            SS_Generate[Content Generation<br/>LLM-based]
            SS_Format[Platform Formatting<br/>Twitter/Farcaster/Lens]
            SS_Schedule[Scheduling<br/>Optimal Timing]
            SS_Track[Engagement Tracking]
            
            SS_Generate --> SS_Format
            SS_Format --> SS_Schedule
            SS_Schedule --> SS_Track
        end
    end

    subgraph "Shared Infrastructure"
        Storage[0G Storage<br/>Genome + Memory]
        TEE[0G Compute TEE<br/>Evolution]
        Alignment[AI Alignment<br/>Safety Checks]
        NFT[Agent NFT<br/>ERC-7857]
    end

    AH_Broadcast --> Storage
    CW_Report --> Storage
    DM_Attest --> Storage
    GM_Evolution --> TEE
    OK_Confidence --> Storage
    SS_Track --> Storage
    
    Storage --> TEE
    TEE --> Alignment
    Alignment --> NFT

    style Storage fill:#8b5cf6,stroke:#fff,color:#fff
    style TEE fill:#8b5cf6,stroke:#fff,color:#fff
    style Alignment fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 12. Technology Stack Deep Dive

```mermaid
graph TB
    subgraph "Frontend Stack"
        Next[Next.js 15<br/>App Router]
        React[React 19<br/>Server Components]
        TS[TypeScript 5.3<br/>Type Safety]
        Tailwind[Tailwind CSS<br/>Utility-First]
        Shadcn[shadcn/ui<br/>Radix Primitives]
        
        Next --> React
        React --> TS
        TS --> Tailwind
        Tailwind --> Shadcn
    end

    subgraph "Web3 Stack"
        Wagmi[wagmi v2<br/>React Hooks]
        Viem[viem<br/>TypeScript Client]
        WC[WalletConnect<br/>Multi-Wallet]
        RainbowKit[RainbowKit<br/>UI Components]
        
        Wagmi --> Viem
        Viem --> WC
        WC --> RainbowKit
    end

    subgraph "Smart Contract Stack"
        Solidity[Solidity 0.8.20<br/>Smart Contracts]
        Foundry[Foundry<br/>Build & Test]
        OZ[OpenZeppelin<br/>Standards]
        Upgradeable[UUPS Proxy<br/>Upgradeability]
        
        Solidity --> Foundry
        Foundry --> OZ
        OZ --> Upgradeable
    end

    subgraph "0G Stack"
        ZGChain[0G Chain<br/>Galileo Testnet]
        ZGStorage[0G Storage<br/>Log + KV]
        ZGCompute[0G Compute<br/>TEE Network]
        ZGSDK[0G SDK<br/>TypeScript]
        
        ZGChain --> ZGSDK
        ZGStorage --> ZGSDK
        ZGCompute --> ZGSDK
    end

    subgraph "Backend Stack"
        NextAPI[Next.js API Routes<br/>Serverless]
        NodeRuntime[Node.js 20<br/>Runtime]
        Vercel[Vercel<br/>Deployment]
        Cron[Vercel Cron<br/>Scheduled Jobs]
        
        NextAPI --> NodeRuntime
        NodeRuntime --> Vercel
        Vercel --> Cron
    end

    subgraph "External APIs"
        Binance[Binance API<br/>Price Data]
        Discord[Discord.js<br/>Bot Integration]
        Neynar[Neynar API<br/>Farcaster]
        LensAPI[Lens Protocol<br/>GraphQL]
        Etherscan[Etherscan API<br/>Whale Tracking]
        OpenRouter[OpenRouter<br/>LLM Gateway]
        
        Binance --> NextAPI
        Discord --> NextAPI
        Neynar --> NextAPI
        LensAPI --> NextAPI
        Etherscan --> NextAPI
        OpenRouter --> NextAPI
    end

    subgraph "State Management"
        Zustand[Zustand<br/>Global State]
        ReactQuery[TanStack Query<br/>Server State]
        ReactHookForm[React Hook Form<br/>Form State]
        Zod[Zod<br/>Validation]
        
        Zustand --> React
        ReactQuery --> React
        ReactHookForm --> Zod
    end

    Next --> Wagmi
    Wagmi --> ZGSDK
    ZGSDK --> ZGChain
    ZGSDK --> ZGStorage
    ZGSDK --> ZGCompute
    
    Solidity --> ZGChain
    
    NextAPI --> ZGSDK

    style ZGChain fill:#8b5cf6,stroke:#fff,color:#fff
    style ZGStorage fill:#8b5cf6,stroke:#fff,color:#fff
    style ZGCompute fill:#8b5cf6,stroke:#fff,color:#fff
    style ZGSDK fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 13. Security Architecture

```mermaid
graph TB
    subgraph "Smart Contract Security"
        AccessControl[Access Control<br/>Ownable + Roles]
        Reentrancy[Reentrancy Guards<br/>OpenZeppelin]
        Pausable[Emergency Pause<br/>Circuit Breaker]
        Upgradeable[UUPS Proxy<br/>Safe Upgrades]
        
        AccessControl --> Reentrancy
        Reentrancy --> Pausable
        Pausable --> Upgradeable
    end

    subgraph "TEE Security - 0G Compute"
        Attestation[Remote Attestation<br/>Verify Enclave]
        SealedExec[Sealed Execution<br/>No Data Leakage]
        MemoryEncrypt[Memory Encryption<br/>Hardware-Level]
        SecureBoot[Secure Boot<br/>Integrity Check]
        
        Attestation --> SealedExec
        SealedExec --> MemoryEncrypt
        MemoryEncrypt --> SecureBoot
    end

    subgraph "Storage Security - 0G Storage"
        Encryption[AES-256 Encryption<br/>Client-Side]
        MerkleProof[Merkle Proofs<br/>Data Integrity]
        Redundancy[3x Redundancy<br/>Fault Tolerance]
        AccessControl2[Access Control<br/>Wallet Signatures]
        
        Encryption --> MerkleProof
        MerkleProof --> Redundancy
        Redundancy --> AccessControl2
    end

    subgraph "Frontend Security"
        InputValidation[Input Validation<br/>Zod Schemas]
        XSSPrevention[XSS Prevention<br/>React Escaping]
        CSRFProtection[CSRF Protection<br/>Next.js Built-in]
        RateLimiting[Rate Limiting<br/>API Routes]
        
        InputValidation --> XSSPrevention
        XSSPrevention --> CSRFProtection
        CSRFProtection --> RateLimiting
    end

    subgraph "Transaction Security"
        Simulation[Transaction Simulation<br/>Before Send]
        GasEstimation[Gas Estimation<br/>Prevent Failures]
        SlippageProtection[Slippage Protection<br/>Price Checks]
        NonceManagement[Nonce Management<br/>Prevent Replay]
        
        Simulation --> GasEstimation
        GasEstimation --> SlippageProtection
        SlippageProtection --> NonceManagement
    end

    subgraph "AI Alignment Security"
        BiasDetection[Bias Detection<br/>Fairness Checks]
        GoalAlignment[Goal Alignment<br/>Intent Verification]
        HarmPrevention[Harm Prevention<br/>Safety Constraints]
        Slashing[Slashing Mechanism<br/>Economic Security]
        
        BiasDetection --> GoalAlignment
        GoalAlignment --> HarmPrevention
        HarmPrevention --> Slashing
    end

    AccessControl --> Attestation
    SealedExec --> Encryption
    InputValidation --> Simulation
    BiasDetection --> Slashing

    style Attestation fill:#8b5cf6,stroke:#fff,color:#fff
    style SealedExec fill:#8b5cf6,stroke:#fff,color:#fff
    style Encryption fill:#8b5cf6,stroke:#fff,color:#fff
    style MerkleProof fill:#8b5cf6,stroke:#fff,color:#fff
```


---

## 14. Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Vercel Edge Network"
            Edge1[Edge Node - US East]
            Edge2[Edge Node - EU West]
            Edge3[Edge Node - Asia Pacific]
            CDN[Vercel CDN<br/>Static Assets]
        end
        
        subgraph "Serverless Functions"
            API1[API Route - Storage]
            API2[API Route - Compute]
            API3[API Route - AlphaHunter]
            API4[API Route - Cron]
        end
        
        subgraph "Cron Jobs"
            CronAlpha[AlphaHunter Cron<br/>Every Hour]
            CronMetrics[Metrics Update<br/>Every 5 Minutes]
        end
    end

    subgraph "0G Network - Galileo Testnet"
        subgraph "Blockchain Layer"
            Validator1[Validator Node 1]
            Validator2[Validator Node 2]
            Validator3[Validator Node 3]
            RPC[RPC Endpoint<br/>https://rpc-testnet.0g.ai]
        end
        
        subgraph "Smart Contracts"
            AgentNFT[ReplicantAgentNFT<br/>0x026a3279...]
            Evolution[EvolutionCoordinator<br/>0x61792dC3...]
            Market[Marketplace<br/>0x15dB35f1...]
            Escrow[SubscriptionEscrow<br/>0x63eeF8C1...]
        end
    end

    subgraph "0G Storage Network"
        StorageNode1[Storage Node 1<br/>US Region]
        StorageNode2[Storage Node 2<br/>EU Region]
        StorageNode3[Storage Node 3<br/>Asia Region]
        Indexer[Storage Indexer<br/>Query Interface]
    end

    subgraph "0G Compute Network"
        TEENode1[TEE Node 1<br/>Intel SGX]
        TEENode2[TEE Node 2<br/>AMD SEV]
        TEENode3[TEE Node 3<br/>ARM TrustZone]
        Orchestrator[Compute Orchestrator<br/>Job Scheduler]
    end

    subgraph "External Services"
        Discord[Discord Bot<br/>Signal Broadcast]
        OpenRouter[OpenRouter<br/>LLM Gateway]
        Binance[Binance API<br/>Price Data]
    end

    Edge1 --> API1
    Edge2 --> API2
    Edge3 --> API3
    
    API1 --> RPC
    API2 --> RPC
    API3 --> RPC
    API4 --> RPC
    
    RPC --> Validator1
    RPC --> Validator2
    RPC --> Validator3
    
    Validator1 --> AgentNFT
    Validator2 --> Evolution
    Validator3 --> Market
    
    API1 --> StorageNode1
    API1 --> StorageNode2
    API1 --> StorageNode3
    StorageNode1 --> Indexer
    
    API2 --> Orchestrator
    Orchestrator --> TEENode1
    Orchestrator --> TEENode2
    Orchestrator --> TEENode3
    
    CronAlpha --> API3
    CronMetrics --> API4
    
    API3 --> Discord
    API3 --> OpenRouter
    API3 --> Binance

    style RPC fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageNode1 fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageNode2 fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageNode3 fill:#8b5cf6,stroke:#fff,color:#fff
    style TEENode1 fill:#8b5cf6,stroke:#fff,color:#fff
    style TEENode2 fill:#8b5cf6,stroke:#fff,color:#fff
    style TEENode3 fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 15. Cost & Performance Metrics

```mermaid
graph LR
    subgraph "Gas Costs - 0G Chain"
        MintCost[Genesis Mint<br/>~150k gas<br/>~$0.01]
        EvolveCost[Evolution<br/>~200k gas<br/>~$0.015]
        ListCost[Marketplace List<br/>~100k gas<br/>~$0.007]
        BuyCost[Purchase<br/>~150k gas<br/>~$0.01]
    end

    subgraph "Storage Costs - 0G Storage"
        GenomeStorage[Genome Storage<br/>1MB @ $0.01/GB/year<br/>~$0.00001/year]
        LogStorage[Evolution Logs<br/>10KB per evolution<br/>~$0.0000001/log]
        TotalStorage[Total Storage<br/>100 agents<br/>~$0.001/year]
    end

    subgraph "Compute Costs - 0G Compute TEE"
        EvolutionCompute[Evolution Job<br/>2-4 seconds<br/>~$0.001/evolution]
        ReencryptCompute[Re-encryption<br/>1-2 seconds<br/>~$0.0005/transfer]
    end

    subgraph "API Costs - External"
        BinanceCost[Binance API<br/>FREE]
        DiscordCost[Discord Bot<br/>FREE]
        FarcasterCost[Farcaster/Neynar<br/>FREE tier]
        LensCost[Lens Protocol<br/>FREE]
        EtherscanCost[Etherscan<br/>FREE tier]
        OpenRouterCost[OpenRouter LLM<br/>~$0.01/signal]
    end

    subgraph "Hosting Costs - Vercel"
        VercelFree[Vercel Hobby<br/>FREE<br/>100GB bandwidth]
        VercelPro[Vercel Pro<br/>$20/month<br/>1TB bandwidth]
    end

    subgraph "Performance Metrics"
        TPS[0G Chain TPS<br/>1M+ transactions/sec]
        Finality[Block Finality<br/><1 second]
        StorageSpeed[Storage Upload<br/>10MB/s average]
        TEELatency[TEE Execution<br/>2-4s per evolution]
    end

    MintCost --> TotalStorage
    EvolveCost --> EvolutionCompute
    BuyCost --> ReencryptCompute
    
    OpenRouterCost --> VercelFree
    
    TPS --> Finality
    Finality --> StorageSpeed
    StorageSpeed --> TEELatency

    style TPS fill:#8b5cf6,stroke:#fff,color:#fff
    style Finality fill:#8b5cf6,stroke:#fff,color:#fff
    style StorageSpeed fill:#8b5cf6,stroke:#fff,color:#fff
    style TEELatency fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 16. User Journey Map

```mermaid
journey
    title REPLICANT User Journey
    section Discovery
      Visit Landing Page: 5: User
      Watch Demo Video: 4: User
      Read Documentation: 3: User
    section Onboarding
      Connect Wallet: 5: User
      Get Testnet Tokens: 4: User
      Explore Dashboard: 5: User
    section Genesis
      Select Species: 5: User
      Enter Agent Name: 5: User
      Mint Genesis Agent: 4: User, 0G Chain
      View Agent Details: 5: User
    section Usage
      Watch Alpha Hunter Signals: 5: User, Agent
      Trigger Evolution: 4: User, 0G TEE, AI Alignment
      View Family Tree: 5: User
      Check Performance: 5: User
    section Trading
      List Agent on Marketplace: 4: User, 0G Chain
      Browse Listings: 5: User
      Purchase Agent: 4: Buyer, 0G Chain, 0G TEE
      Receive Sealed Agent: 5: Buyer
    section Advanced
      Subscribe to Agent Outputs: 4: User
      Cross-Breed Agents: 3: User, 0G TEE
      Build Agent Dynasty: 5: User
```

