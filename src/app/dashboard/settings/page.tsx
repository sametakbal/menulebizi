"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/restaurant")
            .then((res) => res.json())
            .then((data) => {
                setName(data.name || "");
                setPhone(data.phone || "");
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
                body: JSON.stringify({ name, phone }),
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
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900">Ayarlar</h1>
                <p className="text-slate-500 mt-1">Restoran bilgilerinizi güncelleyin.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-8 max-w-lg shadow-sm">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Restoran Adı
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">storefront</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Telefon
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0555 555 55 55"
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${message.includes("hata")
                            ? "text-red-600 bg-red-50"
                            : "text-green-600 bg-green-50"
                            }`}>
                            <span className="material-symbols-outlined text-lg">
                                {message.includes("hata") ? "error" : "check_circle"}
                            </span>
                            {message}
                        </div>
                    )}

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

            <div className="max-w-lg">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Ayarlarınız kaydedildikten sonra menünüze anında yansır.
                </p>
            </div>
        </div>
    );
}
