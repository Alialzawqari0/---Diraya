import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "@/components/Layout";
import { ChatView } from "./components/ChatView";
import { ProjectView } from "./components/ProjectView";
import { ProfileView } from "./components/ProfileView";
import { SavedSourcesView } from "./components/SavedSourcesView";
import { StyleguideView } from "./components/StyleguideView";
import { CommandDialog } from "./components/ui/command";
import { Toaster } from "sonner";

const MainContent: React.FC = () => {
  const { currentView, isSearchOpen, setIsSearchOpen } = useApp();

  return (
    <>
      <Layout>
        {/* Main Area: background parchment with soft-paper inner surface */}
        <div className="flex-1 h-full min-h-screen bg-parchment overflow-hidden flex flex-col">
          {currentView.type === "chat" && <ChatView />}
          {currentView.type === "project" && <ProjectView />}
          {currentView.type === "profile" && <ProfileView />}
          {currentView.type === "saved_sources" && <SavedSourcesView />}
          {currentView.type === "styleguide" && <StyleguideView />}
        </div>
      </Layout>

      {/* Command dialog (Ctrl+K or "بحث في المحادثات") */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Sonner Toast at the bottom in RTL: soft-paper, 1px warm-mist, rounded-xl, shadow-subtle, text-body ink, action "تراجع" in deep-teal weight 500 */}
      <Toaster
        position="bottom-center"
        dir="rtl"
        toastOptions={{
          className: "!bg-soft-paper !text-ink !border !border-warm-mist !text-body !rounded-xl !shadow-subtle",
          actionButtonStyle: {
            backgroundColor: "transparent",
            color: "var(--color-deep-teal)",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            padding: "4px 12px",
          },
        }}
      />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
