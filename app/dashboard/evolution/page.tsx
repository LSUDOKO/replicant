import { EvolutionCard } from "@/components/evolution/EvolutionCard";
import { MutationLog } from "@/components/evolution/MutationLog";
import { EvolutionHistory } from "@/components/evolution/EvolutionHistory";

export default function EvolutionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Evolution Chamber</h1>
        <p className="text-sm text-muted-foreground">
          Sealed TEE environment where agents self-improve through autonomous
          mutation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EvolutionCard />
        <MutationLog />
      </div>

      <EvolutionHistory />
    </div>
  );
}
