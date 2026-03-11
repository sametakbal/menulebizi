import Link from "next/link";

export default function Home() {
  return (
    <div className="font-display bg-white text-slate-900 antialiased">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl font-bold text-primary">restaurant_menu</span>
              <span className="text-2xl font-black tracking-tight text-primary">menülebizi</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shadow-primary/20"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-8 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Yeni Nesil Dijital Menü
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
              Restoranınızın menüsünü <br />
              <span className="text-primary">dijitale taşıyın</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed">
              Müşterileriniz için temassız, hızlı ve modern bir menü deneyimi sunun.
              Kağıt menü maliyetlerinden kurtulun, işletmenizi geleceğe hazırlayın.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/25"
              >
                Hemen Başla
              </Link>
              <Link
                href="/r/demo"
                className="w-full sm:w-auto px-8 py-4 border-2 border-slate-200 text-slate-700 text-lg font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Demo Menü
              </Link>
            </div>

            {/* Decorative */}
            <div className="mt-16 relative max-w-5xl mx-auto">
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/5 via-transparent to-primary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Neden menülebizi?</h2>
              <p className="text-slate-500 max-w-xl mx-auto">İşletmenizi dijitalleştiren ve operasyonlarınızı kolaylaştıran en güçlü özellikler tek bir platformda.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">qr_code_2</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">QR Kod ile Erişim</h3>
                <p className="text-slate-500 leading-relaxed">
                  Müşterileriniz sadece bir tarama ile menünüze anında ulaşsın. Uygulama indirme zorunluluğu yok.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Anlık Güncelleme</h3>
                <p className="text-slate-500 leading-relaxed">
                  Fiyatları, stok durumunu ve ürünleri dilediğiniz an güncelleyin. Menünüz her zaman taze kalsın.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">palette</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Kolay Yönetim</h3>
                <p className="text-slate-500 leading-relaxed">
                  Kullanıcı dostu yönetim paneli ile dakikalar içinde kategoriler oluşturun ve görsellerinizi ekleyin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-xl p-10 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 relative z-10">
                Hazırsanız başlayalım!
              </h2>
              <p className="text-orange-50 text-lg mb-10 max-w-lg mx-auto relative z-10">
                Restoranınızın dijital dönüşümü için ilk adımı atın. 14 gün ücretsiz deneme fırsatını kaçırmayın.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link
                  href="/auth/register"
                  className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-xl"
                >
                  Ücretsiz Denemeyi Başlat
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-bold">restaurant_menu</span>
              <span className="text-xl font-black text-primary">menülebizi</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-8">
              <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Özellikler</a>
              <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Fiyatlandırma</a>
              <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Destek</a>
              <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Gizlilik</a>
            </nav>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm">© 2026 menülebizi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
