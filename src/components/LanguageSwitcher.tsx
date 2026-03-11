"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { locales, localeFlags, localeNames, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "compact" }) {
    const { locale, setLocale } = useLanguage();
    const router = useRouter();

    const handleChange = (next: Locale) => {
        setLocale(next);
        router.refresh();
    };

    if (variant === "compact") {
        return (
            <div className="flex items-center gap-0.5">
                {locales.map((l) => (
                    <button
                        key={l}
                        onClick={() => handleChange(l)}
                        title={localeNames[l]}
                        className={`text-base px-1.5 py-0.5 rounded transition-colors ${
                            locale === l ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-slate-100"
                        }`}
                    >
                        {localeFlags[l]}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {locales.map((l) => (
                <button
                    key={l}
                    onClick={() => handleChange(l)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                        locale === l
                            ? "bg-primary text-white"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                >
                    <span>{localeFlags[l]}</span>
                    <span>{localeNames[l]}</span>
                </button>
            ))}
        </div>
    );
}
