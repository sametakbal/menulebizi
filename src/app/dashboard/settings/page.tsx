"use client";

import { useState, useEffect } from "react";
import type { MenuLayout } from "@/components/MenuCard";

const LAYOUTS: { value: MenuLayout; label: string; description: string; preview: React.ReactNode }[] = [
    {
        value: "classic",
        label: "Klasik Liste",
        description: "Küçük resim + bilgi",
        preview: (
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
    },
    {
        value: "visual",
        label: "Görsel Odaklı",
        description: "2 sütun, büyük resim",
        preview: (
            <div className="aspect-4/3 rounded-lg bg-slate-100 mb-3 grid grid-cols-2 gap-1 p-1.5 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-300 rounded flex flex-col justify-end p-1">
                        <div className="h-1 w-3/4 bg-slate-400 rounded mb-0.5"></div>
                        <div className="h-1 w-1/2 bg-primary/50 rounded"></div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        value: "compact",
        label: "Kompakt",
        description: "Sade, hızlı liste",
        preview: (
            <div className="aspect-4/3 rounded-lg bg-slate-100 mb-3 flex flex-col p-2 gap-1.5 overflow-hidden justify-center">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-200 pb-1">
                        <div className="h-1 w-2/3 bg-slate-300 rounded"></div>
                        <div className="h-1 w-6 bg-primary/40 rounded"></div>
                    </div>
                ))}
            </div>
        ),
    },
];

export default function SettingsPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [menuLayout, setMenuLayout] = useState<MenuLayout>("classic");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

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
        setMessage("");
        try {
            const res = await fetch("/api/restaurant", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, menuLayout }),
            });
            if (res.ok) {
                setMessage("Ayarlar kaydedildi!");
            } else {
                setMessage("Bir hata oluştu.");
            }
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
                <h1 className="text-2xl font-black text-slate-900">Ayarlar</h1>
                <p className="text-slate-500 mt-1">Restoran bilgilerinizi ve menü görünümünü düzenleyin.</p>
            </div>

            {/* Restaurant Info */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-primary">storefront</span>
                    <h2 className="text-lg font-bold text-slate-900">Restoran Bilgileri</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="restaurant-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Restoran Adı
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
                            Telefon
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                            <input
                                id="restaurant-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0555 555 55 55"
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
                    <h2 className="text-lg font-bold text-slate-900">Menü Düzeni</h2>
                </div>
                <p className="text-sm text-slate-500 mb-4">Müşterilerinizin menünüzü nasıl göreceğini seçin.</p>
                <div className="grid grid-cols-3 gap-3">
                    {LAYOUTS.map(({ value, label, description, preview }) => (
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
                            {preview}
                            <p className="text-sm font-bold text-slate-900">{label}</p>
                            <p className="text-xs text-slate-500">{description}</p>
                            {menuLayout === value && (
                                <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-base">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                    message.includes("hata") ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                }`}>
                    <span className="material-symbols-outlined text-lg">
                        {message.includes("hata") ? "error" : "check_circle"}
                    </span>
                    {message}
                </div>
            )}

            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    {" "}Kaydettikten sonra menünüze anında yansır.
                </p>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 h-12 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 shadow-sm shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-lg">save</span>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>
        </div>
    );
}
