"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { MOCK_VITALS } from "@/lib/mock-data";

function subscribeToClientReady(callback: () => void) {
  callback();
  return () => {};
}

export function AgentVitalsChart() {
  const isClient = React.useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false
  );

  return (
    <GlassCard className="p-4">
      <div className="pb-2">
        <h2 className="text-base font-medium">Agent Vitals</h2>
        <p className="text-xs text-muted-foreground">24h performance overview</p>
      </div>
      <div className="pb-4">
        <div className="h-[280px] w-full">
          {isClient ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_VITALS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradFitness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAlignment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "1px solid #1E293B",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="fitness"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fill="url(#gradFitness)"
                  name="Fitness"
                />
                <Area
                  type="monotone"
                  dataKey="alignment"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#gradAlignment)"
                  name="Alignment"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-xl bg-surface-secondary/40" />
          )}
        </div>
      </div>
    </GlassCard>
  );
}
