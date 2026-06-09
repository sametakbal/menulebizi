import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import Image from "next/image";
import CategorySection from "@/components/CategorySection";
import TableMenu from "@/components/TableMenu";
import type { MenuLayout } from "@/components/MenuCard";
import { getLocale } from "@/lib/i18n/getLocale";
import { getT } from "@/lib/i18n";

type ItemTranslation = { name?: string; description?: string };

interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    order: number;
    categoryId: string;
    translations?: Record<string, ItemTranslation>;
}

interface Category {
    id: string;
    name: string;
    order: number;
    items: Item[];
    translations?: Record<string, { name?: string }>;
}

function applyItemLocale(item: Item, locale: string): Item {
    const t = item.translations?.[locale];
    if (!t) return item;
    return { ...item, name: t.name || item.name, description: t.description ?? item.description };
}

function applyCategoryLocale(cat: Category, locale: string): Category {
    const t = cat.translations?.[locale];
    return {
        ...cat,
        name: t?.name || cat.name,
        items: cat.items.map((item) => applyItemLocale(item, locale)),
    };
}

export default async function PublicMenuPage({
    params,
    searchParams,
}: {
    readonly params: Promise<{ slug: string }>;
    readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const [{ slug }, query, locale] = await Promise.all([params, searchParams, getLocale()]);
    const t = getT(locale);
    const tableNumber = typeof query.table === "string" ? query.table : null;

    // Find restaurant by slug
    const restaurantSnap = await adminDb
        .collection("restaurants")
        .where("slug", "==", slug)
        .limit(1)
        .get();

    if (restaurantSnap.empty) return notFound();

    const restaurantDoc = restaurantSnap.docs[0];
    const restaurant = restaurantDoc.data();

    // Fetch categories
    const catSnap = await adminDb
        .collection("categories")
        .where("restaurantId", "==", restaurantDoc.id)
        .get();

    // Fetch all items for this restaurant
    const itemSnap = await adminDb
        .collection("items")
        .where("restaurantId", "==", restaurantDoc.id)
        .get();

    const allItems = itemSnap.docs
        .map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
        .sort((a, b) => ((a as Record<string, unknown>).order as number ?? 0) - ((b as Record<string, unknown>).order as number ?? 0)) as Item[];

    const categories: Category[] = catSnap.docs
        .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Category, "id" | "items">),
            items: allItems.filter((item) => item.categoryId === doc.id),
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((cat) => applyCategoryLocale(cat, locale));

    const accentColor = (restaurant.accentColor as string) || "#e9590c";
    const showPrices = restaurant.showPrices !== false;
    const currency = (restaurant.currency as string) || "₺";
    const ordersEnabled = restaurant.ordersEnabled === true;
    const logoUrl = (restaurant.logoUrl as string) || "";

    // Table mode: render interactive menu with cart + waiter call
    if (tableNumber) {
        const tableT = {
            table: t("tableMenu.table"),
            notReady: t("publicMenu.notReady"),
            poweredBy: t("publicMenu.poweredBy"),
            add: t("tableMenu.add"),
            viewCart: t("tableMenu.viewCart"),
            yourOrder: t("tableMenu.yourOrder"),
            emptyCart: t("tableMenu.emptyCart"),
            orderNote: t("tableMenu.orderNote"),
            orderNotePlaceholder: t("tableMenu.orderNotePlaceholder"),
            total: t("tableMenu.total"),
            sendOrder: t("tableMenu.sendOrder"),
            sendingOrder: t("tableMenu.sendingOrder"),
            orderSent: t("tableMenu.orderSent"),
            callWaiter: t("tableMenu.callWaiter"),
            calling: t("tableMenu.calling"),
            waiterCalled: t("tableMenu.waiterCalled"),
        };

        return (
            <TableMenu
                restaurantId={restaurantDoc.id}
                restaurantName={restaurant.name}
                restaurantPhone={restaurant.phone}
                logoUrl={logoUrl}
                categories={categories}
                layout={(restaurant.menuLayout as MenuLayout) || "classic"}
                accentColor={accentColor}
                showPrices={showPrices}
                currency={currency}
                tableNumber={tableNumber}
                ordersEnabled={ordersEnabled}
                t={tableT}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background-light" style={{ "--color-primary": accentColor } as React.CSSProperties}>
            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                        {logoUrl ? (
                            <Image src={logoUrl} alt={restaurant.name as string} width={64} height={64} className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">{restaurant.name}</h1>
                    {restaurant.phone && (
                        <p className="text-slate-500 mt-1 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-sm">phone</span>
                            {restaurant.phone}
                        </p>
                    )}
                </div>

                {/* Category tabs */}
                {categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
                        {categories.map((cat) => (
                            <a
                                key={cat.id}
                                href={`#cat-${cat.id}`}
                                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                            >
                                {cat.name}
                            </a>
                        ))}
                    </div>
                )}

                {/* Menu */}
                <div className="space-y-8">
                    {categories.map((cat) => (
                        <CategorySection
                            key={cat.id}
                            id={cat.id}
                            name={cat.name}
                            items={cat.items}
                            layout={(restaurant.menuLayout as MenuLayout) || "classic"}
                            showPrices={showPrices}
                            currency={currency}
                        />
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-3 block">restaurant_menu</span>
                            {t("publicMenu.notReady")}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                    <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                        <span className="font-bold">menülebizi</span> {t("publicMenu.poweredBy")}
                    </a>
                </div>
            </div>
        </div>
    );
}
