import MenuCard from "./MenuCard";

interface Item {
    id: string;
    name: string;
    description?: string;
    price: number;
    isAvailable: boolean;
}

interface CategorySectionProps {
    id: string;
    name: string;
    items: Item[];
}

export default function CategorySection({ id, name, items }: CategorySectionProps) {
    const available = items.filter((item) => item.isAvailable);

    if (available.length === 0) return null;

    return (
        <section id={`cat-${id}`} className="scroll-mt-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-primary/20"></div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    {name}
                </h2>
                <div className="h-px flex-1 bg-primary/20"></div>
            </div>
            <div className="space-y-3">
                {available.map((item) => (
                    <MenuCard
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                    />
                ))}
            </div>
        </section>
    );
}
