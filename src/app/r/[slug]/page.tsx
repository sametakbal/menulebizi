import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import CategorySection from "@/components/CategorySection";
import type { MenuLayout } from "@/components/MenuCard";
import { getLocale } from "@/lib/i18n/getLocale";
import { getT } from "@/lib/i18n";

interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    order: number;
    categoryId: string;
}

interface Category {
    id: string;
    name: string;
    order: number;
    items: Item[];
}

export default async function PublicMenuPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const [{ slug }, locale] = await Promise.all([params, getLocale()]);
    const t = getT(locale);

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
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return (
        <div className="min-h-screen bg-background-light">
            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
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
