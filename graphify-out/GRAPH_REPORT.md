# Graph Report - replicant  (2026-05-12)

## Corpus Check
- 104 files · ~119,093 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 524 nodes · 979 edges · 37 communities (28 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e77ce8a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 115 edges
2. `REPLICANT Completion TODO` - 18 edges
3. `ContractVerifier` - 13 edges
4. `Button()` - 11 edges
5. `Badge()` - 11 edges
6. `GlassCard()` - 10 edges
7. `AgentSpecies` - 10 edges
8. `Card()` - 9 edges
9. `CardContent()` - 9 edges
10. `publicEnv` - 9 edges

## Surprising Connections (you probably didn't know these)
- `WalletStateBridge()` --calls--> `useReplicantStore`  [EXTRACTED]
  app/providers.tsx → lib/store.ts
- `DropdownMenuContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuItem()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts

## Communities (37 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (38): speciesOrder, SPECIES_INFO, STATUS_COLORS, STATUS_DOT_COLORS, MOCK_TREE_EDGES, MOCK_TREE_NODES, ChainHealth, ReplicantState (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (42): 0. Current Baseline, 10. API Routes, 11. Demo Script Implementation, 12. Judging Readiness, 13. Testing, 14. Deployment, 15. Priority Build Order, 16. Definition Of Done (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (22): ActiveAgentPanel(), ActivityFeed(), typeConfig, AgentVitalsChart(), AlignmentGauge(), ChainStatus(), icons, StatsCards() (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (21): agentIdContractAddresses, erc7857AgentIdAbi, evolutionCoordinatorContractAddresses, replicantEvolutionCoordinatorAbi, marketplaceContractAddresses, replicantMarketplaceAbi, replicantSubscriptionEscrowAbi, subscriptionEscrowContractAddresses (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (20): navLinks, AgentDetailModal(), AgentDetailModalProps, formatAddress(), WalletButton(), ActionButton(), Button(), buttonVariants (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (25): navItems, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (22): EvolutionCard(), EvolutionHistory(), statusBadge, strategyLabel, mockLogEntries, MutationLog(), MOCK_EVOLUTION_EVENTS, Card() (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (27): 1. Visit https://pc.0g.ai, connect wallet, deposit 0G tokens, 2. Dashboard → API Keys → create a key with 'inference' permission (starts with sk-), 3. Send a request — any OpenAI-compatible client works:, Create fine-tuning task (fund the fine-tuning sub-account first: transfer-fund --service fine-tuning), Deploy, Download file (--proof enables merkle verification), Get a per-provider secret key, Install (+19 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (23): cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Progress() (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (15): agentMarketInitData, agentNFTInitData, storageInfo, initializeData, attestationConfig, verifierInitData, ADMIN_ROLE, ContractMeta (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (8): CONTRACT_CONFIGS, ContractConfig, ContractVerifier, DeploymentData, HardhatConfig, main(), parseArguments(), VerificationResult

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (15): exo2, geistMono, metadata, orbitron, AppProviders(), WalletStateBridge(), storageIndexers, zeroGContracts (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (11): MarketplaceGrid(), Input(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (10): Hero(), HowItWorks(), steps, icons, IntegrationMap(), Navbar(), problems, ProblemSection() (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (14): 0G Galileo Deployment, code:bash (npm run contracts:build), code:bash (export ZERO_G_GALILEO_RPC_URL="https://evmrpc-testnet.0g.ai"), code:bash (forge script script/DeployReplicant.s.sol:DeployReplicant \), code:bash (NEXT_PUBLIC_0G_NETWORK=galileo), code:bash (NEXT_PUBLIC_AGENT_ID_CONTRACT=0x026a3279A4db6F5C46Ec26E84238), code:text (Agent ID:                0x82b2d475b875b9acb426d07edd91d44a5), code:bash (ZERO_G_STORAGE_PRIVATE_KEY=0x...) (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (12): DeploymentData, getBeaconAddress(), getContractAddress(), getDeploymentsPath(), main(), performSafetyChecks(), readDeployment(), updateDeploymentFiles() (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.32
Nodes (4): DashboardSidebar(), Footer(), Separator(), SidebarInset()

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (6): Layer 1: Safety & Alignment, Layer 2: Evolution Engine, Layer 3: Memory & Data, Layer 4: Economics & Identity, Layer 5: Interface, REPLICANT Architecture

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (3): marketInitData, nftInitData, price

### Community 21 - "Community 21"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 23 - "Community 23"
Cohesion: 0.5
Nodes (3): Agent NFT, Introduction, Our Scheme

## Knowledge Gaps
- **171 isolated node(s):** `config`, `nextConfig`, `eslintConfig`, `orbitron`, `exo2` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 8` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 11`, `Community 12`, `Community 13`, `Community 17`, `Community 20`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `publicEnv` connect `Community 3` to `Community 11`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `GlassCard()` connect `Community 2` to `Community 8`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `config`, `nextConfig`, `eslintConfig` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._