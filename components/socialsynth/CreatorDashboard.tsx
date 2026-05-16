"use client";

import { useState, useCallback } from "react";
import {
  Sparkles, TrendingUp, MessageCircle, Send, Eye, BarChart3,
  Loader2, Copy, CheckCircle2, Zap, ChevronDown, ChevronUp,
  Heart, Repeat2, ExternalLink, Flame,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import type { ContentPiece, PerformanceMetrics, AgentStats, Platform, Tone, Strategy, ContentFormat } from "@/lib/socialsynth";

const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "twitter", label: "Twitter/X", icon: "𝕏", color: "#8B5CF6" },
  { id: "farcaster", label: "Farcaster", icon: "℉", color: "#D946EF" },
  { id: "lens", label: "Lens", icon: "◈", color: "#A855F7" },
  { id: "discord", label: "Discord", icon: "◆", color: "#A78BFA" },
];

const TONES: { id: Tone; label: string; color: string }[] = [
  { id: "hype", label: "Hype", color: "#C026D3" },
  { id: "educational", label: "Educational", color: "#8B5CF6" },
  { id: "humorous", label: "Humorous", color: "#D946EF" },
  { id: "controversial", label: "Controversial", color: "#F43F5E" },
  { id: "inspirational", label: "Inspirational", color: "#A855F7" },
  { id: "cautionary", label: "Cautionary", color: "#FB923C" },
  { id: "technical", label: "Technical", color: "#6366F1" },
  { id: "neutral", label: "Neutral", color: "#A78BFA" },
];

const STRATEGIES: { id: Strategy; label: string; desc: string }[] = [
  { id: "viral", label: "Viral", desc: "Maximize reach" },
  { id: "educational", label: "Educational", desc: "Build authority" },
  { id: "engagement", label: "Engagement", desc: "Drive replies" },
  { id: "authority", label: "Authority", desc: "Thought leadership" },
  { id: "community", label: "Community", desc: "Foster community" },
];

const FORMATS: { id: ContentFormat; label: string; emoji: string }[] = [
  { id: "thread", label: "Thread", emoji: "🧵" },
  { id: "single", label: "Single", emoji: "📝" },
  { id: "meme", label: "Meme", emoji: "😂" },
  { id: "reply", label: "Reply", emoji: "💬" },
  { id: "poll", label: "Poll", emoji: "📊" },
];

function ContentCard({
  content,
  metrics,
  onPublish,
  onCopy,
  copiedId,
}: {
  content: ContentPiece;
  metrics?: PerformanceMetrics;
  onPublish: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const tone = TONES.find((t) => t.id === content.tone) || TONES[7];
  const preview = content.hook || (Array.isArray(content.content) ? content.content[0] : content.content);

  return (
    <div className={`rounded-xl border transition-all ${expanded ? "border-accent bg-accent/10" : "border-border bg-surface/30"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tone.color }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{preview.slice(0, 80)}</span>
              <span className="text-[10px] rounded-full px-2 py-0.5 font-medium shrink-0" style={{ backgroundColor: `${tone.color}20`, color: tone.color }}>
                {tone.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span>{PLATFORMS.find((p) => p.id === content.platform)?.label}</span>
              <span>·</span>
              <span className="capitalize">{content.format}</span>
              <span>·</span>
              <span className="text-accent">{(content.predictedEngagement * 100).toFixed(0)}% predicted</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {content.status === "published" && <CheckCircle2 size={14} className="text-violet-400" />}
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 space-y-3">
          <div className="mt-3 rounded-xl border border-border bg-surface/40 p-4">
            {Array.isArray(content.content) ? (
              <div className="space-y-2">
                {content.content.map((tweet, i) => (
                  <p key={i} className="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                    <span className="text-accent font-mono text-xs mr-2">{i + 1}/{content.content.length}</span>
                    {tweet}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{content.content}</p>
            )}
            {content.hashtags.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {content.hashtags.map((tag, i) => (
                  <span key={i} className="text-[11px] text-accent">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono">TEE: {content.teeAttestation.slice(0, 12)}...</span>
            <div className="flex items-center gap-2">
              {(content as any).farcasterHash && (
                <a href={`https://warpcast.com/~/conversations/${(content as any).farcasterHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                  <ExternalLink size={10} /> View on Farcaster
                </a>
              )}
              <span>{new Date(content.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <ActionButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCopy(Array.isArray(content.content) ? content.content.join("\n\n") : content.content, content.id)}
              className="flex-1"
            >
              {copiedId === content.id ? <><CheckCircle2 size={12} className="mr-1 text-violet-400" /> Copied</> : <><Copy size={12} className="mr-1" /> Copy</>}
            </ActionButton>
            {content.status === "generated" && (
              <ActionButton type="button" size="sm" onClick={() => onPublish(content.id)} className="flex-1">
                <Send size={12} className="mr-1" /> Mark Published
              </ActionButton>
            )}
          </div>

          {metrics && (
            <div className="pt-2 border-t border-border space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Impressions", value: metrics.impressions.toLocaleString(), icon: Eye, color: "text-muted-foreground" },
                  { label: "Likes", value: metrics.likes.toLocaleString(), icon: Heart, color: "text-destructive" },
                  { label: "Retweets", value: metrics.retweets.toLocaleString(), icon: Repeat2, color: "text-accent" },
                  { label: "Engagement", value: `${(metrics.engagementRate * 100).toFixed(2)}%`, icon: BarChart3, color: metrics.engagementRate > 0.05 ? "text-violet-400" : "text-destructive" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-surface/20 p-2">
                    <div className="flex items-center justify-center gap-1">
                      <s.icon size={10} className={s.color} />
                      <span className="text-[9px] text-muted-foreground">{s.label}</span>
                    </div>
                    <p className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CreatorDashboardProps {
  agentId?: string;
}

export function CreatorDashboard({ agentId: _agentId }: CreatorDashboardProps) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [tone, setTone] = useState<Tone>("educational");
  const [strategy, setStrategy] = useState<Strategy>("viral");
  const [format, setFormat] = useState<ContentFormat | "">("");
  const [contents, setContents] = useState<ContentPiece[]>([]);
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetrics>>({});
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/socialsynth/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, tone, strategy, format: format || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      setContents((prev) => [data.content, ...prev]);
      setTopic("");
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [topic, platform, tone, strategy, format]);

  const handlePublish = useCallback(async (contentId: string) => {
    try {
      const content = contents.find((c) => c.id === contentId);
      const res = await fetch("/api/socialsynth/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", contentId, platform: content?.platform }),
      });
      const data = await res.json();
      if (data.success) {
        const extra: Record<string, string> = {};
        if (data.farcasterHash) extra.farcasterHash = data.farcasterHash;
        setContents((prev) => prev.map((c) => (c.id === contentId ? { ...c, status: "published" as const, ...extra } : c)));
        fetchStats();
      }
    } catch {}
  }, [contents]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/socialsynth/stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch {}
  }, []);

  const toneColor = (t: Tone) => TONES.find((x) => x.id === t)?.color || "#A78BFA";

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
              <Sparkles size={20} className="text-accent-social" />
            </div>
            <div>
              <h2 className="text-base font-medium">SocialSynth Creator</h2>
              <p className="text-xs text-muted-foreground">TEE-sealed AI content generation with audience optimization</p>
            </div>
          </div>
          {stats && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">{stats.totalGenerations} generations</span>
              <span className="text-accent">{stats.totalPublications} published</span>
              <span className="text-destructive">{stats.currentStreak} streak</span>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g., 'Ethereum Layer 2', 'DeFi summer', 'ZK proofs')..."
            className="w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent/50 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Platform</p>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  platform === p.id ? "border-accent bg-accent/10 text-foreground" : "border-border bg-surface/30 text-muted-foreground hover:bg-surface/50"
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Tone</p>
          <div className="flex gap-1.5 flex-wrap">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                  tone === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  borderColor: tone === t.id ? t.color : "var(--border)",
                  backgroundColor: tone === t.id ? `${t.color}20` : undefined,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Strategy</p>
            <div className="flex gap-1.5 flex-wrap">
              {STRATEGIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                    strategy === s.id ? "border-accent bg-accent/10 text-foreground" : "border-border bg-surface/30 text-muted-foreground hover:bg-surface/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Format</p>
            <div className="flex gap-1.5 flex-wrap">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(format === f.id ? "" : f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                    format === f.id ? "border-accent bg-accent/10 text-foreground" : "border-border bg-surface/30 text-muted-foreground hover:bg-surface/50"
                  }`}
                >
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <ActionButton
          type="button"
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="w-full"
        >
          {loading ? (
            <><Loader2 size={14} className="mr-1 animate-spin" /> Generating in TEE...</>
          ) : (
            <><Zap size={14} className="mr-1" /> Generate Content</>
          )}
        </ActionButton>
      </GlassCard>

      {contents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Generated Content ({contents.length})</p>
          </div>
          <div className="space-y-2">
            {contents.map((c) => (
              <ContentCard
                key={c.id}
                content={c}
                metrics={metrics[c.id]}
                onPublish={handlePublish}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
