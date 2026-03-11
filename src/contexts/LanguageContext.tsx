"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { getT, type Locale, type TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
    locale: "tr",
    setLocale: () => undefined,
    t: getT("tr"),
});

export function LanguageProvider({
    children,
    initialLocale,
}: {
    children: ReactNode;
    initialLocale: Locale;
}) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);

    const setLocale = (next: Locale) => {
        setLocaleState(next);
        document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t: getT(locale) }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    return useContext(LanguageContext);
}
