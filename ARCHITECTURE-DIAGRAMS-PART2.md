# 🏗️ REPLICANT Architecture - Additional Diagrams (Part 2)

## 8. 0G Storage Integration Details

```mermaid
graph TB
    subgraph "Application Layer"
        Frontend[Next.js Frontend]
        API[API Routes]
    end

    subgraph "0G Storage SDK"
        Indexer[0G Storage Indexer]
        Client[0G Storage Client]
        Flow[0G Storage Flow]
    end

    subgraph "0G Storage Network"
        subgraph "Storage Log - Permanent Archive"
            LogNode1[Log Node 1]
            LogNode2[Log Node 2]
            LogNode3[Log Node 3]
            
            GenomeBlob[Genome Blobs<br/>Encrypted with AES-256]
            EvolutionBlob[Evolution History Blobs]
            AttestationBlob[TEE Attestation Blobs]
            VerdictBlob[Alignment Verdict Blobs]
        end
        
        subgraph "Storage KV - Real-Time Cache"
            KVNode1[KV Node 1]
            KVNode2[KV Node 2]
            KVNode3[KV Node 3]
            
            MetricsKV[Agent Metrics<br/>Key: agentId]
            SignalsKV[Trading Signals<br/>Key: agentId:timestamp]
            PerformanceKV[Performance Stats<br/>Key: agentId:metric]
            MemoryKV[Working Memory<br/>Key: agentId:session]
        end
    end

    subgraph "Storage Operations"
        Upload[Upload Operation]
        Download[Download Operation]
        Verify[Merkle Proof Verification]
    end

    Frontend --> API
    API --> Indexer
    API --> Client
    API --> Flow
    
    Indexer --> LogNode1
    Client --> LogNode2
    Flow --> LogNode3
    
    Upload --> GenomeBlob
    Upload --> EvolutionBlob
    Upload --> AttestationBlob
    Upload --> VerdictBlob
    
    Download --> GenomeBlob
    Download --> EvolutionBlob
    
    Verify --> GenomeBlob
    
    API --> KVNode1
    API --> KVNode2
    API --> KVNode3
    
    KVNode1 --> MetricsKV
    KVNode2 --> SignalsKV
    KVNode3 --> PerformanceKV
    KVNode3 --> MemoryKV

    style LogNode1 fill:#8b5cf6,stroke:#fff,color:#fff
    style LogNode2 fill:#8b5cf6,stroke:#fff,color:#fff
    style LogNode3 fill:#8b5cf6,stroke:#fff,color:#fff
    style KVNode1 fill:#8b5cf6,stroke:#fff,color:#fff
    style KVNode2 fill:#8b5cf6,stroke:#fff,color:#fff
    style KVNode3 fill:#8b5cf6,stroke:#fff,color:#fff
```

---

## 9. 0G Compute TEE Workflow

```mermaid
graph TB
    subgraph "Evolution Request"
        User[User Triggers Evolution]
        Contract[Evolution Coordinator]
    end

    subgraph "0G Compute TEE Enclave"
        subgraph "Secure Boot"
            Attestation[Generate Attestation]
            Verify[Verify Enclave Integrity]
        end
        
        subgraph "Genome Processing"
            Download[Download Encrypted Genome<br/>from 0G Storage]
            Decrypt[Decrypt with Parent Key<br/>Inside TEE]
            Validate[Validate Genome Structure]
        end
        
        subgraph "Mutation Engine"
            Strategy[Select Mutation Strategy<br/>Gaussian/Uniform/Crossover]
            Generate[Generate 50 Candidates]
            Mutate[Apply Mutations<br/>Weight adjustments]
        end
        
        subgraph "Fitness Evaluation"
            Simulate[Run 1000 Simulations<br/>per Candidate]
            Score[Calculate Fitness Scores]
            Rank[Rank by Performance]
            Select[Select Best Candidate]
        end
        
        subgraph "Child Preparation"
            Encrypt[Encrypt Child Genome<br/>with Child Key]
            Hash[Generate Genome Hash<br/>keccak256]
            Sign[Sign with TEE Key]
        end
        
        subgraph "Storage Upload"
            Upload[Upload to 0G Storage]
            GetRoot[Get Storage Root Hash]
            Commit[Commit to Blockchain]
        end
    end

    subgraph "Alignment Verification"
        AlignmentNode[AI Alignment Node]
        SafetyChecks[Run Safety Checks]
        VerdictHash[Generate Verdict Hash]
    end

    subgraph "On-Chain Completion"
        Complete[Complete Evolution]
        Mint[Mint Child NFT]
        UpdateLineage[Update Family Tree]
    end

    User --> Contract
    Contract --> Attestation
    Attestation --> Verify
    Verify --> Download
    Download --> Decrypt
    Decrypt --> Validate
    Validate --> Strategy
    Strategy --> Generate
    Generate --> Mutate
    Mutate --> Simulate
    Simulate --> Score
    Score --> Rank
    Rank --> Select
    Select --> Encrypt
    Encrypt --> Hash
    Hash --> Sign
    Sign --> Upload
    Upload --> GetRoot
    GetRoot --> AlignmentNode
    AlignmentNode --> SafetyChecks
    SafetyChecks --> VerdictHash
    VerdictHash --> Commit
    Commit --> Complete
    Complete --> Mint
    Mint --> UpdateLineage

    style Attestation fill:#8b5cf6,stroke:#fff,color:#fff
    style Decrypt fill:#8b5cf6,stroke:#fff,color:#fff
    style Encrypt fill:#8b5cf6,stroke:#fff,color:#fff
    style Upload fill:#8b5cf6,stroke:#fff,color:#fff
```


---

## 10. Complete Data Flow - Genesis to Evolution to Marketplace

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AgentNFT as Agent NFT<br/>(0G Chain)
    participant Storage as 0G Storage
    participant TEE as 0G Compute TEE
    participant Alignment as AI Alignment
    participant Marketplace as Marketplace<br/>(0G Chain)
    participant Buyer

    Note over User,Buyer: PHASE 1: GENESIS MINTING
    User->>Frontend: Mint Genesis Agent
    Frontend->>AgentNFT: mint(user, "Alpha Hunter", ALPHA_HUNTER)
    AgentNFT->>AgentNFT: Generate tokenId = 1
    AgentNFT->>AgentNFT: Set species = ALPHA_HUNTER
    AgentNFT->>AgentNFT: Set generation = 0
    AgentNFT->>AgentNFT: Set fitness = 50
    AgentNFT->>Storage: Upload initial genome
    Storage-->>AgentNFT: genomeHash, storageRoot
    AgentNFT->>AgentNFT: Store genomeHash
    AgentNFT-->>Frontend: Transfer event, tokenId=1
    Frontend-->>User: Success! Agent #1 minted

    Note over User,Buyer: PHASE 2: EVOLUTION
    User->>Frontend: Trigger Evolution (tokenId=1)
    Frontend->>AgentNFT: requestEvolution(1)
    AgentNFT->>AgentNFT: Create requestId = 100
    AgentNFT-->>Frontend: EvolutionRequested(100, 1)
    
    Frontend->>TEE: evolve(requestId=100, parentId=1)
    TEE->>Storage: Download genome for tokenId=1
    Storage-->>TEE: Encrypted genome data
    TEE->>TEE: Decrypt in sealed enclave
    TEE->>TEE: Generate 50 mutations
    TEE->>TEE: Simulate 1000 times each
    TEE->>TEE: Best candidate: +12% fitness
    TEE->>TEE: Encrypt child genome
    TEE->>Storage: Upload child genome
    Storage-->>TEE: childGenomeHash, storageRoot
    TEE->>TEE: Generate TEE attestation
    TEE-->>Frontend: Evolution data
    
    Frontend->>Alignment: scan(childGenomeHash)
    Alignment->>Alignment: Bias check: PASS
    Alignment->>Alignment: Goal check: PASS
    Alignment->>Alignment: Harm check: PASS
    Alignment->>Alignment: Honesty check: PASS
    Alignment-->>Frontend: alignmentVerdictHash, passed=true
    
    Frontend->>AgentNFT: completeEvolution(100, hashes, fitness=56)
    AgentNFT->>AgentNFT: Mint tokenId = 2
    AgentNFT->>AgentNFT: Set parentId[2] = 1
    AgentNFT->>AgentNFT: Add 2 to childIds[1]
    AgentNFT->>AgentNFT: Set generation[2] = 1
    AgentNFT->>AgentNFT: Set fitness[2] = 56
    AgentNFT->>Storage: Upload evolution log
    AgentNFT-->>Frontend: EvolutionCompleted(100, 2)
    Frontend-->>User: Child Agent #2 created!

    Note over User,Buyer: PHASE 3: MARKETPLACE LISTING
    User->>Frontend: List Agent #2 for 100 0G
    Frontend->>AgentNFT: approve(marketplace, 2)
    AgentNFT-->>Frontend: Approval confirmed
    Frontend->>Marketplace: list(2, 100 0G)
    Marketplace->>AgentNFT: Check approval
    Marketplace->>Marketplace: Create listing
    Marketplace-->>Frontend: AgentListed(2, 100 0G)
    Frontend-->>User: Agent listed!

    Note over User,Buyer: PHASE 4: PURCHASE & SEALED HANDOVER
    Buyer->>Frontend: Buy Agent #2
    Frontend->>Marketplace: buy(2) + 100 0G
    Marketplace->>Marketplace: Calculate fees
    Marketplace->>AgentNFT: iTransferFrom(user, buyer, 2)
    
    AgentNFT->>Storage: Download genome for tokenId=2
    Storage-->>AgentNFT: Encrypted genome (user's key)
    AgentNFT->>TEE: Re-encrypt(genome, buyer's key)
    TEE->>TEE: Decrypt with user's key
    TEE->>TEE: Re-encrypt with buyer's key
    TEE->>Storage: Upload re-encrypted genome
    Storage-->>TEE: newGenomeHash, storageRoot
    TEE-->>AgentNFT: Re-encryption complete
    
    AgentNFT->>AgentNFT: Update genomeHash[2]
    AgentNFT->>AgentNFT: Transfer ownership to buyer
    AgentNFT-->>Marketplace: Transfer complete
    
    Marketplace->>User: Send 85 0G (85%)
    Marketplace->>Marketplace: Send 10 0G to treasury (10%)
    Marketplace->>Marketplace: Send 5 0G to creator (5%)
    Marketplace-->>Frontend: AgentSold(2, buyer, 100 0G)
    Frontend-->>Buyer: Agent #2 is yours!
    
    Note over Buyer: Buyer can now use, evolve,<br/>or resell Agent #2
```

