"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { MenuLayout } from "@/components/MenuCard";
import { useLanguage } from "@/contexts/LanguageContext";
import MenuPreview from "@/components/MenuPreview";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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

const ACCENT_COLORS = [
    { value: "#e9590c", label: "Orange" },
    { value: "#dc2626", label: "Red" },
    { value: "#e11d48", label: "Rose" },
    { value: "#7c3aed", label: "Purple" },
    { value: "#2563eb", label: "Blue" },
    { value: "#0d9488", label: "Teal" },
    { value: "#16a34a", label: "Green" },
    { value: "#475569", label: "Slate" },
];

const CURRENCIES = ["₺", "$", "€", "£", "₽", "﷼"];

export default function SettingsPage() {
    const { t } = useLanguage();
    const [restaurantId, setRestaurantId] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [menuLayout, setMenuLayout] = useState<MenuLayout>("classic");
    const [accentColor, setAccentColor] = useState("#e9590c");
    const [showPrices, setShowPrices] = useState(true);
    const [currency, setCurrency] = useState("₺");
    const [ordersEnabled, setOrdersEnabled] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
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
                setRestaurantId(data.id || "");
                setName(data.name || "");
                setPhone(data.phone || "");
                setMenuLayout(data.menuLayout || "classic");
                setAccentColor(data.accentColor || "#e9590c");
                setShowPrices(data.showPrices !== false);
                setCurrency(data.currency || "₺");
                setOrdersEnabled(data.ordersEnabled === true);
                setLogoUrl(data.logoUrl || "");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleLogoRemove = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setLogoUrl("");
        if (logoInputRef.current) logoInputRef.current.value = "";
    };

    const handleSave = async () => {
        setSaving(true);
        setUploadingLogo(false);
        setStatus("");
        try {
            let finalLogoUrl = logoUrl;
            if (logoFile && restaurantId) {
                setUploadingLogo(true);
                const ext = logoFile.name.split(".").pop();
                const storageRef = ref(storage, `logos/${restaurantId}/logo.${ext}`);
                if (logoUrl) {
                    try { await deleteObject(ref(storage, logoUrl)); } catch { /* ignore */ }
                }
                await uploadBytes(storageRef, logoFile);
                finalLogoUrl = await getDownloadURL(storageRef);
                setLogoUrl(finalLogoUrl);
                setLogoFile(null);
                setLogoPreview(null);
                setUploadingLogo(false);
            }
            const res = await fetch("/api/restaurant", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, menuLayout, accentColor, showPrices, currency, ordersEnabled, logoUrl: finalLogoUrl }),
            });
            setStatus(res.ok ? "saved" : "error");
        } finally {
            setSaving(false);
            setUploadingLogo(false);
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
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">{t("settings.title")}</h1>
                <p className="text-slate-500 mt-1">{t("settings.subtitle")}</p>
            </div>

            <div className="flex gap-8 items-start">
                {/* Settings column */}
                <div className="space-y-8 flex-1 min-w-0 max-w-2xl">

                    {/* Restaurant Info */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="material-symbols-outlined text-primary">storefront</span>
                            <h2 className="text-lg font-bold text-slate-900">{t("settings.restaurantInfoTitle")}</h2>
                        </div>
                        <div className="space-y-4">
                            {/* Logo upload */}
                            <div>
                                <p className="block text-sm font-semibold text-slate-700 mb-1.5">{t("settings.logoTitle")}</p>
                                <p className="text-xs text-slate-500 mb-3">{t("settings.logoDesc")}</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                                        {(logoPreview || logoUrl) ? (
                                            <Image
                                                src={logoPreview || logoUrl}
                                                alt="logo"
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">upload</span>
                                            {t("settings.logoUpload")}
                                        </button>
                                        {(logoPreview || logoUrl) && (
                                            <button
                                                type="button"
                                                onClick={handleLogoRemove}
                                                className="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-red-100 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                                {t("settings.logoRemove")}
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />
                                </div>
                            </div>
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
                                    className={`relative p-3 rounded-xl border-2 text-left transition-all ${menuLayout === value
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

                    {/* Accent Color */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary">palette</span>
                            <h2 className="text-lg font-bold text-slate-900">{t("settings.accentColorTitle")}</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{t("settings.accentColorDesc")}</p>
                        <div className="flex gap-3 flex-wrap">
                            {ACCENT_COLORS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    title={label}
                                    onClick={() => setAccentColor(value)}
                                    className={`w-9 h-9 rounded-full transition-all ${accentColor === value
                                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                                        : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: value }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                <div>
                                    <p className="font-bold text-slate-900">{t("settings.ordersTitle")}</p>
                                    <p className="text-sm text-slate-500">{t("settings.ordersDesc")}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOrdersEnabled((p) => !p)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${ordersEnabled ? "bg-primary" : "bg-slate-200"}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ordersEnabled ? "translate-x-6" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* Show Prices & Currency */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                <div>
                                    <p className="font-bold text-slate-900">{t("settings.showPricesTitle")}</p>
                                    <p className="text-sm text-slate-500">{t("settings.showPricesDesc")}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPrices((p) => !p)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${showPrices ? "bg-primary" : "bg-slate-200"}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showPrices ? "translate-x-6" : ""}`} />
                            </button>
                        </div>
                        <div className="border-t border-slate-100 pt-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary">currency_exchange</span>
                                <div>
                                    <p className="font-bold text-slate-900">{t("settings.currencyTitle")}</p>
                                    <p className="text-sm text-slate-500">{t("settings.currencyDesc")}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setCurrency(c)}
                                        className={`w-12 h-10 rounded-xl text-sm font-bold border-2 transition-all ${currency === c
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${status === "error" ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
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
                            disabled={saving || uploadingLogo}
                            className="flex items-center gap-2 px-6 h-12 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 shadow-sm shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-lg">save</span>
                            {(() => {
                                if (uploadingLogo) return t("menu.uploading");
                                if (saving) return t("settings.saving");
                                return t("settings.save");
                            })()}
                        </button>
                    </div>
                </div>

                {/* Preview column */}
                <div className="hidden lg:block sticky top-8 shrink-0">
                    <MenuPreview
                        restaurantName={name}
                        layout={menuLayout}
                        accentColor={accentColor}
                        showPrices={showPrices}
                        currency={currency}
                    />
                </div>
            </div>
        </div>
    );
}
