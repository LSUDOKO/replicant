import { GenesisMintForm } from "@/components/genesis/GenesisMintForm";

export default function GenesisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Genesis Minting</h1>
        <p className="text-sm text-muted-foreground">
          Encrypt an agent genome, store it on 0G Storage Log, then mint a Gen-0
          Agent ID on 0G Chain.
        </p>
      </div>

      <GenesisMintForm />
    </div>
  );
}
