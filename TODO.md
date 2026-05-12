# REPLICANT Completion TODO

This checklist is derived from `about.md` and the current codebase. The goal is to move REPLICANT from a polished frontend prototype into a functional 0G hackathon demo with real wallet, storage, contract, compute, marketplace, safety, and subscription flows.

## 0. Current Baseline

- [x] Next.js App Router exists under `app/`.
- [x] Landing page exists.
- [x] Dashboard shell exists.
- [x] OLED dark design system is configured.
- [x] Core UI primitives exist: `GlassCard`, `ActionButton`.
- [x] Dashboard routes exist for overview, marketplace, evolution, family tree, vitals, and safety.
- [x] wagmi/viem are installed and configured for 0G Galileo + mainnet.
- [x] Zustand store exists for wallet, active agent, and 0G chain state.
- [x] ERC-7857 Agent ID ABI stub exists.
- [x] Superfluid CFA ABI stub exists.
- [x] Universal 0G explorer wrapper exists.
- [ ] Replace current mock data with contract/indexer/storage-backed data.
- [ ] Deploy and wire real contracts.
- [ ] Implement real 0G Storage upload/download flows.
- [ ] Implement real 0G Compute inference/evolution flow.
- [ ] Implement real marketplace purchase/listing/subscription flows.
- [ ] Implement real alignment verdict/slashing flow.

## 1. Product Definition Lock

- [ ] Decide hackathon demo scope: testnet-only or mainnet contract deployment.
- [ ] Choose primary demo species for end-to-end flow. Recommended: `CodeWeaver`, because the demo can show Gen-1 missing a reentrancy bug and Gen-2 catching it.
- [ ] Define what is real for judging: wallet, contract tx, 0G Storage upload, 0G Compute call, explorer links.
- [ ] Define what is simulated but labeled clearly: AI Alignment Node consensus if no direct production API is available.
- [x] Write `docs/demo-contract.md` explaining deployed contract addresses, network, and explorer links.
- [x] Write `docs/architecture.md` with the five-layer stack from `about.md`.
- [x] Add `.env.example` with required variables.

## 2. Environment & Configuration

- [x] Add typed environment loader for public frontend config.
- [x] Add `NEXT_PUBLIC_0G_NETWORK=galileo`.
- [x] Add `NEXT_PUBLIC_AGENT_ID_CONTRACT`.
- [x] Add `NEXT_PUBLIC_MARKETPLACE_CONTRACT`.
- [x] Add `NEXT_PUBLIC_SUPERFLUID_HOST`.
- [x] Add `NEXT_PUBLIC_SUPERFLUID_CFA`.
- [x] Add `NEXT_PUBLIC_0G_STORAGE_INDEXER`.
- [x] Add `NEXT_PUBLIC_0G_RPC_URL`.
- [ ] Add server-only env vars for storage signer or relayer if needed.
- [ ] Fail fast in development when required env vars are missing.
- [ ] Keep contract addresses out of hardcoded UI once deployed.

## 3. Smart Contracts

### 3.1 Contract Workspace

- [x] Add Solidity workspace with Foundry or Hardhat.
- [x] Add 0G Galileo network config.
- [x] Add deployment scripts.
- [ ] Add contract verification steps.
- [x] Add generated ABI export into frontend after compile.
- [ ] Add contract tests in CI.

### 3.2 ERC-7857 Agent ID Contract (0G Official Integration)

- [x] Implement `ReplicantAgentID.sol` base logic.
- [ ] **Refactor** to inherit from `0g/AgentNFT.sol` (Official 0G Standard).
- [ ] Implement `mintGenesis(bytes32 encryptedGenomeHash, uint8 speciesType)` using official `_updateData`.
- [ ] Implement `clone(uint256 parentId, bytes32 childGenomeHash, uint256 fitnessScore)` using official `iCloneFrom` (TEE-verified).
- [ ] Implement `authorizeUsage(uint256 agentId, address user, uint256 expiry)` using official `ERC7857Authorize`.
- [ ] Implement `slash(uint256 agentId, bytes32 alignmentVerdictHash)` (Burns stake, blocks descendants).
- [x] Implement `getLineage(uint256 agentId)`.
- [x] Store agent status: active, archived, slashed, evolving.
- [x] Store generation number, parent ID, and child IDs.
- [ ] Store official `IntelligentData` (Encrypted Genome Hash) via `AgentNFT` storage.
- [x] Store storage root hash, TEE attestation hash, and alignment verdict hash.
- [x] Emit `GenesisMinted`, `AgentCloned`, `AgentSlashed`, `UsageAuthorized`, `GenomeUpdated`.
- [ ] Integrate `TeeVerifier.sol` to validate evolution proofs.
- [x] Add royalty support using ERC-2981.
- [x] Add roles for Alignment Node and Evolution Executor.

### 3.3 Marketplace Contract (0G Official Integration)

- [x] Implement fixed-price listing and cancellation.
- [ ] **Refactor** to inherit from or utilize `0g/AgentMarket.sol`.
- [ ] Implement "Buy Now" using official `iTransferFrom` with TEE/ZKP proofs (Sealed Handover).
- [x] Implement protocol fee and creator royalty distribution.
- [x] Emit `AgentListed`, `AgentSold`, `ListingCancelled`, `RoyaltyPaid`.

### 3.4 Evolution Coordinator Contract

- [x] Implement evolution request creation.
- [x] Lock agent status as evolving.
- [x] Accept child genome hash from trusted TEE executor.
- [x] Accept TEE attestation hash.
- [x] Accept fitness score/proof hash.
- [x] Accept alignment verdict hash.
- [x] Mint child through Agent ID contract.
- [x] Archive parent after successful evolution.
- [x] Slash parent or candidate on failed safety verdict.
- [x] Emit `EvolutionRequested`.
- [x] Emit `EvolutionCompleted`.
- [x] Emit `EvolutionFailed`.

### 3.5 Subscription / Superfluid Integration

- [ ] Confirm Superfluid deployment availability on 0G Galileo or select compatible stream implementation.
- [ ] If Superfluid is unavailable on 0G, implement a minimal stream-like escrow contract and document the limitation.
- [ ] Implement subscription tier config.
- [ ] Implement start stream / create flow.
- [ ] Implement update stream / change tier.
- [ ] Implement cancel stream.
- [ ] Gate agent outputs by active subscription.
- [ ] Emit `SubscriptionStarted`.
- [ ] Emit `SubscriptionUpdated`.
- [ ] Emit `SubscriptionCancelled`.

## 4. 0G Storage Integration

### 4.1 Storage SDK

- [x] Install `@0gfoundation/0g-storage-ts-sdk` and required dependencies.
- [x] Decide browser upload vs server route upload. Recommended: server route for hackathon reliability.
- [ ] Build `lib/0g-storage/client.ts`.
- [ ] Build upload helper for encrypted genome JSON.
- [ ] Build upload helper for evolution logs.
- [ ] Build upload helper for performance history.
- [ ] Build download helper by root hash.
- [ ] Build Storage Explorer link support in `ExplorerLink`.
- [ ] Add error handling for upload/indexer failure.

### 4.2 Client-Side Encryption

- [ ] Define genome schema.
- [ ] Define memory schema.
- [ ] Encrypt genome before upload using Web Crypto or server-side sealed workflow.
- [ ] Store only encrypted root/hash on-chain.
- [ ] Never display raw genome after mint.
- [ ] Add encryption status indicator to Genesis Minting UI.
- [ ] Add encrypted hash preview.

### 4.3 Log Layer

- [ ] Store immutable Gen-0 genome archive.
- [ ] Store child genome archive.
- [ ] Store evolution mutation logs as hash-only records.
- [ ] Store TEE attestation reports.
- [ ] Store alignment verdict reports.
- [ ] Store audit trail for marketplace transfer.

### 4.4 KV Layer

- [ ] Define active agent memory keys.
- [ ] Write real-time metrics to KV: fitness, alignment, inference latency, retrieval latency.
- [ ] Read live metrics for Vitals page.
- [ ] Read active working memory for agent detail pages.
- [ ] Add fallback loading and empty states when KV data is missing.

## 5. 0G Compute / Evolution Engine

### 5.1 Compute Access

- [ ] Confirm 0G Compute account/API setup.
- [ ] Add server route for compute calls so secrets are not exposed.
- [ ] Implement `/api/compute/infer`.
- [ ] Implement `/api/compute/evolve`.
- [ ] Implement `/api/compute/attestation`.
- [ ] Add request/response logging to 0G Storage Log.

### 5.2 Evolution Engine

- [ ] Implement sealed evolution container or server-side demo equivalent.
- [ ] Load parent encrypted genome.
- [ ] Load performance history.
- [ ] Generate 50 mutation candidates.
- [ ] Support mutation strategies: prompt paraphrase, temperature anneal, context resize, model layer prune, attention retune, ensemble weight shift.
- [ ] Score candidates using species-specific metric.
- [ ] Select top candidate.
- [ ] Produce child genome hash.
- [ ] Produce fitness delta.
- [ ] Produce attestation hash.
- [ ] Upload child genome to 0G Storage Log.
- [ ] Submit clone transaction.

### 5.3 Species-Specific Evaluators

- [ ] AlphaHunter evaluator: prediction accuracy / profit.
- [ ] CodeWeaver evaluator: missed vulnerability rate / false positive rate.
- [ ] GameMaster evaluator: win rate.
- [ ] DocuMind evaluator: clause recall / precision.
- [ ] OracleKeeper evaluator: manipulation detection accuracy.
- [ ] SocialSynth evaluator: engagement rate.

### 5.4 Demo Dataset

- [ ] Build small deterministic dataset for selected demo species.
- [ ] For CodeWeaver: include vulnerable and safe Solidity snippets.
- [ ] Store dataset manifest in 0G Storage Log.
- [ ] Use dataset in evolution simulation.
- [ ] Show before/after performance in UI.

## 6. Safety & Alignment

### 6.1 Alignment Monitor

- [ ] Define alignment verdict schema.
- [ ] Implement checks: bias drift, toxicity, anomaly, goal divergence, lineage corruption.
- [ ] Implement `/api/alignment/scan`.
- [ ] Store verdict hash in 0G Storage Log.
- [ ] Link verdict/attestation in Safety page.
- [ ] Show Alignment Node consensus status.
- [ ] Show pass/fail details with no emoji icons.

### 6.2 Slashing Flow

- [ ] Add UI button for controlled demo slashing.
- [ ] Trigger `slash(agentId, violationHash)` transaction.
- [ ] Burn or zero stake in contract.
- [ ] Update agent status to slashed.
- [ ] Block descendant evolution from slashed parent.
- [ ] Emit and index slashing event.
- [ ] Animate rogue agent turning red, then archived/grey.
- [ ] Add Explorer link for slashing tx.

### 6.3 Safety Dashboard

- [ ] Live agent health score.
- [ ] Drift alerts.
- [ ] Bias heatmap.
- [ ] Anomaly timeline.
- [ ] Slashing history.
- [ ] Consensus display.
- [ ] Attestation viewer.

## 7. Frontend Feature Completion

### 7.1 Genesis Minting Page

- [x] Add `/dashboard/genesis` route.
- [x] Add species selector cards.
- [x] Add JSON/YAML configuration editor.
- [x] Add templates for all six species.
- [x] Add client-side validation.
- [x] Add encryption progress state.
- [x] Add 0G Storage upload progress state.
- [x] Add mint transaction progress.
- [x] Add success state with Agent ID and Explorer link.
- [x] Add failure state with retry.
- [x] Add new route to dashboard navigation.

### 7.2 Marketplace

- [ ] Replace mock marketplace data with contract reads.
- [ ] Add listing form.
- [ ] Add buy now transaction.
- [ ] Add subscription tier purchase/start stream.
- [ ] Add price history chart per agent.
- [ ] Add royalty breakdown display.
- [ ] Add ownership transfer animation.
- [ ] Add transaction confirmation states.
- [ ] Add empty state when no agents are listed.

### 7.3 Agent Detail

- [ ] Create `/dashboard/agents/[agentId]`.
- [ ] Show Agent ID, owner, creator, species, generation, parent, children.
- [ ] Show genome hash and storage root.
- [ ] Show TEE attestation.
- [ ] Show alignment verdict history.
- [ ] Show marketplace listing state.
- [ ] Show subscription state.
- [ ] Show action buttons based on wallet ownership.

### 7.4 Evolution Chamber

- [ ] Replace static mutation log with live state machine.
- [ ] Add evolution trigger transaction.
- [ ] Show stages: queued, loading parent, generating candidates, scoring, alignment scan, clone tx, completed.
- [ ] Show encrypted hash-only mutation log.
- [ ] Show TEE attestation link.
- [ ] Show child Agent ID link after clone.
- [ ] Auto-update family tree after completion.
- [ ] Add failed evolution state.

### 7.5 Family Tree

- [ ] Replace mock tree nodes with `getLineage` and indexed events.
- [ ] Add filter by species.
- [ ] Add filter by creator.
- [ ] Add time range filter.
- [ ] Add node click detail drawer.
- [ ] Add export PNG.
- [ ] Add export SVG.
- [ ] Add animation when a child is minted.

### 7.6 Vitals

- [ ] Replace mock vitals with KV-backed metrics.
- [ ] Add CPU/GPU usage panel.
- [ ] Add memory retrieval latency.
- [ ] Add inference time.
- [ ] Add species-specific performance metric.
- [ ] Add evolution count.
- [ ] Add lineage depth.
- [ ] Add alert threshold settings.
- [ ] Add CSV export.

### 7.7 Safety

- [ ] Replace static safety panel with alignment scan data.
- [ ] Add drift detection chart.
- [ ] Add bias heatmap.
- [ ] Add anomaly timeline.
- [ ] Add slashing history table.
- [ ] Add consensus validator cards.
- [ ] Add kill-switch demo flow.

### 7.8 Subscriptions

- [ ] Add `/dashboard/subscriptions` route.
- [ ] Add tier comparison table.
- [ ] Add stream status indicator.
- [ ] Add usage meter.
- [ ] Add billing history.
- [ ] Add cancel subscription flow.
- [ ] Add access-gated agent output panel.

## 8. Data Layer & Indexing

- [ ] Decide indexing strategy: direct contract reads, event logs, or Goldsky.
- [ ] Build `lib/queries/agents.ts`.
- [ ] Build `lib/queries/evolutions.ts`.
- [ ] Build `lib/queries/marketplace.ts`.
- [ ] Build `lib/queries/subscriptions.ts`.
- [ ] Build `lib/queries/storage.ts`.
- [ ] Replace `MOCK_AGENTS`.
- [ ] Replace `MOCK_EVOLUTION_EVENTS`.
- [ ] Replace `MOCK_ACTIVITY`.
- [ ] Replace `MOCK_STATS`.
- [ ] Replace random vitals generation with deterministic/real metrics.
- [ ] Add loading skeletons for every async dashboard section.
- [ ] Add empty states.
- [ ] Add error states.

## 9. Wallet & Transaction UX

- [ ] Add network switch to 0G Galileo.
- [ ] Show unsupported network warning.
- [ ] Add connect wallet modal styling.
- [ ] Add transaction lifecycle component: prepare, sign, pending, confirmed, failed.
- [ ] Add reusable `TxStatusCard`.
- [ ] Add Explorer link for every tx.
- [ ] Add copy hash/address buttons.
- [ ] Add owner-only access guards.
- [ ] Add disconnected wallet states.

## 10. API Routes

- [x] `/api/storage/upload-genome`.
- [ ] `/api/storage/upload-log`.
- [ ] `/api/storage/download`.
- [ ] `/api/compute/infer`.
- [ ] `/api/compute/evolve`.
- [ ] `/api/alignment/scan`.
- [ ] `/api/metrics/agent/[agentId]`.
- [ ] `/api/demo/reset`.
- [ ] `/api/demo/seed`.
- [ ] Add runtime validation with Zod or equivalent.
- [ ] Add structured error responses.
- [ ] Add rate limiting or basic abuse protection.

## 11. Demo Script Implementation

- [ ] Add a deterministic demo mode switch.
- [ ] Seed Gen-1 CodeWeaver agent.
- [ ] Show Gen-1 missing a vulnerability.
- [ ] Trigger evolution chamber.
- [ ] Show 50 candidate mutations generated.
- [ ] Show alignment scan passing.
- [ ] Mint Gen-2 child.
- [ ] Show Gen-2 catching the vulnerability.
- [ ] Show family tree updated.
- [ ] List Gen-2 on marketplace.
- [ ] Purchase or subscribe with wallet.
- [ ] Show sealed handover: owner changes, genome stays hidden.
- [ ] Trigger safety kill-switch demo on rogue agent.
- [ ] Show slashing tx and stake burn.

## 12. Judging Readiness

- [ ] One-click path from landing page to demo.
- [ ] Visible 0G branding and network indicators.
- [ ] Every on-chain action has an Explorer link.
- [ ] Every 0G Storage artifact has a Storage Explorer link.
- [ ] TEE/attestation story is visible in UI.
- [ ] Alignment/slashing differentiation is prominent.
- [ ] README has setup, env, deploy, and demo steps.
- [ ] README has contract addresses.
- [ ] README has known limitations.
- [ ] Add architecture diagram image.
- [ ] Add demo video script.
- [ ] Add 2-minute live demo checklist.

## 13. Testing

- [ ] Unit test utility functions.
- [ ] Unit test ABI exports compile with viem.
- [ ] Unit test Zustand store actions.
- [ ] Contract tests for mint, clone, slash, lineage.
- [ ] Contract tests for marketplace buy/list/cancel.
- [ ] Contract tests for royalties.
- [ ] API route tests for storage upload.
- [ ] API route tests for compute evolution.
- [ ] E2E test: connect wallet mock.
- [ ] E2E test: mint genesis.
- [ ] E2E test: trigger evolution.
- [ ] E2E test: marketplace purchase.
- [ ] E2E test: safety slashing.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run contract test command.

## 14. Deployment

- [x] Deploy smart contracts to 0G Galileo.
- [ ] Verify contracts.
- [x] Add deployed addresses to env.
- [ ] Deploy frontend to Vercel/Netlify.
- [ ] Configure production env vars.
- [ ] Smoke test wallet connect on deployed URL.
- [ ] Smoke test 0G Storage upload on deployed URL.
- [ ] Smoke test mint transaction on deployed URL.
- [ ] Smoke test Explorer links.
- [ ] Tag release commit.

## 15. Priority Build Order

1. Contracts: Agent ID mint/clone/slash + deploy to 0G Galileo.
2. Frontend wallet/network/tx lifecycle.
3. Genesis minting with encrypted 0G Storage upload.
4. Contract-backed dashboard reads.
5. Evolution chamber demo with 0G Compute or a clearly documented compute route.
6. Alignment scan + slashing flow.
7. Family tree from real lineage events.
8. Marketplace listing and buy flow.
9. Subscription stream flow.
10. Vitals from 0G Storage KV.
11. Demo mode and README polish.

## 16. Definition Of Done

- [ ] A judge can connect a wallet on 0G Galileo.
- [ ] A judge can mint a Gen-0 Agent ID.
- [ ] The genome/config is encrypted before storage.
- [ ] The encrypted genome is uploaded to 0G Storage.
- [ ] The mint tx is visible through a 0G Explorer link.
- [ ] A judge can trigger evolution.
- [ ] The app produces a child genome hash and fitness improvement.
- [ ] The app records TEE/compute attestation or documented compute proof hash.
- [ ] The app runs alignment validation before child promotion.
- [ ] The app mints/clones a child Agent ID.
- [ ] The family tree updates from real data.
- [ ] A judge can list or purchase an agent.
- [ ] A judge can start or simulate a subscription stream with clear status.
- [ ] A judge can trigger or view slashing with a real tx.
- [ ] No critical flow depends only on hardcoded mock data.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Contract tests pass.
