import { tr } from "./translations/tr";
import { en } from "./translations/en";
import { es } from "./translations/es";

export type Locale = "tr" | "en" | "es";

export const locales: Locale[] = ["tr", "en", "es"];
export const defaultLocale: Locale = "tr";

export const localeNames: Record<Locale, string> = {
    tr: "Türkçe",
    en: "English",
    es: "Español",
};

export const localeFlags: Record<Locale, string> = {
    tr: "🇹🇷",
    en: "🇬🇧",
    es: "🇪🇸",
};

export type Translations = typeof tr;

// Use a structural shape (not the exact literal type) so other locales' string values are accepted
type TranslationsShape = {
    [K in keyof Translations]: {
        [P in keyof Translations[K]]: string;
    };
};

const translations: Record<Locale, TranslationsShape> = { tr, en, es };

type NestedKeyOf<T extends object> = {
    [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
}[keyof T & string];

export type TranslationKey = NestedKeyOf<Translations>;

export function getT(locale: Locale) {
    const dict = translations[locale] ?? translations[defaultLocale];

    return function t(key: TranslationKey, vars?: Record<string, string>): string {
        const parts = key.split(".") as string[];
        let val: unknown = dict;
        for (const part of parts) {
            if (typeof val !== "object" || val === null) return key;
            val = (val as Record<string, unknown>)[part];
        }
        if (typeof val !== "string") return key;
        if (!vars) return val;
        return Object.entries(vars).reduce(
            (s, [k, v]) => s.replace(`{${k}}`, v),
            val,
        );
    };
}
