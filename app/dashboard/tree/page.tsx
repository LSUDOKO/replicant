"use client";

import { FamilyTree } from "@/components/tree/FamilyTree";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, Zap, Shield } from "lucide-react";

export default function TreePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Family Tree</h1>
          <p className="text-sm text-white/60">
            Interactive lineage visualization of all agent generations on 0G Chain.
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Active", color: "bg-violet-500" },
            { label: "Evolving", color: "bg-violet-400" },
            { label: "Archived", color: "bg-white/40" },
            { label: "Slashed", color: "bg-white" },
          ].map((item) => (
            <Badge
              key={item.label}
              variant="outline"
              className="border-white/20 text-white/80"
            >
              <span className={`mr-1.5 h-2 w-2 rounded-full ${item.color}`} />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>

      <FamilyTree />

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10">
              <GitBranch size={18} className="text-violet-500" />
            </div>
            <h3 className="mb-1 font-medium text-white">Immutable Lineage</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Every evolution creates a permanent parent-child relationship stored on 0G Chain, forming an unbreakable lineage tree.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10">
              <Zap size={18} className="text-violet-500" />
            </div>
            <h3 className="mb-1 font-medium text-white">Real-Time Updates</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              The tree automatically updates as new agents are minted and evolutions complete, reflecting the latest blockchain state.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10">
              <Shield size={18} className="text-violet-500" />
            </div>
            <h3 className="mb-1 font-medium text-white">Verified Ancestry</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Each node displays verified on-chain data including owner, creator, fitness score, and transaction proof.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardContent className="pt-6">
          <h3 className="mb-3 font-medium text-white">How to Use</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span><strong className="text-white">Click any node</strong> to view detailed agent information including owner, creator, lineage, and transaction hash.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span><strong className="text-white">Drag to pan</strong> around the canvas and explore different branches of the lineage tree.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span><strong className="text-white">Scroll to zoom</strong> in and out for better visibility of large family trees.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span><strong className="text-white">Use controls</strong> in the bottom-left to fit view, zoom, or toggle fullscreen mode.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span><strong className="text-white">Check minimap</strong> in the bottom-right for navigation overview of the entire tree structure.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
