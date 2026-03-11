interface MenuItemProps {
    name: string;
    description?: string;
    price: number;
}

export default function MenuCard({ name, description, price }: MenuItemProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 p-4 flex justify-between items-start gap-4 shadow-sm">
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{name}</p>
                {description && (
                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
            <span className="font-bold text-primary whitespace-nowrap text-lg">
                {price.toFixed(2)} ₺
            </span>
        </div>
    );
}
