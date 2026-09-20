import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chat, Message, Project, SavedSource, TafsirBook, UserProfile } from '../types';
import { INITIAL_CHATS, INITIAL_PROJECTS, INITIAL_SAVED_SOURCES, MOCK_AYAHS, MOCK_USER, TAFSIR_BOOKS } from '../data/mockData';
import { toast } from 'sonner';
import { MessageIntent, MESSAGES, SUGGESTIONS } from '../messages';
import { classifyQueryLocally } from '../lib/queryRouter';

export type CurrentView = 
  | { type: 'chat'; chatId: string }
  | { type: 'project'; projectId: string }
  | { type: 'profile' }
  | { type: 'saved_sources' }
  | { type: 'styleguide' };

interface AppContextType {
  // Navigation & View
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // Search dialog
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // New project dialog
  isNewProjectOpen: boolean;
  setIsNewProjectOpen: (open: boolean) => void;

  // State
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  books: TafsirBook[];
  selectedBookIds: string[];
  setSelectedBookIds: (ids: string[]) => void;
  toggleBookSelection: (bookId: string) => void;

  projects: Project[];
  chats: Chat[];
  savedSources: SavedSource[];

  // Actions
  createNewChat: (projectId?: string) => string;
  selectChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => void;
  moveChatToProject: (chatId: string, projectId?: string) => void;
  deleteChat: (chatId: string) => void;

  createProject: (name: string, description: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  saveSource: (item: {
    projectId: string;
    ayahRef: string;
    surah: string;
    ayahText: string;
    ayahNumberText: string;
    bookId: string;
    bookName: string;
    author: string;
    text: string;
  }) => void;
  unsaveSource: (projectId: string, ayahRef: string, bookId: string) => void;
  isSourceSaved: (projectId: string, ayahRef: string, bookId: string) => boolean;

  // Retry message
  retryMessage: (chatId: string, messageId: string) => void;

  // Theme toggle
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<CurrentView>(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/styleguide' || window.location.hash === '#styleguide')) {
      return { type: 'styleguide' };
    }
    return { type: 'chat', chatId: 'chat-today-1' };
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const [user, setUser] = useState<UserProfile>(() => {
    return {
      ...MOCK_USER,
      theme: 'light',
    };
  });
  const [books] = useState<TafsirBook[]>(TAFSIR_BOOKS);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(['muyassar', 'saadi', 'katheer', 'baghawy', 'ma3any']);

  // Theme synchronization with document.documentElement (dark class and data-theme)
  useEffect(() => {
    const isDark =
      user.theme === 'dark' ||
      (user.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('dirayah_user_theme', user.theme);
  }, [user.theme]);

  const toggleTheme = () => {
    setUser((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [savedSources, setSavedSources] = useState<SavedSource[]>(INITIAL_SAVED_SOURCES);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBookIds((prev) => {
      if (prev.includes(bookId)) {
        if (prev.length === 1) {
          toast.error('يجب اختيار تفسير واحد على الأقل للبحث');
          return prev;
        }
        return prev.filter((id) => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  const createNewChat = (projectId?: string): string => {
    const newId = 'chat-' + Date.now();
    const newChat: Chat = {
      id: newId,
      title: 'محادثة جديدة',
      projectId,
      createdAt: new Date().toISOString(),
      messages: [],
      selectedBookIds: [...selectedBookIds],
    };

    setChats((prev) => [newChat, ...prev]);
    setCurrentView({ type: 'chat', chatId: newId });
    setIsMobileSidebarOpen(false);
    return newId;
  };

  const selectChat = (chatId: string) => {
    setCurrentView({ type: 'chat', chatId });
    setIsMobileSidebarOpen(false);
  };

  const renameChat = (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: newTitle.trim() } : c))
    );
    toast.success('تمت إعادة تسمية المحادثة');
  };

  const moveChatToProject = (chatId: string, projectId?: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, projectId } : c))
    );
    const targetProject = projects.find((p) => p.id === projectId);
    toast.success(targetProject ? `نُقلت المحادثة إلى: ${targetProject.name}` : 'أُزيلت المحادثة من المشروع');
  };

  const deleteChat = (chatId: string) => {
    const chatToDelete = chats.find((c) => c.id === chatId);
    if (!chatToDelete) return;

    // Delete chat immediately
    setChats((prev) => prev.filter((c) => c.id !== chatId));

    // If currently viewing deleted chat, switch to another or create new
    if (currentView.type === 'chat' && currentView.chatId === chatId) {
      const remaining = chats.filter((c) => c.id !== chatId);
      if (remaining.length > 0) {
        setCurrentView({ type: 'chat', chatId: remaining[0].id });
      } else {
        createNewChat();
      }
    }

    // Show undo toast without confirmation dialog as required
    toast('حُذفت المحادثة', {
      action: {
        label: 'تراجع',
        onClick: () => {
          setChats((prev) => [chatToDelete, ...prev]);
          setCurrentView({ type: 'chat', chatId });
          toast.success('تم استرجاع المحادثة');
        },
      },
      duration: 5000,
    });
  };

  const createProject = (name: string, description: string): string => {
    const newId = 'proj-' + Date.now();
    const newProject: Project = {
      id: newId,
      name: name.trim() || 'مشروع جديد',
      description: description.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      notes: '',
    };
    setProjects((prev) => [newProject, ...prev]);
    setIsNewProjectOpen(false);
    setCurrentView({ type: 'project', projectId: newId });
    setIsMobileSidebarOpen(false);
    toast.success('تم إنشاء المشروع بنجاح');
    return newId;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Unassign chats
    setChats((prev) =>
      prev.map((c) => (c.projectId === id ? { ...c, projectId: undefined } : c))
    );
    // Remove saved sources for this project
    setSavedSources((prev) => prev.filter((s) => s.projectId !== id));

    if (currentView.type === 'project' && currentView.projectId === id) {
      if (chats.length > 0) {
        setCurrentView({ type: 'chat', chatId: chats[0].id });
      } else {
        createNewChat();
      }
    }
    toast.success(`تم حذف مشروع "${proj?.name || ''}"`);
  };

  const saveSource = (item: {
    projectId: string;
    ayahRef: string;
    surah: string;
    ayahText: string;
    ayahNumberText: string;
    bookId: string;
    bookName: string;
    author: string;
    text: string;
  }) => {
    const exists = savedSources.some(
      (s) => s.projectId === item.projectId && s.ayahRef === item.ayahRef && s.bookId === item.bookId
    );
    if (exists) return;

    const newSource: SavedSource = {
      id: 'save-' + Date.now(),
      ...item,
      savedAt: new Date().toISOString().split('T')[0],
    };
    setSavedSources((prev) => [newSource, ...prev]);
    const proj = projects.find((p) => p.id === item.projectId);
    toast.success(`تم الحفظ في مشروع: ${proj?.name || 'المشروع'}`);
  };

  const unsaveSource = (projectId: string, ayahRef: string, bookId: string) => {
    setSavedSources((prev) =>
      prev.filter(
        (s) => !(s.projectId === projectId && s.ayahRef === ayahRef && s.bookId === bookId)
      )
    );
    toast('تمت إزالة المصدر من المحفوظات');
  };

  const isSourceSaved = (projectId: string, ayahRef: string, bookId: string) => {
    return savedSources.some(
      (s) => s.projectId === projectId && s.ayahRef === ayahRef && s.bookId === bookId
    );
  };

  const sendMessage = async (chatId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: 'm-' + Date.now(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    // Update chat title if it's the first message or titled "محادثة جديدة"
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const newTitle = c.messages.length === 0 || c.title === 'محادثة جديدة' 
            ? (trimmed.length > 40 ? trimmed.substring(0, 40) + '…' : trimmed)
            : c.title;
          return {
            ...c,
            title: newTitle,
            messages: [...c.messages, userMessage],
          };
        }
        return c;
      })
    );

    // Assistant loading state message
    const botMsgId = 'm-' + (Date.now() + 1);
    const loadingMessage: Message = {
      id: botMsgId,
      role: 'assistant',
      isSearching: true,
      createdAt: new Date().toISOString(),
    };

    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, loadingMessage] } : c))
    );

    try {
      const startTime = Date.now();

      // Query backend with Google Search Grounding
      const response = await fetch('/api/search-tafsir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: trimmed,
          selectedBookIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في الخادم (${response.status})`);
      }

      const data = await response.json();

      // Moderate delay for search to allow search thinking marker transition
      const elapsed = Date.now() - startTime;
      const targetDelay = data.intent === 'search' ? 2400 : 600;
      if (elapsed < targetDelay) {
        await new Promise((resolve) => setTimeout(resolve, targetDelay - elapsed));
      }

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const updatedMessages: Message[] = c.messages.map((m) => {
              if (m.id === botMsgId) {
                if (data.intent && data.intent !== 'search') {
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: data.intent as MessageIntent,
                    content: data.content,
                    suggestions: data.suggestions || [],
                    ayah: undefined,
                    tafsirs: undefined,
                  };
                }
                return {
                  ...m,
                  isSearching: false,
                  hasError: false,
                  intent: 'search' as MessageIntent,
                  ayah: data.ayah,
                  leadLine: data.leadLine,
                  tafsirs: data.tafsirs,
                  groundingSources: data.groundingSources,
                  searchQueries: data.searchQueries,
                };
              }
              return m;
            });
            return { ...c, messages: updatedMessages };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error fetching search tafsir:', error);
      // Offline / network fallback with local classifier
      const localClassification = classifyQueryLocally(trimmed);
      const lower = trimmed.toLowerCase();
      let fallbackKey: 'kursi' | 'sabr' | 'fatiha' | null = null;
      if (lower.includes('كرسي') || lower.includes('الكرسي') || lower.includes('255') || lower.includes('٢٥٥')) {
        fallbackKey = 'kursi';
      } else if (lower.includes('صبر') || lower.includes('الصبر') || lower.includes('153') || lower.includes('١٥٣')) {
        fallbackKey = 'sabr';
      } else if (lower.includes('فاتحة') || lower.includes('الفاتحة') || lower.includes('الحمد')) {
        fallbackKey = 'fatiha';
      }

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const updatedMessages: Message[] = c.messages.map((m) => {
              if (m.id === botMsgId) {
                if (localClassification.intent === 'out_of_scope') {
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: 'out_of_scope' as MessageIntent,
                    content: MESSAGES.OUT_OF_SCOPE,
                    suggestions: [...SUGGESTIONS],
                  };
                }
                if (localClassification.intent === 'ruling_request') {
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: 'ruling_request' as MessageIntent,
                    content: MESSAGES.RULING_REQUEST,
                    suggestions: [],
                  };
                }
                if (localClassification.intent === 'about_app') {
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: 'about_app' as MessageIntent,
                    content: MESSAGES.ABOUT_APP,
                    suggestions: [...SUGGESTIONS],
                  };
                }
                if (localClassification.intent === 'distress') {
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: 'distress' as MessageIntent,
                    content: MESSAGES.DISTRESS,
                    suggestions: [],
                  };
                }
                if (localClassification.intent === 'no_result') {
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: 'no_result' as MessageIntent,
                    content: MESSAGES.NO_RESULT,
                    suggestions: [...SUGGESTIONS],
                  };
                }
                if (fallbackKey && MOCK_AYAHS[fallbackKey]) {
                  const match = MOCK_AYAHS[fallbackKey];
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: 'search' as MessageIntent,
                    ayah: match.ayah,
                    leadLine: match.leadLine,
                    tafsirs: match.tafsirs.filter((t) => selectedBookIds.includes(t.bookId)),
                  };
                }
                return {
                  ...m,
                  isSearching: false,
                  hasError: false,
                  intent: 'no_result' as MessageIntent,
                  content: MESSAGES.NO_RESULT,
                  suggestions: [...SUGGESTIONS],
                };
              }
              return m;
            });
            return { ...c, messages: updatedMessages };
          }
          return c;
        })
      );
    }
  };

  const retryMessage = async (chatId: string, messageId: string) => {
    // Find preceding user message
    const chat = chats.find((c) => c.id === chatId);
    const msgIndex = chat?.messages.findIndex((m) => m.id === messageId) ?? -1;
    const prevUserMsg = msgIndex > 0 ? chat?.messages[msgIndex - 1] : null;
    const queryText = prevUserMsg?.content || 'آية الكرسي';

    // Set searching state
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const msgs = c.messages.map((m) => {
            if (m.id === messageId) {
              return {
                ...m,
                hasError: false,
                isSearching: true,
              };
            }
            return m;
          });
          return { ...c, messages: msgs };
        }
        return c;
      })
    );

    try {
      const startTime = Date.now();
      const response = await fetch('/api/search-tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, selectedBookIds }),
      });
      const data = await response.json();

      const elapsed = Date.now() - startTime;
      const targetDelay = data.intent === 'search' ? 2400 : 600;
      if (elapsed < targetDelay) {
        await new Promise((resolve) => setTimeout(resolve, targetDelay - elapsed));
      }

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const msgs: Message[] = c.messages.map((m) => {
              if (m.id === messageId) {
                if (data.intent && data.intent !== 'search') {
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: data.intent as MessageIntent,
                    content: data.content,
                    suggestions: data.suggestions || [],
                    ayah: undefined,
                    tafsirs: undefined,
                  };
                }
                return {
                  ...m,
                  isSearching: false,
                  hasError: false,
                  intent: 'search' as MessageIntent,
                  ayah: data.ayah,
                  leadLine: data.leadLine,
                  tafsirs: data.tafsirs,
                  groundingSources: data.groundingSources,
                  searchQueries: data.searchQueries,
                };
              }
              return m;
            });
            return { ...c, messages: msgs };
          }
          return c;
        })
      );
    } catch {
      const localClassification = classifyQueryLocally(queryText);
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const msgs: Message[] = c.messages.map((m) => {
              if (m.id === messageId) {
                if (localClassification.intent && localClassification.intent !== 'search') {
                  const intentKey = localClassification.intent.toUpperCase() as keyof typeof MESSAGES;
                  return {
                    ...m,
                    isSearching: false,
                    hasError: false,
                    intent: localClassification.intent as MessageIntent,
                    content: MESSAGES[intentKey],
                    suggestions: ['out_of_scope', 'no_result', 'about_app'].includes(localClassification.intent)
                      ? [...SUGGESTIONS]
                      : [],
                  };
                }
                const match = MOCK_AYAHS.kursi;
                return {
                  ...m,
                  isSearching: false,
                  hasError: false,
                  intent: 'search' as MessageIntent,
                  ayah: match.ayah,
                  leadLine: match.leadLine,
                  tafsirs: match.tafsirs.filter((t) => selectedBookIds.includes(t.bookId)),
                };
              }
              return m;
            });
            return { ...c, messages: msgs };
          }
          return c;
        })
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isSidebarOpen,
        setIsSidebarOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleSidebar,
        isSearchOpen,
        setIsSearchOpen,
        isNewProjectOpen,
        setIsNewProjectOpen,
        user,
        updateUser,
        books,
        selectedBookIds,
        setSelectedBookIds,
        toggleBookSelection,
        projects,
        chats,
        savedSources,
        createNewChat,
        selectChat,
        sendMessage,
        renameChat,
        moveChatToProject,
        deleteChat,
        createProject,
        updateProject,
        deleteProject,
        saveSource,
        unsaveSource,
        isSourceSaved,
        retryMessage,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
