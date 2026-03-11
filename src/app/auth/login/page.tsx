"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            router.push("/dashboard");
        } catch {
            setError(t("auth.loginError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl font-bold text-primary">restaurant_menu</span>
                        <span className="text-2xl font-black tracking-tight text-primary">menülebizi</span>
                    </Link>
                    <p className="text-slate-500 mt-2">{t("auth.loginTitle")}</p>
                    <div className="flex justify-center mt-3">
                        <LanguageSwitcher variant="compact" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-8 space-y-5 shadow-sm">
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            {t("auth.emailLabel")}
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t("auth.emailPlaceholder")}
                                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            {t("auth.passwordLabel")}
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
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
                        className="w-full h-12 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 shadow-sm shadow-primary/20"
                    >
                        {loading ? t("auth.loggingIn") : t("auth.loginButton")}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    {t("auth.noAccount")}{" "}
                    <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                        {t("auth.signUp")}
                    </Link>
                </p>
            </div>
        </div>
    );
}
