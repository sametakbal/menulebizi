"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
    { href: "/dashboard", label: "Genel Bakış", icon: "dashboard" },
    { href: "/dashboard/menu", label: "Menü Yönetimi", icon: "restaurant_menu" },
    { href: "/dashboard/settings", label: "Ayarlar", icon: "settings" },
];

export default function DashboardNav() {
    const pathname = usePathname();
    const { logout } = useAuth();

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
                            <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={() => logout()}
                        className="ml-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="hidden sm:inline">Çıkış</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
