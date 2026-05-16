import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ChainStatus } from "@/components/dashboard/ChainStatus";
import { WalletButton } from "@/components/shared/WalletButton";
import { NetworkGuard } from "@/components/shared/NetworkGuard";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,17,0.7)] backdrop-blur-[16px] px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-[#A1A1AA] hover:text-white transition-colors" />
            <Separator orientation="vertical" className="h-5 bg-[rgba(255,255,255,0.06)]" />
            <span className="text-sm text-[#A1A1AA] font-medium tracking-wide">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <ChainStatus />
            <WalletButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          <NetworkGuard>{children}</NetworkGuard>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
