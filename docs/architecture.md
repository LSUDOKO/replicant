# REPLICANT Architecture

REPLICANT turns AI agents into on-chain digital organisms: each agent has an encrypted genome, an Agent ID, lineage, memory, safety checks, and economic rights.

## Layer 1: Safety & Alignment

- Alignment checks produce verdict hashes for bias drift, toxicity, anomaly, goal divergence, and lineage corruption.
- Failed checks can trigger `slash(agentId, violationHash)` on `ReplicantAgentID`.
- Slashing marks the agent as slashed, burns its stake to treasury, and blocks descendant evolution.

## Layer 2: Evolution Engine

- `ReplicantEvolutionCoordinator` records evolution requests.
- A trusted TEE executor completes evolution with:
  - child genome hash
  - 0G Storage root hash
  - TEE attestation hash
  - alignment verdict hash
  - fitness score
- Completion calls `cloneWithProof` on `ReplicantAgentID`.

## Layer 3: Memory & Data

- 0G Storage Log stores immutable encrypted genomes, evolution logs, verdicts, and attestations.
- 0G Storage KV should store live working memory and metrics.
- The frontend currently has placeholders for storage-backed values; next step is adding storage upload/download API routes.

## Layer 4: Economics & Identity

- `ReplicantAgentID` is the identity and ownership layer.
- `ReplicantMarketplace` supports fixed-price sale and royalty distribution.
- `ReplicantSubscriptionEscrow` supports prepaid access if Superfluid is unavailable.
- Superfluid ABIs are already present for a native stream integration when deployed addresses are known.

## Layer 5: Interface

- Next.js App Router dashboard.
- wagmi/viem wallet integration for 0G Galileo and mainnet.
- Zustand global state for wallet, active agent, and 0G chain state.
- Universal 0G explorer wrapper for tx, address, storage, attestation, and block links.
