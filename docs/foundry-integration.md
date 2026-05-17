# Foundry Protocol Integration

Replicant's thesis is **decentralized, verifiable, owned AI**. Today every
species' inference is dispatched to centralized OpenRouter (`gpt-4o-mini`) and
"attested" with `keccak256(json + Date.now() + Math.random())` — a synthetic
hash, not a verifiable anchor.

[Foundry Protocol](https://foundryprotocol.xyz) closes that gap. Foundry lets
people pool data, compute, and capital to **co-train a model**, mint a
verifiable **revenue-generating ownership share** (an _Ingot_, an ERC-721 with
fractional shares), and serve inference over **0G Compute** with an on-chain
inference + revenue receipt.

This integration makes any Replicant species swappable onto a Foundry Ingot —
so a species can be backed by a community-owned model whose contributors earn
revenue every time the agent thinks, with the inference proof anchored on
0G Aristotle.

## How it works

```
runInference(species)
  ├─ Foundry Ingot bound for this species?
  │    └─ yes → foundry.inference.run(ingotId)  → 0G Compute
  │              → { output, receipt: { inferenceTxHash, revenueTxHash } }
  │              → teeAttestation = real on-chain tx hash
  └─ no  → existing OpenRouter path (unchanged)
```

The Foundry path is **opt-in and non-breaking**. A species uses Foundry only
when an Ingot id is resolved for it; otherwise the existing path runs untouched.

## Enabling it

Bind a species to an Ingot via env (see `.env.example`):

```bash
FOUNDRY_INGOT_ALPHA_HUNTER=0x39B7...e1d3        # address or ingot:0x... id
FOUNDRY_INGOT_CODE_WEAVER=ingot:0x...
# optional: FOUNDRY_RPC_URL, FOUNDRY_INFERENCE_ENDPOINT, FOUNDRY_API_KEY
```

…or per request, without touching env:

```bash
curl -X POST localhost:3000/api/inference/alpha-hunter \
  -d '{"config":{"foundryIngot":"ingot:0x...","token":"ETH"}}'
```

`config.foundryIngot` always wins over the species-level env binding.

## API surface

| Route | Purpose |
|---|---|
| `GET /api/foundry` | Foundry deployment addresses + which species are Ingot-backed |
| `GET /api/foundry?tokenId=1` | Lineage + revenue snapshot for a backing Ingot |
| `POST /api/foundry` | Verifiable inference for `{ species, ingotId?, config?, payload? }` |
| `POST /api/inference/[species]` | Existing route — transparently uses Foundry when bound |

`GET /api/foundry?tokenId=N` returns enough to render *"backed by Foundry Ingot
#N — N shares issued, X 0G of revenue split on-chain"* directly in the agent UI.

## What the response gains

Engine output is unchanged in shape, so all existing callers and UI keep
working. Two things upgrade:

- `teeAttestation` becomes a **real 0G inference tx hash** instead of a
  synthetic keccak of `Date.now()`.
- `result._foundry` carries `{ ingotId, requestId, inferenceTxHash,
  revenueTxHash, explorer }` for provenance display and audit.

## Files

| File | Role |
|---|---|
| `lib/foundry.ts` | Foundry client, Ingot resolution, inference adapter, provenance |
| `lib/species/engine.ts` | One additive branch in `runInference` |
| `app/api/foundry/route.ts` | Status + verifiable-inference + provenance API |

Package: [`@foundryprotocol/sdk`](https://www.npmjs.com/package/@foundryprotocol/sdk).
