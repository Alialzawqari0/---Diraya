import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X, MessageSquare, Folder } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const CommandDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { chats, projects, selectChat, setCurrentView } = useApp();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 p-16">
      {/* Backdrop: warm-mist 40% */}
      <div
        className="fixed inset-0 bg-warm-mist/40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog: soft-paper, 1px warm-mist, rounded-xl, shadow-subtle */}
      <div
        dir="rtl"
        className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl bg-soft-paper border border-warm-mist shadow-subtle"
      >
        {/* Search Input Bar */}
        <div className="flex items-center bg-parchment rounded-md m-12 p-8 border border-warm-mist">
          <Search className="size-16 text-graphite me-8 shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في عناوين المحادثات والمشاريع..."
            className="w-full bg-transparent text-body font-normal text-ink placeholder:text-ash focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="size-24 rounded-md flex items-center justify-center text-graphite hover:text-ink hover:bg-warm-mist/35 transition-colors"
            >
              <X className="size-14" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-8 flex flex-col gap-8">
          {filteredChats.length === 0 && filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-body text-graphite">
              لا توجد نتائج مطابقة لـ "{query}"
            </div>
          ) : (
            <>
              {filteredChats.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="px-12 py-4 text-body-sm font-medium text-graphite">
                    المحادثات ({filteredChats.length})
                  </div>
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => {
                        selectChat(chat.id);
                        onOpenChange(false);
                      }}
                      className="flex h-36 w-full items-center gap-8 rounded-md px-12 text-start text-body text-ink hover:bg-warm-mist/35 transition-colors"
                    >
                      <MessageSquare className="size-16 text-graphite shrink-0" strokeWidth={1.5} />
                      <span className="truncate flex-1">{chat.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredProjects.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="px-12 py-4 text-body-sm font-medium text-graphite">
                    المشاريع ({filteredProjects.length})
                  </div>
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setCurrentView({ type: "project", projectId: project.id });
                        onOpenChange(false);
                      }}
                      className="flex h-36 w-full items-center gap-8 rounded-md px-12 text-start text-body text-ink hover:bg-warm-mist/35 transition-colors"
                    >
                      <Folder className="size-16 text-graphite shrink-0" strokeWidth={1.5} />
                      <div className="truncate flex-1 flex flex-col">
                        <span className="font-medium text-ink truncate">{project.name}</span>
                        {project.description && (
                          <span className="text-body-sm text-graphite truncate">{project.description}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-warm-mist bg-parchment px-16 py-8 text-caption text-graphite">
          <span>اضغط Esc للإغلاق</span>
          <span>اختصار سريع: Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
