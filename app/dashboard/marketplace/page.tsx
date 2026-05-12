import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-sm text-muted-foreground">
          Buy and sell evolved AI agents. Strategy sealed. Memory preserved.
          Lineage proven.
        </p>
      </div>

      <MarketplaceGrid />
    </div>
  );
}
