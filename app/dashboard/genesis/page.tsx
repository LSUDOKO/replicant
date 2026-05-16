import { GenesisMintForm } from "@/components/genesis/GenesisMintForm";

export default function GenesisPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="mb-10">
        <h1 className="text-[42px] font-bold tracking-[-1px] text-white">
          Genesis Minting
        </h1>
        <p className="mt-3 text-[15px] text-[#A1A1AA] leading-relaxed max-w-[700px]">
          Mint an Intelligence NFT (INFT) powered by ERC-7857. Your agent genome is
          AES-256 encrypted, stored permanently on 0G Storage, and minted on-chain —
          giving you verifiable ownership of a fully transferable AI agent. Select a
          species below to begin.
        </p>
      </div>

      <GenesisMintForm />
    </div>
  );
}
