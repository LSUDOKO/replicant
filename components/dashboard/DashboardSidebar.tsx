"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Dna,
  LayoutDashboard,
  FlaskConical,
  Activity,
  Store,
  Shield,
  ExternalLink,
  Sparkles,
  GitBranch,
  CreditCard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Agents", href: "/dashboard/agents", icon: Users },
  { title: "Genesis", href: "/dashboard/genesis", icon: Sparkles },
  { title: "Market", href: "/dashboard/marketplace", icon: Store },
  { title: "Evolution Chamber", href: "/dashboard/evolution", icon: FlaskConical },
  { title: "Family Tree", href: "/dashboard/tree", icon: GitBranch },
  { title: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { title: "Vitals", href: "/dashboard/vitals", icon: Activity },
  { title: "Safety", href: "/dashboard/safety", icon: Shield },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-[#2D2D3D]">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
            <Dna size={18} className="text-[#8b5cf6]" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white group-data-[collapsible=icon]:hidden">
            REPLICANT
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-[#2D2D3D]" />

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-medium tracking-[0.1em] text-[#8B8B9E] uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.title}
                      className={cn(
                        "relative mx-2 h-9 rounded-lg px-3 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-[rgba(139,92,246,0.1)] text-white"
                          : "text-[#8B8B9E] hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-[#8b5cf6]" />
                      )}
                      <item.icon size={16} className={cn(active ? "text-white" : "text-[#8B8B9E]")} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <a
          href="https://explorer.0g.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-[#8B8B9E] hover:text-white transition-colors group-data-[collapsible=icon]:justify-center"
        >
          <ExternalLink size={14} />
          <span className="group-data-[collapsible=icon]:hidden">0G Explorer</span>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
