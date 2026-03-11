"use client";

import { useState, useEffect } from "react";
import type { MenuLayout } from "@/components/MenuCard";
import { useLanguage } from "@/contexts/LanguageContext";

const LAYOUT_PREVIEWS: Record<MenuLayout, React.ReactNode> = {
    classic: (
        <div className="aspect-4/3 rounded-lg bg-slate-100 mb-3 flex flex-col p-2 gap-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-1.5 items-center">
                    <div className="w-5 h-5 bg-slate-300 rounded shrink-0"></div>
                    <div className="flex-1 space-y-0.5">
                        <div className="h-1.5 w-3/4 bg-slate-300 rounded"></div>
                        <div className="h-1 w-1/2 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-1.5 w-5 bg-primary/40 rounded shrink-0"></div>
                </div>
            ))}
        </div>
    ),
    visual: (
        <div className="aspect-4/3 rounded-lg bg-slate-100 mb-3 grid grid-cols-2 gap-1 p-1.5 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-300 rounded flex flex-col justify-end p-1">
                    <div className="h-1 w-3/4 bg-slate-400 rounded mb-0.5"></div>
                    <div className="h-1 w-1/2 bg-primary/50 rounded"></div>
                </div>
            ))}
        </div>
    ),
    compact: (
        <div className="aspect-4/3 rounded-lg bg-slate-100 mb-3 flex flex-col p-2 gap-1.5 overflow-hidden justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <div className="h-1 w-2/3 bg-slate-300 rounded"></div>
                    <div className="h-1 w-6 bg-primary/40 rounded"></div>
                </div>
            ))}
        </div>
    ),
};

const LAYOUT_VALUES: MenuLayout[] = ["classic", "visual", "compact"];

export default function SettingsPage() {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [menuLayout, setMenuLayout] = useState<MenuLayout>("classic");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"" | "saved" | "error">("");

    const LAYOUT_LABELS: Record<MenuLayout, string> = {
        classic: t("settings.layoutClassic"),
        visual: t("settings.layoutVisual"),
        compact: t("settings.layoutCompact"),
    };

    const LAYOUT_DESCS: Record<MenuLayout, string> = {
        classic: t("settings.layoutClassicDesc"),
        visual: t("settings.layoutVisualDesc"),
        compact: t("settings.layoutCompactDesc"),
    };

    useEffect(() => {
        fetch("/api/restaurant")
            .then((res) => res.json())
            .then((data) => {
                setName(data.name || "");
                setPhone(data.phone || "");
                setMenuLayout(data.menuLayout || "classic");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus("");
        try {
            const res = await fetch("/api/restaurant", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, menuLayout }),
            });
            setStatus(res.ok ? "saved" : "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-black text-slate-900">{t("settings.title")}</h1>
                <p className="text-slate-500 mt-1">{t("settings.subtitle")}</p>
            </div>

            {/* Restaurant Info */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-primary">storefront</span>
                    <h2 className="text-lg font-bold text-slate-900">{t("settings.restaurantInfoTitle")}</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="restaurant-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            {t("settings.restaurantName")}
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">storefront</span>
                            <input
                                id="restaurant-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="restaurant-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            {t("settings.phone")}
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                            <input
                                id="restaurant-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t("settings.phonePlaceholder")}
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Selection */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-primary">dashboard</span>
                    <h2 className="text-lg font-bold text-slate-900">{t("settings.menuLayoutTitle")}</h2>
                </div>
                <p className="text-sm text-slate-500 mb-4">{t("settings.menuLayoutDesc")}</p>
                <div className="grid grid-cols-3 gap-3">
                    {LAYOUT_VALUES.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setMenuLayout(value)}
                            className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                                menuLayout === value
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            {LAYOUT_PREVIEWS[value]}
                            <p className="text-sm font-bold text-slate-900">{LAYOUT_LABELS[value]}</p>
                            <p className="text-xs text-slate-500">{LAYOUT_DESCS[value]}</p>
                            {menuLayout === value && (
                                <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-base">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {status && (
                <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                    status === "error" ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                }`}>
                    <span className="material-symbols-outlined text-lg">
                        {status === "error" ? "error" : "check_circle"}
                    </span>
                    {t(`settings.${status}`)}
                </div>
            )}

            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    {" "}{t("settings.saveNote")}
                </p>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 h-12 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 shadow-sm shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-lg">save</span>
                    {saving ? t("settings.saving") : t("settings.save")}
                </button>
            </div>
        </div>
    );
}
