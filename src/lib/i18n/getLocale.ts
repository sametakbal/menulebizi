import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from ".";

export async function getLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const value = cookieStore.get("locale")?.value;
    return (locales.includes(value as Locale) ? value : defaultLocale) as Locale;
}
