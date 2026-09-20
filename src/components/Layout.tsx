import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex flex-1 flex-col min-h-screen w-full bg-parchment text-ink overflow-hidden">
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

export { Layout };
