"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        restaurantName: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );
            const idToken = await userCredential.user.getIdToken();

            // 2. Create restaurant + user doc in Firestore via API
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    restaurantName: form.restaurantName,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Bir hata oluştu");
                return;
            }

            // 3. Create session cookie
            await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            router.push("/dashboard");
        } catch {
            setError("Kayıt sırasında bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl font-bold text-primary">restaurant_menu</span>
                        <span className="text-2xl font-black tracking-tight text-primary">menülebizi</span>
                    </Link>
                    <p className="text-slate-500 mt-2">Yeni hesap oluşturun</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-8 space-y-5 shadow-sm">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Adınız
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                required
                                placeholder="Adınızı girin"
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                required
                                placeholder="ornek@email.com"
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Şifre
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, password: e.target.value }))
                                }
                                required
                                minLength={6}
                                placeholder="En az 6 karakter"
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Restoran Adı
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">storefront</span>
                            <input
                                type="text"
                                value={form.restaurantName}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, restaurantName: e.target.value }))
                                }
                                required
                                placeholder="Restoran adını girin"
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {loading ? "Kayıt yapılıyor..." : (
                            <>
                                Kayıt Ol
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Zaten hesabınız var mı?{" "}
                    <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                        Giriş yapın
                    </Link>
                </p>
            </div>
        </div>
    );
}
