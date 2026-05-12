"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Hash } from "lucide-react";

const mockLogEntries = [
  { time: "08:00:12", hash: "0xa1b2c3...d4e5f6", stage: "init", message: "Evolution chamber initialized" },
  { time: "08:00:45", hash: "0xf6e5d4...c3b2a1", stage: "decrypt", message: "Parent genome decrypted in TEE" },
  { time: "08:01:30", hash: "0x112233...445566", stage: "analyze", message: "Performance history analyzed — 12 failure patterns identified" },
  { time: "08:02:15", hash: "0x778899...aabbcc", stage: "mutate", message: "Generating 50 mutation candidates..." },
  { time: "08:05:00", hash: "0xddeeff...001122", stage: "mutate", message: "Strategy: prompt_paraphrase — 18 variants" },
  { time: "08:05:30", hash: "0x334455...667788", stage: "mutate", message: "Strategy: temperature_adjust — 12 variants" },
  { time: "08:06:00", hash: "0x990011...223344", stage: "mutate", message: "Strategy: context_window_resize — 10 variants" },
  { time: "08:06:30", hash: "0x556677...889900", stage: "mutate", message: "Strategy: model_layer_prune — 10 variants" },
  { time: "08:10:00", hash: "0xaabbcc...ddeeff", stage: "test", message: "Simulating on historical data (2,847 samples)..." },
  { time: "08:18:00", hash: "0x010203...040506", stage: "test", message: "31 of 50 candidates evaluated" },
];

export function MutationLog() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Lock size={16} className="text-muted-foreground" />
          Mutation Log
          <span className="label-uppercase text-muted-foreground">(hash-only)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-2">
            {mockLogEntries.map((entry, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-surface/30 px-3 py-2 font-mono text-xs"
              >
                <span className="shrink-0 text-muted-foreground">{entry.time}</span>
                <Hash size={12} className="mt-0.5 shrink-0 text-primary/50" />
                <span className="shrink-0 text-primary/70">{entry.hash}</span>
                <span className="text-muted-foreground">{entry.message}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
