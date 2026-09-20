import React, { useState } from "react";
import {
  Folder,
  SquarePen,
  MessageSquare,
  Bookmark,
  FileText,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { toArabicIndic } from "../lib/utils";
import { toast } from "sonner";
import { SavedSource } from "../types";

export const ProjectView: React.FC = () => {
  const {
    currentView,
    projects,
    chats,
    savedSources,
    updateProject,
    deleteProject,
    createNewChat,
    selectChat,
    unsaveSource,
  } = useApp();

  const { state: sidebarState } = useSidebar();
  const [activeTab, setActiveTab] = useState<"chats" | "sources" | "notes">("chats");

  const projectId = currentView.type === "project" ? currentView.projectId : "";
  const project = projects.find((p) => p.id === projectId);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project?.name || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(project?.description || "");

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center font-aeonik text-[#9c9c9c] bg-[#101010]">
        المشروع غير موجود أو تم حذفه.
      </div>
    );
  }

  // Chats in this project
  const projectChats = chats.filter((c) => c.projectId === project.id);
  // Saved sources in this project
  const projectSources = savedSources.filter((s) => s.projectId === project.id);

  // Group saved sources by verse
  const sourcesByVerse = projectSources.reduce<Record<string, SavedSource[]>>((acc, src) => {
    const key = `${src.surah}، ${src.ayahNumberText}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(src);
    return acc;
  }, {});

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== project.name) {
      updateProject(project.id, { name: titleInput.trim() });
      toast.success("تم تحديث اسم المشروع");
    } else {
      setTitleInput(project.name);
    }
  };

  const handleDescBlur = () => {
    setIsEditingDesc(false);
    if (descInput !== project.description) {
      updateProject(project.id, { description: descInput.trim() });
      toast.success("تم تحديث وصف المشروع");
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateProject(project.id, { notes: e.target.value });
  };

  return (
    <div className="flex h-full flex-col bg-[#101010] text-[#f3f3f3]">
      {/* Top Bar Header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-[#101010] border-b border-[#212121]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="md:hidden block">
            <SidebarTrigger />
          </div>
          {sidebarState === "collapsed" && (
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
          )}
          <div className="flex items-center gap-2 truncate">
            <Folder className="h-4 w-4 text-[#6f6759] shrink-0" strokeWidth={1.5} />
            <span className="truncate text-[15px] font-aeonik font-normal text-[#f3f3f3]">
              {project.name}
            </span>
          </div>
        </div>

        {/* Action Button: بحث جديد في المشروع */}
        <Button
          onClick={() => createNewChat(project.id)}
          className="gap-2 text-[13px] h-8 px-3 rounded-[8px] bg-[#ffffff] text-[#101010] hover:bg-[#f3f3f3] font-aeonik font-normal"
        >
          <SquarePen className="h-4 w-4" strokeWidth={1.5} />
          <span>بحث جديد في المشروع</span>
        </Button>
      </header>

      {/* Main Project Details */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[768px]">
          {/* Project Title & Description (Editable) */}
          <div className="mb-6 pb-6 border-b border-[#212121]">
            {isEditingTitle ? (
              <input
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                className="w-full text-[24px] font-aeonik font-normal text-[#f3f3f3] bg-transparent pb-1 focus:outline-none border-b border-[#474747]"
              />
            ) : (
              <h1
                onClick={() => {
                  setTitleInput(project.name);
                  setIsEditingTitle(true);
                }}
                className="cursor-pointer text-[24px] font-aeonik font-normal text-[#f3f3f3] hover:text-[#c1c1c1] transition-colors"
                title="اضغط للتعديل"
              >
                {project.name}
              </h1>
            )}

            {isEditingDesc ? (
              <textarea
                autoFocus
                rows={2}
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                onBlur={handleDescBlur}
                className="mt-2 w-full resize-none text-[14px] font-aeonik font-normal text-[#c1c1c1] rounded-[8px] bg-[#080808] p-3 border border-[#212121] focus:outline-none focus:border-[#474747]"
              />
            ) : (
              <p
                onClick={() => {
                  setDescInput(project.description);
                  setIsEditingDesc(true);
                }}
                className="mt-2 cursor-pointer text-[14px] font-aeonik font-normal text-[#9c9c9c] leading-relaxed hover:text-[#f3f3f3] transition-colors"
                title="اضغط للتعديل"
              >
                {project.description || "أضف وصفاً لهذا المشروع..."}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-[12px] font-input text-[#9c9c9c]">
              <span>تاريخ الإنشاء: {project.createdAt}</span>
              <button
                onClick={() => deleteProject(project.id)}
                className="text-[#9c9c9c] hover:text-[#ef4444] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>حذف المشروع</span>
              </button>
            </div>
          </div>

          {/* Three Tabs: Carbon pill container, 1px Graphite border */}
          <div className="flex bg-[#080808] p-1 rounded-[8px] mb-6 border border-[#212121] w-fit">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex items-center gap-2 py-1.5 px-3.5 text-[13px] font-aeonik font-normal rounded-[4.5px] transition-colors ${
                activeTab === "chats"
                  ? "bg-[#212121] text-[#ffffff]"
                  : "text-[#9c9c9c] hover:text-[#f3f3f3]"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>المحادثات</span>
              <span className="text-[11px] font-input opacity-70">({toArabicIndic(projectChats.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab("sources")}
              className={`flex items-center gap-2 py-1.5 px-3.5 text-[13px] font-aeonik font-normal rounded-[4.5px] transition-colors ${
                activeTab === "sources"
                  ? "bg-[#212121] text-[#ffffff]"
                  : "text-[#9c9c9c] hover:text-[#f3f3f3]"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>المصادر المحفوظة</span>
              <span className="text-[11px] font-input opacity-70">({toArabicIndic(projectSources.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-2 py-1.5 px-3.5 text-[13px] font-aeonik font-normal rounded-[4.5px] transition-colors ${
                activeTab === "notes"
                  ? "bg-[#212121] text-[#ffffff]"
                  : "text-[#9c9c9c] hover:text-[#f3f3f3]"
              }`}
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>الملاحظات</span>
            </button>
          </div>

          {/* Tab 1: المحادثات */}
          {activeTab === "chats" && (
            <div className="space-y-3">
              {projectChats.length === 0 ? (
                <div className="rounded-[8px] bg-[#080808] p-8 text-center text-[#9c9c9c] border border-[#212121]">
                  <p className="text-[14px] font-aeonik mb-4">لا توجد محادثات منسوبة لهذا المشروع بعد.</p>
                  <Button
                    onClick={() => createNewChat(project.id)}
                    className="rounded-[8px] bg-[#ffffff] text-[#101010] hover:bg-[#f3f3f3] font-aeonik font-normal"
                  >
                    بدء محادثة في المشروع
                  </Button>
                </div>
              ) : (
                projectChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className="flex cursor-pointer items-center justify-between rounded-[8px] bg-[#080808] p-4 border border-[#212121] transition-colors hover:bg-[#101010] hover:border-[#474747]"
                  >
                    <div className="truncate flex-1">
                      <div className="text-[14px] font-aeonik font-normal text-[#f3f3f3] truncate">
                        {chat.title}
                      </div>
                      <div className="text-[12px] font-input text-[#9c9c9c] mt-1">
                        {toArabicIndic(chat.messages.length)} رسائل
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-[#9c9c9c] ms-2 shrink-0 rtl:rotate-180" strokeWidth={1.5} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: المصادر المحفوظة */}
          {activeTab === "sources" && (
            <div className="space-y-6">
              {projectSources.length === 0 ? (
                <div className="rounded-[8px] bg-[#080808] p-8 text-center text-[#9c9c9c] border border-[#212121]">
                  <p className="text-[14px] font-aeonik">
                    لم تقم بحفظ أي نصوص تفسيرية في هذا المشروع بعد.
                  </p>
                  <p className="text-[13px] font-aeonik mt-1 text-[#9c9c9c]">
                    يمكنك الضغط على زر "احفظ في المشروع" في أي بطاقة تفسير أثناء البحث.
                  </p>
                </div>
              ) : (
                Object.entries(sourcesByVerse).map(([verseTitle, sources]) => (
                  <div key={verseTitle} className="space-y-3">
                    <div className="pb-1 text-[14px] font-aeonik font-normal text-[#c1c1c1]">
                      {verseTitle}
                    </div>

                    <div className="grid gap-3">
                      {sources.map((source) => (
                        <div
                          key={source.id}
                          className="rounded-[8px] bg-[#080808] p-5 border border-[#212121]"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="text-[14px] font-aeonik font-normal text-[#f3f3f3]">
                                {source.bookName}
                              </div>
                              <div className="text-[12px] font-input text-[#9c9c9c]">
                                {source.author}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unsaveSource(project.id, source.ayahRef, source.bookId)}
                              className="h-7 px-2 text-[12px] font-aeonik text-[#9c9c9c] hover:text-[#ef4444] hover:bg-[#212121] rounded-[4.5px]"
                            >
                              إزالة
                            </Button>
                          </div>

                          <p className="text-[14px] font-aeonik font-normal leading-relaxed text-[#c1c1c1] text-start">
                            {source.text}
                          </p>
                          <div className="mt-2 text-end text-[11px] font-input text-[#9c9c9c]">
                            محفوظ بتاريخ: {source.savedAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: الملاحظات */}
          {activeTab === "notes" && (
            <div>
              <label className="block text-[13px] font-aeonik text-[#9c9c9c] mb-2">
                ملاحظات ونتائج البحث الخاصة بالمشروع:
              </label>
              <textarea
                rows={12}
                value={project.notes || ""}
                onChange={handleNotesChange}
                placeholder="اكتب هنا ملاحظاتك، مقارناتك، أو أسئلتك البحثية..."
                className="w-full resize-y rounded-[8px] bg-[#080808] p-4 text-[14px] font-aeonik leading-relaxed text-[#f3f3f3] placeholder:text-[#9c9c9c] focus:outline-none border border-[#212121] focus:border-[#474747]"
              />
              <div className="mt-2 text-[12px] font-input text-[#9c9c9c]">
                يتم حفظ الملاحظات تلقائياً.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
