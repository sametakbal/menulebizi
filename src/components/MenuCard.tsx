import Image from "next/image";

export type MenuLayout = "classic" | "visual" | "compact";

interface MenuItemProps {
    readonly name: string;
    readonly description?: string;
    readonly price: number;
    readonly imageUrl?: string;
    readonly layout?: MenuLayout;
    readonly showPrices?: boolean;
    readonly currency?: string;
}

export default function MenuCard({ name, description, price, imageUrl, layout = "classic", showPrices = true, currency = "₺" }: MenuItemProps) {
    const priceLabel = `${price.toFixed(2)} ${currency}`;

    if (layout === "compact") {
        return (
            <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{name}</p>
                    {description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>
                    )}
                </div>
                {showPrices && (
                    <span className="font-bold text-primary whitespace-nowrap text-sm shrink-0">
                        {priceLabel}
                    </span>
                )}
            </div>
        );
    }

    if (layout === "visual") {
        return (
            <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="relative w-full aspect-square bg-slate-100">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-200 text-4xl">image</span>
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <p className="font-bold text-slate-900 text-sm leading-tight">{name}</p>
                    {description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>
                    )}
                    {showPrices && (
                        <p className="font-bold text-primary text-sm mt-2">{priceLabel}</p>
                    )}
                </div>
            </div>
        );
    }

    // classic (default)
    return (
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex gap-3 items-center shadow-sm">
            {imageUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                    <Image src={imageUrl} alt={name} fill className="object-cover" />
                </div>
            ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-300 text-2xl">image</span>
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{name}</p>
                {description && (
                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
            {showPrices && (
                <span className="font-bold text-primary whitespace-nowrap text-lg shrink-0">
                    {priceLabel}
                </span>
            )}
        </div>
    );
}
