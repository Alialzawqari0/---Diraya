import * as React from "react";
import { cn } from "@/src/lib/utils";
import { PanelRight } from "lucide-react";
import { useApp } from "@/src/context/AppContext";
import { motion, AnimatePresence } from "motion/react";

interface SidebarContextType {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ className, style, children, ...props }, ref) => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
  } = useApp();

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const state = isSidebarOpen ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextType>(
    () => ({
      state,
      open: isSidebarOpen,
      setOpen: setIsSidebarOpen,
      openMobile: isMobileSidebarOpen,
      setOpenMobile: setIsMobileSidebarOpen,
      isMobile,
      toggleSidebar,
    }),
    [state, isSidebarOpen, setIsSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen, isMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        dir="rtl"
        className={cn(
          "group/sidebar-wrapper flex min-h-screen w-full bg-parchment text-ink",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"aside"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(
  (
    {
      side = "right",
      variant = "inset",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (isMobile) {
      return (
        <AnimatePresence>
          {openMobile && (
            <div className="fixed inset-0 z-50 flex">
              {/* Backdrop: warm-mist 40% */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="fixed inset-0 bg-warm-mist/40"
                onClick={() => setOpenMobile(false)}
              />
              {/* Slide-in Sheet from Right in RTL */}
              <motion.aside
                dir="rtl"
                initial={{ x: "100%", opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={cn(
                  "relative z-50 ms-auto flex h-full w-sidebar flex-col bg-parchment text-ink border-s border-warm-mist shadow-subtle overflow-hidden",
                  className
                )}
              >
                {children}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      );
    }

    return (
      <AnimatePresence initial={false}>
        {state === "expanded" && (
          <motion.aside
            key="sidebar-desktop"
            dir="rtl"
            data-side={side}
            data-state={state}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "256px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "relative hidden md:flex h-screen shrink-0 flex-col bg-parchment text-ink border-s border-warm-mist select-none overflow-hidden",
              className
            )}
          >
            <div className="flex h-full w-sidebar shrink-0 flex-col">
              {children}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }
);
Sidebar.displayName = "Sidebar";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile, setOpenMobile, openMobile, state } = useSidebar();

  return (
    <button
      ref={ref}
      type="button"
      onClick={(event) => {
        if (isMobile) {
          setOpenMobile(!openMobile);
        } else {
          toggleSidebar();
        }
        onClick?.(event);
      }}
      className={cn(
        "inline-flex size-32 items-center justify-center rounded-md text-graphite hover:bg-warm-mist/35 transition-colors focus-visible:outline-none",
        className
      )}
      aria-label="تبديل الشريط الجانبي"
      title={state === "expanded" ? "إخفاء القائمة الجانبية (Ctrl+B)" : "إظهار القائمة الجانبية (Ctrl+B)"}
      {...props}
    >
      <PanelRight className="size-16 stroke-[1.5] rtl:rotate-180" />
      <span className="sr-only">تبديل الشريط الجانبي</span>
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      ref={ref}
      onClick={toggleSidebar}
      tabIndex={-1}
      aria-label="شريط سحب القائمة"
      className={cn(
        "absolute inset-y-0 -start-1 w-4 cursor-col-resize hover:bg-warm-mist/35 transition-colors hidden md:block",
        className
      )}
      {...props}
    />
  );
});
SidebarRail.displayName = "SidebarRail";

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-screen flex-1 flex-col overflow-y-auto bg-parchment",
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between py-12 px-16", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto flex flex-col border-t border-warm-mist p-12", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col gap-8 overflow-y-auto overflow-x-hidden px-12 py-8", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex w-full min-w-0 flex-col gap-4", className)}
    {...props}
  />
));
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-32 w-full items-center justify-between px-12 text-body-sm font-medium text-graphite select-none",
      className
    )}
    {...props}
  />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex size-24 items-center justify-center rounded-md text-graphite hover:bg-warm-mist/35 transition-colors focus-visible:outline-none",
      className
    )}
    {...props}
  />
));
SidebarGroupAction.displayName = "SidebarGroupAction";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex w-full min-w-0 flex-col gap-4 list-none m-0 p-0", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("group/menu-item relative flex items-center w-full min-w-0", className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    isActive?: boolean;
  }
>(({ className, isActive, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex h-36 w-full items-center gap-8 rounded-md py-8 px-12 text-start text-body font-normal text-ink transition-colors hover:bg-warm-mist/35 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      isActive && "bg-warm-mist/45 font-medium text-ink",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "ms-auto flex items-center justify-center text-caption font-normal text-graphite",
      className
    )}
    {...props}
  />
));
SidebarMenuBadge.displayName = "SidebarMenuBadge";

export const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "absolute end-8 flex size-24 items-center justify-center rounded-md text-graphite opacity-0 group-hover/menu-item:opacity-100 focus:opacity-100 hover:bg-warm-mist/35 transition-opacity",
      className
    )}
    {...props}
  />
));
SidebarMenuAction.displayName = "SidebarMenuAction";

export const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-36 w-full items-center gap-8 rounded-md px-12 animate-pulse", className)}
    {...props}
  >
    <div className="size-16 rounded-full bg-warm-mist/45" />
    <div className="h-16 flex-1 rounded-md bg-warm-mist/45" />
  </div>
));
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
