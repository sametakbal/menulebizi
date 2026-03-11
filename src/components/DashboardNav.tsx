"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { TranslationKey } from "@/lib/i18n";

const navItems: { href: string; labelKey: TranslationKey; icon: string }[] = [
    { href: "/dashboard", labelKey: "nav.overview", icon: "dashboard" },
    { href: "/dashboard/menu", labelKey: "nav.menuManagement", icon: "restaurant_menu" },
    { href: "/dashboard/settings", labelKey: "nav.settings", icon: "settings" },
];

export default function DashboardNav() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { t } = useLanguage();

    return (
        <nav className="bg-white border-b border-slate-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl font-bold text-primary">restaurant_menu</span>
                    <span className="text-xl font-black tracking-tight text-primary">menülebizi</span>
                </Link>
                <div className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            <span className="hidden sm:inline">{t(item.labelKey)}</span>
                        </Link>
                    ))}
                    <div className="hidden sm:flex ml-2">
                        <LanguageSwitcher variant="compact" />
                    </div>
                    <button
                        onClick={() => logout()}
                        className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="hidden sm:inline">{t("nav.logout")}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
