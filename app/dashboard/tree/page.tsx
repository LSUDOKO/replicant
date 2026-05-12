"use client";

import { FamilyTree } from "@/components/tree/FamilyTree";
import { Badge } from "@/components/ui/badge";

export default function TreePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Family Tree</h1>
          <p className="text-sm text-muted-foreground">
            Interactive lineage visualization of all agent generations.
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Active", color: "bg-success" },
            { label: "Archived", color: "bg-muted-foreground" },
            { label: "Slashed", color: "bg-destructive" },
            { label: "Evolving", color: "bg-cyan" },
          ].map((item) => (
            <Badge
              key={item.label}
              variant="outline"
              className="border-border-bright text-muted-foreground"
            >
              <span className={`mr-1.5 h-2 w-2 rounded-full ${item.color}`} />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>

      <FamilyTree />
    </div>
  );
}
