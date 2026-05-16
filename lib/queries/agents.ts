"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { formatEther, type Address } from "viem";
import { useMemo } from "react";

import { replicantAgentNftAbi as erc7857AgentIdAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { publicEnv } from "@/lib/env";
import type { Agent, AgentSpecies, AgentStatus } from "@/types";

const CONTRACT_ADDRESS = agentIdContractAddresses[publicEnv.network] as Address | undefined;

const SPECIES_MAP: AgentSpecies[] = [
  "alpha-hunter",
  "code-weaver",
  "game-master",
  "docu-mind",
  "oracle-keeper",
  "social-synth",
];

const STATUS_MAP: AgentStatus[] = ["active", "archived", "slashed", "evolving"];

export function useTotalSupply() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: erc7857AgentIdAbi,
    functionName: "totalSupply",
    query: { enabled: !!CONTRACT_ADDRESS },
  });
}

export function useAgent(agentId: bigint | undefined) {
  const agentResult = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: erc7857AgentIdAbi,
    functionName: "getAgentMetadata",
    args: agentId !== undefined ? [agentId] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && agentId !== undefined },
  });

  const ownerResult = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: erc7857AgentIdAbi,
    functionName: "ownerOf",
    args: agentId !== undefined ? [agentId] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && agentId !== undefined },
  });

  const creatorResult = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: erc7857AgentIdAbi,
    functionName: "creatorOf",
    args: agentId !== undefined ? [agentId] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && agentId !== undefined },
  });

  const agent = useMemo(() => {
    if (!agentResult.data || !ownerResult.data) return undefined;
    const [
      speciesType,
      generation,
      statusNum,
      parentId,
      fitnessScore,
      stake,
      storageRootHash,
      teeAttestationHash,
      alignmentVerdictHash,
    ] = agentResult.data;

    return {
      id: agentId!.toString(),
      name: `${SPECIES_MAP[speciesType] ?? "unknown"} #${agentId}`,
      species: SPECIES_MAP[speciesType] ?? "alpha-hunter",
      generation: Number(generation),
      status: STATUS_MAP[statusNum] ?? "active",
      fitnessScore: Number(fitnessScore),
      parentId: parentId > 0n ? parentId.toString() : null,
      childrenIds: [],
      creator: (creatorResult.data ?? ownerResult.data) as Address,
      owner: ownerResult.data as Address,
      createdAt: new Date().toISOString(),
      stake: Number(formatEther(stake)),
      evolutionCount: Number(generation),
      alignmentScore: 100,
      txHash: storageRootHash,
      storageRootHash,
      teeAttestationHash,
      alignmentVerdictHash,
    } satisfies Agent & {
      storageRootHash: `0x${string}`;
      teeAttestationHash: `0x${string}`;
      alignmentVerdictHash: `0x${string}`;
    };
  }, [agentResult.data, ownerResult.data, creatorResult.data, agentId]);

  return {
    agent,
    isLoading: agentResult.isLoading || ownerResult.isLoading,
    error: agentResult.error ?? ownerResult.error,
  };
}

export function useAgents(totalSupply: number) {
  const ids = useMemo(
    () => Array.from({ length: totalSupply }, (_, i) => BigInt(i + 1)),
    [totalSupply]
  );

  const metadataCalls = useMemo(
    () =>
      ids.map((id) => ({
        address: CONTRACT_ADDRESS!,
        abi: erc7857AgentIdAbi,
        functionName: "getAgentMetadata" as const,
        args: [id] as const,
      })),
    [ids]
  );

  const ownerCalls = useMemo(
    () =>
      ids.map((id) => ({
        address: CONTRACT_ADDRESS!,
        abi: erc7857AgentIdAbi,
        functionName: "ownerOf" as const,
        args: [id] as const,
      })),
    [ids]
  );

  const metadataResults = useReadContracts({
    contracts: metadataCalls,
    query: { enabled: !!CONTRACT_ADDRESS && totalSupply > 0 },
  });

  const ownerResults = useReadContracts({
    contracts: ownerCalls,
    query: { enabled: !!CONTRACT_ADDRESS && totalSupply > 0 },
  });

  const agents = useMemo<Agent[]>(() => {
    if (!metadataResults.data || !ownerResults.data) return [];
    return ids.flatMap((id, i) => {
      const metaRes = metadataResults.data[i];
      const ownerRes = ownerResults.data[i];
      if (metaRes.status !== "success" || ownerRes.status !== "success") return [];
      const [
        speciesType,
        generation,
        statusNum,
        parentId,
        fitnessScore,
        stake,
        storageRootHash,
        ,
        ,
      ] = metaRes.result;
      return [
        {
          id: id.toString(),
          name: `${SPECIES_MAP[speciesType] ?? "unknown"} #${id}`,
          species: SPECIES_MAP[speciesType] ?? "alpha-hunter",
          generation: Number(generation),
          status: STATUS_MAP[statusNum] ?? "active",
          fitnessScore: Number(fitnessScore),
          parentId: parentId > 0n ? parentId.toString() : null,
          childrenIds: [],
          creator: ownerRes.result as Address,
          owner: ownerRes.result as Address,
          createdAt: new Date().toISOString(),
          stake: Number(formatEther(stake)),
          evolutionCount: Number(generation),
          alignmentScore: 100,
          txHash: storageRootHash,
        } satisfies Agent,
      ];

    });
  }, [metadataResults.data, ownerResults.data, ids]);

  return {
    agents,
    isLoading: metadataResults.isLoading || ownerResults.isLoading,
    error: metadataResults.error ?? ownerResults.error,
  };
}

export function useLineage(agentId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: erc7857AgentIdAbi,
    functionName: "getLineage",
    args: agentId !== undefined ? [agentId] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && agentId !== undefined },
  });
}

export function useChildren(agentId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: erc7857AgentIdAbi,
    functionName: "getChildren",
    args: agentId !== undefined ? [agentId] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && agentId !== undefined },
  });
}