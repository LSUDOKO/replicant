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
} from "lucide-react";

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Dna size={18} className="text-primary" />
          </div>
          <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            REPLICANT
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                  >
                    <item.icon size={18} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <a
          href="https://explorer.0g.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:justify-center"
        >
          <ExternalLink size={14} />
          <span className="group-data-[collapsible=icon]:hidden">0G Explorer</span>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
