"use client";

import type { MenuLayout } from "@/components/MenuCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface MenuPreviewProps {
    readonly restaurantName: string;
    readonly layout: MenuLayout;
    readonly accentColor: string;
    readonly showPrices: boolean;
    readonly currency: string;
}

const SAMPLE_ITEMS = [
    { name: "Adana Kebap", description: "Acılı el kıyması", price: 320 },
    { name: "Mercimek Çorbası", description: "Geleneksel tarif", price: 85 },
    { name: "Künefe", description: "Antep fıstıklı", price: 180 },
];

function PreviewItem({ item, layout, showPrices, currency }: {
    readonly item: typeof SAMPLE_ITEMS[0];
    readonly layout: MenuLayout;
    readonly showPrices: boolean;
    readonly currency: string;
}) {
    const priceLabel = `${item.price.toFixed(2)} ${currency}`;

    if (layout === "compact") {
        return (
            <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
                <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-[9px] leading-tight">{item.name}</p>
                    <p className="text-[7px] text-slate-400 truncate">{item.description}</p>
                </div>
                {showPrices && (
                    <span className="font-bold text-(--color-primary) whitespace-nowrap text-[8px] shrink-0">
                        {priceLabel}
                    </span>
                )}
            </div>
        );
    }

    if (layout === "visual") {
        return (
            <div className="bg-white rounded-lg overflow-hidden border border-slate-100">
                <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-200 text-lg">image</span>
                </div>
                <div className="p-1.5">
                    <p className="font-bold text-slate-900 text-[8px] leading-tight">{item.name}</p>
                    <p className="text-[6px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                    {showPrices && (
                        <p className="font-bold text-(--color-primary) text-[8px] mt-1">{priceLabel}</p>
                    )}
                </div>
            </div>
        );
    }

    // classic
    return (
        <div className="bg-white rounded-lg border border-slate-100 p-1.5 flex gap-1.5 items-center">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-300 text-sm">image</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-[8px] leading-tight">{item.name}</p>
                <p className="text-[6px] text-slate-500 mt-0.5 truncate">{item.description}</p>
            </div>
            {showPrices && (
                <span className="font-bold text-(--color-primary) whitespace-nowrap text-[8px] shrink-0">
                    {priceLabel}
                </span>
            )}
        </div>
    );
}

export default function MenuPreview({ restaurantName, layout, accentColor, showPrices, currency }: MenuPreviewProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center">
            <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">visibility</span>
                {t("settings.previewTitle")}
            </p>
            {/* Phone frame */}
            <div className="w-55 rounded-[28px] border-[6px] border-slate-800 bg-slate-800 shadow-xl overflow-hidden">
                {/* Notch */}
                <div className="h-5 bg-slate-800 flex items-center justify-center">
                    <div className="w-16 h-3 bg-slate-900 rounded-full" />
                </div>
                {/* Screen */}
                <div
                    className="bg-slate-50 overflow-y-auto"
                    style={{
                        height: 380,
                        ["--color-primary" as string]: accentColor,
                    }}
                >
                    {/* Header */}
                    <div className="text-center pt-4 pb-3 px-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2"
                            style={{ backgroundColor: `${accentColor}15` }}
                        >
                            <span className="material-symbols-outlined text-sm" style={{ color: accentColor }}>restaurant</span>
                        </div>
                        <h3 className="text-[10px] font-black text-slate-900 leading-tight">
                            {restaurantName || "Restoran"}
                        </h3>
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-1 px-3 mb-3">
                        <span
                            className="shrink-0 px-2 py-0.5 rounded-full text-[7px] font-semibold text-white"
                            style={{ backgroundColor: accentColor }}
                        >
                            Ana Yemekler
                        </span>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[7px] font-semibold border border-slate-200 text-slate-500">
                            Tatlılar
                        </span>
                    </div>

                    {/* Category divider */}
                    <div className="flex items-center gap-1.5 px-3 mb-2">
                        <div className="h-px flex-1" style={{ backgroundColor: `${accentColor}30` }} />
                        <span className="text-[7px] font-bold text-slate-900 uppercase tracking-wider">Ana Yemekler</span>
                        <div className="h-px flex-1" style={{ backgroundColor: `${accentColor}30` }} />
                    </div>

                    {/* Items */}
                    <div className={`px-3 pb-4 ${layout === "visual" ? "grid grid-cols-2 gap-1.5" : "space-y-1"}`}>
                        {SAMPLE_ITEMS.map((item) => (
                            <PreviewItem
                                key={item.name}
                                item={item}
                                layout={layout}
                                showPrices={showPrices}
                                currency={currency}
                            />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-3 pb-3 pt-1 border-t border-slate-200 text-center">
                        <span className="text-[6px] text-slate-400 flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined" style={{ fontSize: 8 }}>restaurant_menu</span>
                            <span className="font-bold">menülebizi</span>
                        </span>
                    </div>
                </div>
                {/* Bottom bar */}
                <div className="h-4 bg-slate-800 flex items-center justify-center">
                    <div className="w-10 h-1 bg-slate-600 rounded-full" />
                </div>
            </div>
        </div>
    );
}
