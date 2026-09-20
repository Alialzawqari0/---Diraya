import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LineByLineReveal } from "./LineByLineReveal";
import {
  RotateCw,
  AlertCircle,
  Check,
  Copy,
  Bookmark,
  SparklesIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Composer } from "./Composer";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  Bubble,
  BubbleContent,
} from "./ui/bubble";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "./ui/marker";
import { Spinner } from "./ui/spinner";
import {
  Message as UIMessage,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "./ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "./ui/message-scroller";
import { toArabicIndic } from "../lib/utils";
import { toast } from "sonner";
import { Ayah, Book, Message, TafsirEntry } from "../types";
import { SuggestionRows } from "./SuggestionRows";

const VIEWER_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80";

export const ChatView: React.FC = () => {
  const {
    currentView,
    chats,
    projects,
    books,
    retryMessage,
    saveSource,
  } = useApp();

  const activeChat = currentView.type === "chat" ? chats.find((c) => c.id === currentView.chatId) : null;
  const isNewChat = !activeChat || activeChat.messages.length === 0;

  // Track copied state per message
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Opening animation stages: blank -> greeting in center for 3s -> settled with blur reveal of all elements
  const [introStage, setIntroStage] = useState<"blank" | "center" | "settled">(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("dirayah_intro_played")) {
      return "settled";
    }
    return "blank";
  });

  useEffect(() => {
    if (!isNewChat) {
      setIntroStage("settled");
      return;
    }

    if (introStage === "blank") {
      const t1 = setTimeout(() => {
        setIntroStage("center");
      }, 100);
      return () => clearTimeout(t1);
    }

    if (introStage === "center") {
      const t2 = setTimeout(() => {
        setIntroStage("settled");
        if (typeof window !== "undefined") {
          sessionStorage.setItem("dirayah_intro_played", "true");
        }
      }, 3000);
      return () => clearTimeout(t2);
    }
  }, [introStage, isNewChat]);

  // Reset copied state after timeout
  useEffect(() => {
    if (!copiedId) return;
    const timer = setTimeout(() => setCopiedId(null), 1800);
    return () => clearTimeout(timer);
  }, [copiedId]);

  if (!activeChat) {
    return (
      <div className="flex h-full items-center justify-center text-[#737373]">
        اختر محادثة من الشريط الجانبي أو ابدأ بحثاً جديداً.
      </div>
    );
  }

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return "14:45";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "14:45";
    }
  };

  const handleCopyFullMessage = (message: Message) => {
    let fullText = "";
    if (message.ayah) {
      fullText += `${message.ayah.surah} - الآية ${message.ayah.ayahFrom}:\n${message.ayah.text}\n\n`;
    }
    if (message.tafsirs && message.tafsirs.length > 0) {
      message.tafsirs.forEach((t) => {
        const book = books.find((b) => b.id === t.bookId);
        fullText += `[${book?.name || t.bookId}]:\n${t.text}\n\n`;
      });
    } else if (message.content) {
      fullText = message.content;
    }

    navigator.clipboard.writeText(fullText.trim());
    setCopiedId(message.id);
    toast.success("تم نسخ محتوى الرد بالكامل");
  };

  const handleSaveTafsir = (entry: TafsirEntry, book?: Book, ayah?: Ayah) => {
    const isRange = ayah ? ayah.ayahFrom !== ayah.ayahTo : false;
    const verseText = ayah
      ? isRange
        ? `الآيات ${toArabicIndic(ayah.ayahFrom)} - ${toArabicIndic(ayah.ayahTo)}`
        : `الآية ${toArabicIndic(ayah.ayahFrom)}`
      : "";

    saveSource({
      bookId: entry.bookId,
      bookName: book?.name || entry.bookId,
      author: book?.author || "",
      surah: ayah?.surah || "سورة في القرآن",
      ayahNumberText: verseText,
      ayahText: ayah?.text || "",
      text: entry.text,
      ayahRef: entry.ayahRef || `${ayah?.surah || ""}:${ayah?.ayahFrom || 1}`,
      projectId: activeChat.projectId || (projects[0]?.id || "default"),
    });
    toast.success("تم حفظ التفسير في المحفوظات");
  };

  const isBusy = activeChat.messages.some((m) => m.isSearching);

  return (
    <MessageScrollerProvider>
      <div className="relative flex h-full flex-col bg-[#FAFAFA] overflow-hidden">
        {/* 3-Second Center Greeting Overlay on First Opening */}
        <AnimatePresence>
          {isNewChat && introStage === "center" && (
            <motion.div
              key="center-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA]"
            >
              <motion.h1
                initial={{ opacity: 0, filter: "blur(24px)", scale: 0.94 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="text-center text-[30px] md:text-[38px] font-semibold text-[#0A0A0A] tracking-tight select-none px-4"
              >
                السلام عليكم عبدالله
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header - With Sidebar Trigger */}
        <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-[#080808] border-b border-[#212121] z-20">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <SidebarTrigger />
            <h1 className="truncate text-[15px] font-aeonik font-normal text-[#f3f3f3]">
              {activeChat.title}
            </h1>
          </div>
        </header>

        {/* Main Content Area / Message Scroller */}
        <div className="relative flex-1 overflow-hidden bg-[#080808]">
          {isNewChat ? (
            introStage === "blank" ? null : (
              <div className="h-full overflow-y-auto px-4 py-4 md:py-6">
                <motion.div
                  initial={{ opacity: 0, filter: "blur(18px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto flex h-full max-w-[680px] flex-col items-center justify-center pt-10 md:pt-24 pb-12"
                >
                  {/* Centered Greeting: Typography step 3xl at 34px, weight 400, no bold shouting */}
                  <motion.h1
                    initial={{ opacity: 0, filter: "blur(16px)", y: 15 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center text-[28px] md:text-[34px] font-aeonik font-normal text-[#f3f3f3] mb-8 tracking-tight select-none"
                  >
                    السلام عليكم عبدالله
                  </motion.h1>

                  {/* Composer appears with blur once settled */}
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(16px)", y: 15 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full space-y-3.5"
                  >
                    <Composer chatId={activeChat.id} isInitial={true} />
                    <div className="pt-2">
                      <SuggestionRows chatId={activeChat.id} />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            )
          ) : (
            /* Active Chat Thread */
            <MessageScroller className="h-full">
              <MessageScrollerViewport
                aria-label="سجل محادثة التفسير"
                className="px-4 py-4 md:py-6"
              >
                <MessageScrollerContent
                  aria-busy={isBusy}
                  className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-28"
                >
                  {activeChat.messages.map((turn) => {
                    const isUser = turn.role === "user";
                    const isDone = !turn.isSearching;

                    if (isUser) {
                      return (
                        <MessageScrollerItem
                          key={turn.id}
                          messageId={turn.id}
                          scrollAnchor={true}
                        >
                          <UIMessage align="end">
                            <MessageAvatar className="size-8">
                              <Avatar>
                                <AvatarImage
                                  src={VIEWER_AVATAR}
                                  alt="عبدالله"
                                />
                                <AvatarFallback className="bg-[#212121] text-[#f3f3f3]">ع</AvatarFallback>
                              </Avatar>
                            </MessageAvatar>
                            <MessageContent className="items-end">
                              <div className="rounded-[20px] bg-[#101010] border border-[#212121] px-4.5 py-3 text-[#f3f3f3]">
                                <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-aeonik font-normal">
                                  {turn.content}
                                </p>
                              </div>
                            </MessageContent>
                          </UIMessage>
                        </MessageScrollerItem>
                      );
                    }

                    // Assistant Reply
                    return (
                      <MessageScrollerItem
                        key={turn.id}
                        messageId={turn.id}
                        scrollAnchor={false}
                      >
                        <UIMessage align="start">
                          <MessageAvatar className="size-8 rounded-full bg-[#101010] flex items-center justify-center shrink-0 border border-[#212121]">
                            <SparklesIcon aria-hidden="true" className="text-[#6f6759] size-4 stroke-[1.5]" />
                            <span className="sr-only">دِرَايَة</span>
                          </MessageAvatar>

                          <MessageContent>
                            <span role="status" className="sr-only">
                              {isDone ? "الرد جاهز" : "جاري البحث واستدعاء التفسير"}
                            </span>

                            <Bubble variant="ghost" aria-busy={!isDone}>
                              <BubbleContent className="p-0">
                                {turn.isSearching ? (
                                  <Marker>
                                    <MarkerIcon>
                                      <Spinner size="sm" />
                                    </MarkerIcon>
                                    <MarkerContent>
                                      <span className="animate-pulse motion-reduce:animate-none text-[#9c9c9c] text-[13.5px] font-aeonik">
                                        البحث في آيات القرآن وتفاسير المعتمدة...
                                      </span>
                                    </MarkerContent>
                                  </Marker>
                                ) : turn.hasError ? (
                                  <div className="space-y-2 py-1">
                                    <div className="flex items-center gap-2 text-[#f3f3f3] font-aeonik font-normal text-[14px]">
                                      <AlertCircle className="h-4 w-4 text-[#ef4444]" />
                                      <span>تعذر إتمام البحث</span>
                                    </div>
                                    <p className="text-[14px] text-[#9c9c9c] font-aeonik font-normal">
                                      {turn.content || "حدث خطأ أثناء استرجاع نصوص التفسير. يرجى المحاولة مرة أخرى."}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-3.5">
                                    {/* Lead line if available */}
                                    {turn.leadLine && (
                                      <p className="text-[14px] text-[#9c9c9c] font-aeonik font-normal">
                                        {turn.leadLine}
                                      </p>
                                    )}

                                    {/* Verse Card: Obsidian background with Graphite border and Card Slate elevation */}
                                    {turn.ayah && (
                                      <div className="rounded-[8px] bg-[#101010] p-4.5 md:p-5 text-center border border-[#212121] hover:border-[#3b3d45] transition-colors">
                                        <div className="mb-1.5 text-[12px] font-input text-[#9c9c9c]">
                                          {turn.ayah.surah}، الآية {toArabicIndic(turn.ayah.ayahFrom)}
                                        </div>
                                        <div
                                          dir="rtl"
                                          className="font-quran text-[22px] md:text-[25px] font-normal leading-[2.2] text-[#f3f3f3] select-text px-2"
                                        >
                                          {turn.ayah.text}
                                        </div>
                                      </div>
                                    )}

                                    {/* Tabs for Tafsirs */}
                                    {turn.tafsirs && turn.tafsirs.length > 0 ? (
                                      <div className="space-y-3">
                                        <Tabs defaultValue={turn.tafsirs[0]?.bookId || "muyassar"} className="w-full">
                                          <TabsList className="flex flex-wrap gap-1.5 p-1 bg-[#101010] rounded-[99px] mb-3 border border-[#212121]">
                                            {turn.tafsirs.map((entry) => {
                                              const book = books.find((b) => b.id === entry.bookId);
                                              return (
                                                <TabsTrigger
                                                  key={entry.bookId}
                                                  value={entry.bookId}
                                                  className="rounded-[99px] px-3.5 py-1 text-[13px] font-aeonik font-normal text-[#9c9c9c] data-[state=active]:bg-[#212121] data-[state=active]:text-[#f3f3f3] border-0 transition-all"
                                                >
                                                  {book?.name || entry.bookId}
                                                </TabsTrigger>
                                              );
                                            })}
                                          </TabsList>

                                          {turn.tafsirs.map((entry) => {
                                            const book = books.find((b) => b.id === entry.bookId);
                                            return (
                                              <TabsContent key={entry.bookId} value={entry.bookId} className="mt-0">
                                                <div className="text-start">
                                                  <div className="text-[13px] text-[#9c9c9c] mb-2 font-aeonik font-normal">
                                                    {book?.name} • {book?.author}
                                                  </div>
                                                  <div className="text-[15px] md:text-[16px] leading-[2.2] text-[#f3f3f3] font-aeonik font-normal">
                                                    <LineByLineReveal text={entry.text} />
                                                  </div>
                                                </div>
                                              </TabsContent>
                                            );
                                          })}
                                        </Tabs>
                                      </div>
                                    ) : (
                                      <div className="space-y-3 w-full" dir="rtl">
                                        <div className="rounded-[16px] bg-[#101010] border border-[#212121] px-4.5 py-3.5 text-[#f3f3f3]">
                                          <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-aeonik font-normal text-start">
                                            {turn.content || "لم يتم العثور على تفسير مطابق للسؤال في الكتب المحددة."}
                                          </p>
                                          {turn.suggestions && turn.suggestions.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-[#212121]">
                                              <SuggestionRows chatId={activeChat.id} items={turn.suggestions} />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </BubbleContent>
                            </Bubble>

                            {/* MessageFooter with exact Replay button, timestamp, and actions */}
                            <MessageFooter className="gap-2 pt-1 items-center">
                              <span className="tabular-nums text-[#9c9c9c] text-[12px] font-input">
                                {formatMessageTime(turn.createdAt)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => retryMessage(activeChat.id, turn.id)}
                                className="text-[#9c9c9c] hover:text-[#f3f3f3]"
                              >
                                Replay
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleCopyFullMessage(turn)}
                                className="text-[#9c9c9c] hover:text-[#f3f3f3]"
                              >
                                {copiedId === turn.id ? "تم النسخ" : "نسخ"}
                              </Button>
                              {turn.tafsirs && turn.tafsirs.length > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    const firstEntry = turn.tafsirs![0];
                                    const book = books.find((b) => b.id === firstEntry.bookId);
                                    handleSaveTafsir(firstEntry, book, turn.ayah);
                                  }}
                                  className="text-[#9c9c9c] hover:text-[#f3f3f3]"
                                >
                                  حفظ
                                </Button>
                              )}
                            </MessageFooter>
                          </MessageContent>
                        </UIMessage>
                      </MessageScrollerItem>
                    );
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>

              {/* MessageScrollerButton with outline variant as requested */}
              <MessageScrollerButton
                variant="outline"
                className="rounded-full shadow-sm bg-[#101010] border-[#212121] text-[#f3f3f3]"
              />
            </MessageScroller>
          )}
        </div>

        {/* Persistent Composer at bottom in active chat */}
        {!isNewChat && (
          <div className="sticky bottom-0 bg-gradient-to-t from-[#080808] via-[#080808] to-transparent pt-2 pb-4 px-4 z-20">
            <div className="mx-auto max-w-2xl">
              <Composer chatId={activeChat.id} isInitial={false} />
            </div>
          </div>
        )}
      </div>
    </MessageScrollerProvider>
  );
};
