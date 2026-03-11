import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import QRCodeSection from "./QRCodeSection";

export default async function DashboardPage() {
    const session = await getSession();
    const restaurantDoc = await adminDb
        .collection("restaurants")
        .doc(session!.restaurantId)
        .get();

    const restaurant = restaurantDoc.data();

    const categoriesSnap = await adminDb
        .collection("categories")
        .where("restaurantId", "==", session!.restaurantId)
        .get();

    const itemsSnap = await adminDb
        .collection("items")
        .where("restaurantId", "==", session!.restaurantId)
        .get();

    const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/${restaurant?.slug}`;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900">
                    Hoş geldiniz, {restaurant?.name}
                </h1>
                <p className="text-slate-500 mt-1">Menünüzü buradan yönetebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">category</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Kategoriler</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {categoriesSnap.size}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">lunch_dining</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Menü Öğeleri</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                        {itemsSnap.size}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">link</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Menü Linki</p>
                    </div>
                    <a
                        href={menuUrl}
                        target="_blank"
                        className="text-primary hover:underline text-sm block truncate font-medium"
                    >
                        {menuUrl}
                    </a>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-2xl">qr_code_2</span>
                    <h2 className="text-lg font-bold text-slate-900">QR Kodunuz</h2>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                    Bu QR kodu masalarınıza koyarak müşterilerinizin menünüze erişmesini
                    sağlayabilirsiniz.
                </p>
                <QRCodeSection url={menuUrl} />
            </div>

            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-primary to-orange-500 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Menünüzü zenginleştirin</h3>
                    <p className="text-orange-50 mb-4">Yeni kategoriler ve ürünler ekleyerek müşterilerinize daha iyi bir deneyim sunun.</p>
                    <a href="/dashboard/menu" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Menüyü Düzenle
                    </a>
                </div>
            </div>
        </div>
    );
}
