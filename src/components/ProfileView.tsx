import React, { useState } from "react";
import { User, Check, Download, Trash2, BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export const ProfileView: React.FC = () => {
  const { user, updateUser, books } = useApp();
  const { state: sidebarState } = useSidebar();

  const [name, setName] = useState(user.name);
  const [preferredBooks, setPreferredBooks] = useState<string[]>(user.preferredBookIds);
  const [theme, setTheme] = useState(user.theme);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim() || user.name,
      preferredBookIds: preferredBooks,
      theme,
    });
    toast.success("تم حفظ إعدادات الملف الشخصي بنجاح");
  };

  const handleThemeChange = (newTheme: 'light' | 'system' | 'dark') => {
    setTheme(newTheme);
    updateUser({ theme: newTheme });
    toast.success(`تم تفعيل المظهر ${newTheme === 'dark' ? 'الداكن' : newTheme === 'light' ? 'الفاتح' : 'التلقائي'}`);
  };

  const toggleBook = (bookId: string) => {
    setPreferredBooks((prev) => {
      if (prev.includes(bookId)) {
        if (prev.length === 1) {
          toast.error("يجب اختيار تفسير واحد على الأقل");
          return prev;
        }
        return prev.filter((id) => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  return (
    <div className="flex h-full flex-col bg-[#101010] text-[#f3f3f3]">
      {/* Top Header */}
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
            <User className="h-4 w-4 text-[#6f6759]" strokeWidth={1.5} />
            <h1 className="text-[15px] font-aeonik font-normal text-[#f3f3f3]">
              الملف الشخصي والإعدادات
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[640px] space-y-8">
          {/* User Header Card */}
          <div className="flex items-center gap-4 rounded-[8px] bg-[#080808] p-5 border border-[#212121]">
            <Avatar name={user.name} className="h-14 w-14 text-[20px] bg-[#212121] text-[#f3f3f3]" />
            <div>
              <h2 className="text-[17px] font-aeonik font-normal text-[#f3f3f3]">{user.name}</h2>
              <div className="text-[12px] font-input text-[#9c9c9c]">{user.email}</div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Name field */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-aeonik text-[#9c9c9c]">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[8px] bg-[#080808] border border-[#212121] px-4 py-2.5 text-[14px] font-aeonik text-[#f3f3f3] focus:outline-none focus:border-[#474747]"
              />
            </div>

            {/* Email field (Read-only) */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-aeonik text-[#9c9c9c]">
                البريد الإلكتروني (للقراءة فقط)
              </label>
              <input
                type="email"
                readOnly
                disabled
                value={user.email}
                className="w-full rounded-[8px] bg-[#101010] border border-[#212121] px-4 py-2.5 text-[14px] font-input text-[#9c9c9c] cursor-not-allowed opacity-70"
              />
            </div>

            {/* Preferred Tafsir Books */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#6f6759]" strokeWidth={1.5} />
                <label className="text-[13px] font-aeonik text-[#f3f3f3]">
                  التفاسير المفضلة افتراضياً في البحث
                </label>
              </div>
              <div className="rounded-[8px] bg-[#080808] border border-[#212121] p-2 space-y-1">
                {books.map((book) => {
                  const checked = preferredBooks.includes(book.id);
                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => toggleBook(book.id)}
                      className="flex w-full items-center justify-between p-3 rounded-[4.5px] text-start hover:bg-[#212121] transition-colors"
                    >
                      <div>
                        <div className="text-[14px] font-aeonik font-normal text-[#f3f3f3]">
                          {book.name}
                        </div>
                        <div className="text-[12px] font-input text-[#9c9c9c]">
                          {book.author}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4.5px] border transition-colors",
                          checked
                            ? "bg-[#f3f3f3] text-[#101010] border-[#f3f3f3]"
                            : "bg-transparent border-[#474747]"
                        )}
                      >
                        {checked && <Check className="h-3 w-3 stroke-[2.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-[13px] font-aeonik text-[#9c9c9c]">
                المظهر
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "light", label: "فاتح" },
                  { id: "system", label: "تلقائي" },
                  { id: "dark", label: "داكن" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleThemeChange(item.id as any)}
                    className={cn(
                      "rounded-[8px] py-2.5 text-[13px] font-aeonik transition-colors border",
                      user.theme === item.id
                        ? "bg-[#212121] text-[#ffffff] border-[#474747]"
                        : "bg-[#080808] text-[#9c9c9c] border-[#212121] hover:text-[#f3f3f3] hover:bg-[#101010]"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 rounded-[8px] bg-[#ffffff] text-[#101010] hover:bg-[#f3f3f3] font-aeonik font-normal"
              >
                حفظ التغييرات
              </Button>
            </div>
          </form>

          {/* Account and Data Actions */}
          <div className="pt-6 space-y-4 border-t border-[#212121]">
            <h3 className="text-[14px] font-aeonik font-normal text-[#f3f3f3]">
              إدارة البيانات والحساب
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.success("بياناتك محفوظة محلياً ومتزامنة مع المكتبة الرقمية")}
                className="flex-1 gap-2 text-[13px] rounded-[8px] border-[#212121] bg-[#080808] text-[#f3f3f3] hover:bg-[#212121] font-aeonik font-normal"
              >
                <Download className="h-4 w-4 text-[#9c9c9c]" strokeWidth={1.5} />
                <span>تصدير بياناتي</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => toast("تسجيل الخروج غير متاح في النموذج التجريبي")}
                className="flex-1 gap-2 text-[13px] rounded-[8px] border-[#212121] bg-[#080808] text-[#9c9c9c] hover:text-[#ef4444] hover:bg-[#212121] font-aeonik font-normal"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                <span>إعادة ضبط البيانات</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
