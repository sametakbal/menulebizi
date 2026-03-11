import Link from "next/link";
import CategorySection from "@/components/CategorySection";
import { getLocale } from "@/lib/i18n/getLocale";
import { getT } from "@/lib/i18n";

const U = (id: string) =>
    `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&auto=format&q=80`;

const DEMO_CATEGORIES = [
    {
        id: "starters",
        name: "Başlangıçlar",
        items: [
            { id: "s1", name: "Mercimek Çorbası", description: "Geleneksel kırmızı mercimek çorbası, limon ve pul biber ile", price: 85, isAvailable: true, imageUrl: U("1547592166-23ac45744acd") },
            { id: "s2", name: "Sigara Böreği", description: "Çıtır çıtır, beyaz peynirli ince yufka böreği (6 adet)", price: 110, isAvailable: true, imageUrl: U("1555396273-367ea4eb4db5") },
            { id: "s3", name: "Humus", description: "Tahin ve zeytinyağlı kremalı nohut ezmesi, taze ekmek ile", price: 95, isAvailable: true, imageUrl: U("1476224203421-9ac39bcb3327") },
            { id: "s4", name: "Közlenmiş Patlıcan Salatası", description: "Közlenmiş patlıcan, sarımsak ve zeytinyağı", price: 90, isAvailable: true, imageUrl: U("1546069901-ba9599a7e63c") },
        ],
    },
    {
        id: "mains",
        name: "Ana Yemekler",
        items: [
            { id: "m1", name: "Adana Kebap", description: "Acılı kıyma köfte, közlenmiş sebzeler ve lavaş ile", price: 280, isAvailable: true, imageUrl: U("1529042410759-befb1204b468") },
            { id: "m2", name: "Tavuk Şiş", description: "Marine edilmiş tavuk göğsü, pilav ve mevsim salatası ile", price: 240, isAvailable: true, imageUrl: U("1504674900247-0877df9cc836") },
            { id: "m3", name: "İskender Kebap", description: "Döner eti, yoğurt, tereyağı domates sosu ve pide üzerinde", price: 320, isAvailable: true, imageUrl: U("1565299585323-38d6b0865b47") },
            { id: "m4", name: "Mantı", description: "El yapımı küçük hamur, sarımsaklı yoğurt ve kırmızı biber sosu", price: 200, isAvailable: true, imageUrl: U("1510626176961-4b57d4fbad03") },
            { id: "m5", name: "Karnıyarık", description: "Kıymalı fırın patlıcan, pilav ve cacık ile", price: 220, isAvailable: true, imageUrl: U("1512058564366-18510be2db19") },
        ],
    },
    {
        id: "desserts",
        name: "Tatlılar",
        items: [
            { id: "d1", name: "Baklava", description: "Antep fıstıklı geleneksel Türk baklavası (3 dilim)", price: 120, isAvailable: true, imageUrl: U("1414235077428-338989a2e8c0") },
            { id: "d2", name: "Sütlaç", description: "Fırında pişirilmiş kremsi pirinç sütlacı", price: 95, isAvailable: true, imageUrl: U("1488477181946-6428a0291777") },
            { id: "d3", name: "Künefe", description: "Sıcak peynirli tel kadayıf, şerbet ve antep fıstığı ile", price: 130, isAvailable: true, imageUrl: U("1551024506-0bccd828d307") },
        ],
    },
    {
        id: "drinks",
        name: "İçecekler",
        items: [
            { id: "dr1", name: "Türk Çayı", description: "Demlenmiş siyah çay, şeker ile", price: 30, isAvailable: true, imageUrl: U("1571934811356-5cc061b6821f") },
            { id: "dr2", name: "Ayran", description: "Ev yapımı soğuk yoğurt içeceği", price: 40, isAvailable: true, imageUrl: U("1563227812-0ea4c22e6cc8") },
            { id: "dr3", name: "Limonata", description: "Taze sıkılmış limon, nane ve şeker", price: 65, isAvailable: true, imageUrl: U("1621506289937-a8e4df240d0b") },
            { id: "dr4", name: "Türk Kahvesi", description: "Geleneksel köpüklü Türk kahvesi, lokum ile", price: 55, isAvailable: true, imageUrl: U("1514432324607-a09d9b4aefdd") },
        ],
    },
];

export default async function DemoMenuPage() {
    const locale = await getLocale();
    const t = getT(locale);

    return (
        <div className="min-h-screen bg-background-light">
            {/* Demo banner */}
            <div className="bg-primary text-white">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-base shrink-0">info</span>
                        <p className="text-sm font-medium truncate">{t("publicMenu.demoDesc")}</p>
                    </div>
                    <Link
                        href="/auth/register"
                        className="shrink-0 text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                        {t("publicMenu.demoSignup")}
                    </Link>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-2">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        {t("publicMenu.demoBadge")}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Lezzet Evi</h1>
                    <p className="text-slate-500 mt-1 flex items-center justify-center gap-1 text-sm">
                        <span className="material-symbols-outlined text-sm">phone</span>
                        <span>0555 123 45 67</span>
                    </p>
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
                    {DEMO_CATEGORIES.map((cat) => (
                        <a
                            key={cat.id}
                            href={`#cat-${cat.id}`}
                            className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                        >
                            {cat.name}
                        </a>
                    ))}
                </div>

                {/* Menu */}
                <div className="space-y-8">
                    {DEMO_CATEGORIES.map((cat) => (
                        <CategorySection
                            key={cat.id}
                            id={cat.id}
                            name={cat.name}
                            items={cat.items}
                            layout="classic"
                            showPrices={true}
                            currency="₺"
                        />
                    ))}
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
