"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { type Address } from "viem";
import { useMemo } from "react";

import { replicantMarketplaceAbi, marketplaceContractAddresses } from "@/lib/contracts/marketplace";
import { publicEnv } from "@/lib/env";

const CONTRACT_ADDRESS = marketplaceContractAddresses[publicEnv.network] as Address | undefined;

export interface Listing {
  tokenId: bigint;
  seller: Address;
  price: bigint;
  active: boolean;
}

/** Read a single listing */
export function useListing(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: replicantMarketplaceAbi,
    functionName: "listings",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && tokenId !== undefined },
  });
}

/** Read listings for a batch of token IDs */
export function useListings(tokenIds: bigint[]) {
  const calls = useMemo(
    () =>
      tokenIds.map((id) => ({
        address: CONTRACT_ADDRESS!,
        abi: replicantMarketplaceAbi,
        functionName: "listings" as const,
        args: [id] as const,
      })),
    [tokenIds]
  );

  const results = useReadContracts({
    contracts: calls,
    query: { enabled: !!CONTRACT_ADDRESS && tokenIds.length > 0 },
  });

  const listings = useMemo<Listing[]>(() => {
    if (!results.data) return [];
    return tokenIds.flatMap((id, i) => {
      const res = results.data[i];
      if (res.status !== "success") return [];
      const [seller, price, active] = res.result;
      if (!active) return [];
      return [{ tokenId: id, seller: seller as Address, price, active }];
    });
  }, [results.data, tokenIds]);

  return { listings, isLoading: results.isLoading, error: results.error };
}
