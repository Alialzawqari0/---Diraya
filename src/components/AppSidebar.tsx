import React, { useState } from "react";
import {
  SquarePen,
  Search,
  Bookmark,
  Folder,
  ChevronDown,
  Plus,
  MoreHorizontal,
  FolderInput,
  Trash2,
  Edit2,
  User,
  Sliders,
  Download,
  LogOut,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarGroup,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuAction,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { toArabicIndic } from "../lib/utils";
import { toast } from "sonner";
import { Chat } from "../types";

export const AppSidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    projects,
    chats,
    user,
    createNewChat,
    selectChat,
    renameChat,
    deleteChat,
    moveChatToProject,
    createProject,
    deleteProject,
    updateProject,
    setIsSearchOpen,
    isNewProjectOpen,
    setIsNewProjectOpen,
  } = useApp();

  // Dialog states
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ type: "chat" | "project"; id: string; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [showAllProjectsDialog, setShowAllProjectsDialog] = useState(false);

  // Group unassigned chats by time period: "اليوم", "أمس", "آخر ٧ أيام", "أقدم"
  const unassignedChats = chats.filter((c) => !c.projectId);

  const groupChatsByDate = (chatList: Chat[]) => {
    const today: Chat[] = [];
    const yesterday: Chat[] = [];
    const last7Days: Chat[] = [];
    const older: Chat[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = todayStart - 7 * 86400000;

    chatList.forEach((chat) => {
      const chatTime = new Date(chat.createdAt).getTime();
      if (chatTime >= todayStart) {
        today.push(chat);
      } else if (chatTime >= yesterdayStart) {
        yesterday.push(chat);
      } else if (chatTime >= sevenDaysStart) {
        last7Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { today, yesterday, last7Days, older };
  };

  const chatGroups = groupChatsByDate(unassignedChats);

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createProject(newProjectName, newProjectDesc);
    setNewProjectName("");
    setNewProjectDesc("");
    setIsNewProjectOpen(false);
    toast.success("تم إنشاء المشروع بنجاح");
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    if (renameTarget.type === "chat") {
      renameChat(renameTarget.id, renameValue);
    } else {
      updateProject(renameTarget.id, { name: renameValue });
      toast.success("تمت إعادة تسمية المشروع");
    }
    setRenameDialogOpen(false);
    setRenameTarget(null);
  };

  const openRename = (type: "chat" | "project", id: string, currentTitle: string) => {
    setRenameTarget({ type, id, title: currentTitle });
    setRenameValue(currentTitle);
    setRenameDialogOpen(true);
  };

  return (
    <>
      <Sidebar side="right" dir="rtl" variant="inset" collapsible="offcanvas">
        {/* 1. SidebarHeader: Wordmark and Header actions (Search & New Chat) */}
        <SidebarHeader className="py-12 px-16 border-b border-warm-mist">
          <div className="flex items-center gap-8">
            <span className="text-body-lg font-semibold text-pure-black leading-diacritics">
              دِرَايَة
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex size-32 items-center justify-center rounded-md text-graphite hover:bg-warm-mist/35 hover:text-ink transition-colors"
              title="بحث في المحادثات"
              aria-label="بحث في المحادثات"
            >
              <Search className="size-16 stroke-[1.5]" />
            </button>
            <button
              onClick={() => createNewChat()}
              className="inline-flex size-32 items-center justify-center rounded-md text-graphite hover:bg-warm-mist/35 hover:text-ink transition-colors"
              title="بحث جديد"
              aria-label="بحث جديد"
            >
              <SquarePen className="size-16 stroke-[1.5]" />
            </button>
          </div>
        </SidebarHeader>

        {/* Quick navigation: "المحفوظات" */}
        <SidebarGroup className="pt-8 px-12">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={currentView.type === "saved_sources"}
                onClick={() => setCurrentView({ type: "saved_sources" })}
              >
                <Bookmark className="size-16 stroke-[1.5] text-graphite shrink-0" />
                <span>المحفوظات</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarContent>
          {/* 3. Group "المشاريع" */}
          <Collapsible defaultOpen={true}>
            <SidebarGroup className="px-12">
              <div className="flex items-center justify-between h-32 px-12">
                <CollapsibleTrigger className="flex items-center gap-4 text-body-sm font-medium text-graphite hover:text-ink transition-colors">
                  <ChevronDown className="size-14 transition-transform group-data-[state=closed]:-rotate-90 rtl:group-data-[state=closed]:rotate-90" />
                  <span>المشاريع</span>
                </CollapsibleTrigger>
                <SidebarGroupAction
                  onClick={() => setIsNewProjectOpen(true)}
                  aria-label="مشروع جديد"
                  title="إنشاء مشروع جديد"
                >
                  <Plus className="size-16 text-graphite" />
                </SidebarGroupAction>
              </div>

              <CollapsibleContent>
                <SidebarMenu className="mt-4">
                  {projects.length === 0 ? (
                    <div className="px-12 py-8 text-caption text-graphite leading-relaxed select-none">
                      ما عندك مشاريع بعد. المشروع يجمع محادثاتك ومصادرك المحفوظة.
                    </div>
                  ) : (
                    <>
                      {projects.slice(0, 5).map((project) => {
                        const projectChatsCount = chats.filter((c) => c.projectId === project.id).length;
                        const isProjectActive =
                          currentView.type === "project" && currentView.projectId === project.id;

                        return (
                          <SidebarMenuItem key={project.id}>
                            <SidebarMenuButton
                              isActive={isProjectActive}
                              onClick={() =>
                                setCurrentView({ type: "project", projectId: project.id })
                              }
                            >
                              <Folder className="size-16 stroke-[1.5] text-graphite shrink-0" />
                              <span className="truncate flex-1 text-start">{project.name}</span>
                              <SidebarMenuBadge>
                                {toArabicIndic(projectChatsCount)}
                              </SidebarMenuBadge>
                            </SidebarMenuButton>

                            {/* Dropdown Menu for Project Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction aria-label="خيارات المشروع">
                                  <MoreHorizontal className="size-16 text-graphite" />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" side="bottom">
                                <DropdownMenuItem
                                  onClick={() => openRename("project", project.id, project.name)}
                                >
                                  <Edit2 className="size-14 me-8 text-graphite" />
                                  <span>إعادة تسمية</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  destructive
                                  onClick={() => deleteProject(project.id)}
                                >
                                  <Trash2 className="size-14 me-8 text-ink" />
                                  <span>حذف</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>
                        );
                      })}

                      {/* Show "عرض الكل" row if more than 5 projects */}
                      {projects.length > 5 && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => setShowAllProjectsDialog(true)}
                            className="text-body-sm text-graphite hover:text-ink"
                          >
                            <span>عرض الكل ({toArabicIndic(projects.length)})</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </>
                  )}
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* 4. Group "المحادثات" */}
          <Collapsible defaultOpen={true}>
            <SidebarGroup className="px-12 pt-8">
              <div className="flex items-center justify-between h-32 px-12">
                <CollapsibleTrigger className="flex items-center gap-4 text-body-sm font-medium text-graphite hover:text-ink transition-colors">
                  <ChevronDown className="size-14 transition-transform" />
                  <span>المحادثات</span>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                {unassignedChats.length === 0 ? (
                  <div className="px-12 py-8 text-caption text-graphite select-none">
                    محادثاتك تظهر هنا.
                  </div>
                ) : (
                  <div className="flex flex-col gap-12 mt-4">
                    {/* Subheading Today */}
                    {chatGroups.today.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <div className="px-12 text-caption text-graphite font-normal">اليوم</div>
                        <SidebarMenu>
                          {chatGroups.today.map((chat) => renderChatItem(chat))}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Subheading Yesterday */}
                    {chatGroups.yesterday.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <div className="px-12 text-caption text-graphite font-normal">أمس</div>
                        <SidebarMenu>
                          {chatGroups.yesterday.map((chat) => renderChatItem(chat))}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Subheading Last 7 Days */}
                    {chatGroups.last7Days.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <div className="px-12 text-caption text-graphite font-normal">آخر ٧ أيام</div>
                        <SidebarMenu>
                          {chatGroups.last7Days.map((chat) => renderChatItem(chat))}
                        </SidebarMenu>
                      </div>
                    )}

                    {/* Subheading Older */}
                    {chatGroups.older.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <div className="px-12 text-caption text-graphite font-normal">أقدم</div>
                        <SidebarMenu>
                          {chatGroups.older.map((chat) => renderChatItem(chat))}
                        </SidebarMenu>
                      </div>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>

        {/* 5. SidebarFooter: User Profile Row with Upward Dropdown */}
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-36 w-full items-center gap-8 rounded-md px-12 text-start text-body font-medium text-ink hover:bg-warm-mist/35 transition-colors focus-visible:outline-none"
              >
                <Avatar name={user.name} />
                <span className="flex-1 truncate font-medium text-body">{user.name}</span>
                <ChevronDown className="size-16 text-graphite shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuItem onClick={() => setCurrentView({ type: "profile" })}>
                <User className="size-14 me-8 text-graphite" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView({ type: "profile" })}>
                <Sliders className="size-14 me-8 text-graphite" />
                <span>التفاسير المفضلة</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView({ type: "styleguide" })}>
                <Bookmark className="size-14 me-8 text-deep-teal" />
                <span className="text-deep-teal font-medium">دليل التصميم (Styleguide)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast("غير متاح في النموذج الأولي")}>
                <Download className="size-14 me-8 text-graphite" />
                <span>تصدير بياناتي</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast("تسجيل الخروج غير متاح في النموذج التجريبي")}>
                <LogOut className="size-14 me-8 text-graphite" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Dialog for Creating New Project */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>مشروع جديد</DialogTitle>
            <DialogDescription>
              أنشئ مشروعاً لتنظيم محادثاتك ومصادرك التفسيرية المحفوظة في مكان واحد.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProjectSubmit} className="flex flex-col gap-12 pt-4">
            <div className="flex flex-col gap-4">
              <label className="text-body-sm font-medium text-graphite">
                اسم المشروع
              </label>
              <input
                autoFocus
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="مثال: تفسير آيات الصيام"
                className="w-full rounded-md border border-warm-mist bg-soft-paper px-12 py-8 text-body text-ink placeholder:text-ash focus:outline-none focus:border-deep-teal transition-colors"
              />
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-body-sm font-medium text-graphite">
                الوصف (اختياري)
              </label>
              <textarea
                rows={2}
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="نبذة عن موضوع البحث أو الهدف منه..."
                className="w-full resize-none rounded-md border border-warm-mist bg-soft-paper px-12 py-8 text-body text-ink placeholder:text-ash focus:outline-none focus:border-deep-teal transition-colors"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!newProjectName.trim()}>
                إنشاء المشروع
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewProjectOpen(false)}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Renaming chat/project */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {renameTarget?.type === "chat" ? "إعادة تسمية المحادثة" : "إعادة تسمية المشروع"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="flex flex-col gap-12 pt-4">
            <input
              autoFocus
              required
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded-md border border-warm-mist bg-soft-paper px-12 py-8 text-body text-ink placeholder:text-ash focus:outline-none focus:border-deep-teal transition-colors"
            />
            <DialogFooter>
              <Button type="submit" disabled={!renameValue.trim()}>
                حفظ
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for All Projects */}
      <Dialog open={showAllProjectsDialog} onOpenChange={setShowAllProjectsDialog}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>جميع المشاريع ({toArabicIndic(projects.length)})</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-8">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  setCurrentView({ type: "project", projectId: proj.id });
                  setShowAllProjectsDialog(false);
                }}
                className="flex items-center justify-between rounded-md p-8 hover:bg-warm-mist/35 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-8">
                  <Folder className="size-16 text-graphite" />
                  <span className="text-body text-ink">{proj.name}</span>
                </div>
                <span className="text-caption text-graphite">
                  {toArabicIndic(chats.filter((c) => c.projectId === proj.id).length)} محادثات
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  function renderChatItem(chat: Chat) {
    const isChatActive = currentView.type === "chat" && currentView.chatId === chat.id;

    return (
      <SidebarMenuItem key={chat.id}>
        <SidebarMenuButton
          isActive={isChatActive}
          onClick={() => selectChat(chat.id)}
        >
          <span className="truncate flex-1 text-start text-body font-normal">{chat.title}</span>
        </SidebarMenuButton>

        {/* Dropdown Menu for Chat Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction aria-label="خيارات المحادثة">
              <MoreHorizontal className="size-16 text-graphite" />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem onClick={() => openRename("chat", chat.id, chat.title)}>
              <Edit2 className="size-14 me-8 text-graphite" />
              <span>إعادة تسمية</span>
            </DropdownMenuItem>

            {/* Submenu for Moving to a Project */}
            <DropdownMenuSub
              label="نقل إلى مشروع"
              icon={<FolderInput className="size-14 text-graphite" />}
            >
              {projects.length === 0 ? (
                <div className="px-12 py-8 text-caption text-graphite">
                  لا توجد مشاريع متاحة
                </div>
              ) : (
                <>
                  <DropdownMenuLabel>اختر المشروع</DropdownMenuLabel>
                  {projects.map((proj) => (
                    <DropdownMenuItem
                      key={proj.id}
                      onClick={() => moveChatToProject(chat.id, proj.id)}
                    >
                      <Folder className="size-14 me-8 text-graphite" />
                      <span className="truncate">{proj.name}</span>
                    </DropdownMenuItem>
                  ))}
                  {chat.projectId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => moveChatToProject(chat.id, undefined)}>
                        <span className="text-graphite">إلغاء التعيين</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={() => deleteChat(chat.id)}>
              <Trash2 className="size-14 me-8 text-ink" />
              <span>حذف</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }
};
