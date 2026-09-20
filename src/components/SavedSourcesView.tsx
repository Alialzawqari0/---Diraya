import React, { useState } from "react";
import { Bookmark, Folder, Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { toArabicIndic } from "../lib/utils";
import { SavedSource } from "../types";

export const SavedSourcesView: React.FC = () => {
  const { savedSources, projects, setCurrentView } = useApp();
  const { state: sidebarState } = useSidebar();
  const [filterProject, setFilterProject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSources = savedSources.filter((s) => {
    const matchesProject = filterProject === "all" || s.projectId === filterProject;
    const matchesQuery =
      searchQuery === "" ||
      s.surah.includes(searchQuery) ||
      s.bookName.includes(searchQuery) ||
      s.text.includes(searchQuery);
    return matchesProject && matchesQuery;
  });

  // Group by verse
  const sourcesByVerse = filteredSources.reduce<Record<string, SavedSource[]>>((acc, src) => {
    const key = `${src.surah}، ${src.ayahNumberText}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(src);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col bg-[#101010] text-[#f3f3f3]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-[#101010] border-b border-[#212121]">
        <div className="flex items-center gap-2">
          <div className="md:hidden block">
            <SidebarTrigger />
          </div>
          {sidebarState === "collapsed" && (
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-[#6f6759]" strokeWidth={1.5} />
            <h1 className="text-[15px] font-aeonik font-normal text-[#f3f3f3]">
              المصادر المحفوظة ({toArabicIndic(savedSources.length)})
            </h1>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[768px] space-y-6">
          {/* Filters and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9c9c9c]" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الآيات أو نصوص التفسير المحفوظة..."
                className="w-full rounded-[8px] bg-[#080808] border border-[#212121] ps-10 pe-4 py-2.5 text-[14px] font-aeonik text-[#f3f3f3] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#474747]"
              />
            </div>

            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="rounded-[8px] bg-[#080808] border border-[#212121] px-4 py-2.5 text-[14px] font-aeonik text-[#f3f3f3] focus:outline-none focus:border-[#474747] cursor-pointer"
            >
              <option value="all" className="bg-[#080808] text-[#f3f3f3]">جميع المشاريع</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#080808] text-[#f3f3f3]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* List of Saved Sources Grouped by Verse */}
          {Object.keys(sourcesByVerse).length === 0 ? (
            <div className="rounded-[8px] bg-[#080808] p-12 text-center text-[#9c9c9c] border border-[#212121]">
              <Bookmark className="mx-auto h-8 w-8 stroke-[1.5] mb-2 text-[#6f6759] opacity-40" />
              <p className="text-[15px] font-aeonik font-normal text-[#f3f3f3] mb-1">
                لا توجد مصادر محفوظة مطابقة
              </p>
              <p className="text-[13px] font-aeonik text-[#9c9c9c]">
                احفظ أقوال المفسرين من نتائج البحث للرجوع إليها في أي وقت.
              </p>
            </div>
          ) : (
            Object.entries(sourcesByVerse).map(([verseTitle, sources]) => (
              <div key={verseTitle} className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-[14px] font-aeonik font-normal text-[#c1c1c1]">
                    {verseTitle}
                  </h2>
                  <span className="text-[12px] font-input text-[#9c9c9c]">
                    {toArabicIndic(sources.length)} نصوص
                  </span>
                </div>

                <div className="grid gap-3">
                  {sources.map((src) => {
                    const project = projects.find((p) => p.id === src.projectId);
                    return (
                      <div
                        key={src.id}
                        className="rounded-[8px] bg-[#080808] p-5 border border-[#212121] space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-[14px] font-aeonik font-normal text-[#f3f3f3]">
                              {src.bookName}
                            </div>
                            <div className="text-[12px] font-input text-[#9c9c9c]">
                              {src.author}
                            </div>
                          </div>
                          {project && (
                            <button
                              onClick={() =>
                                setCurrentView({ type: "project", projectId: project.id })
                              }
                              className="inline-flex items-center gap-1.5 rounded-[4.5px] bg-[#101010] border border-[#212121] px-2.5 py-1 text-[11px] font-aeonik text-[#c1c1c1] hover:text-[#f3f3f3] hover:border-[#474747] transition-colors"
                            >
                              <Folder className="h-3 w-3 text-[#6f6759]" strokeWidth={1.5} />
                              <span>{project.name}</span>
                            </button>
                          )}
                        </div>

                        {src.ayahText && (
                          <div className="rounded-[8px] bg-[#101010] p-4 text-[18px] text-[#f3f3f3] font-quran text-center border border-[#212121]">
                            {src.ayahText}
                          </div>
                        )}

                        <p className="text-[14px] font-aeonik font-normal leading-relaxed text-[#c1c1c1] text-start">
                          {src.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
