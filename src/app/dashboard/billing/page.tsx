"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";

interface BillingStatus {
    status: SubscriptionStatus;
    trialEndsAt: string | null;
    daysRemaining: number;
    subscriptionReferenceCode: string | null;
    appUserId: string;
}

const STATUS_CONFIG: Record<SubscriptionStatus, { icon: string; colorClass: string }> = {
    trial: { icon: "hourglass_top", colorClass: "bg-blue-100 text-blue-700" },
    active: { icon: "check_circle", colorClass: "bg-green-100 text-green-700" },
    expired: { icon: "cancel", colorClass: "bg-red-100 text-red-600" },
    cancelled: { icon: "block", colorClass: "bg-slate-100 text-slate-500" },
};

const FEATURES: Array<"features1" | "features2" | "features3" | "features4" | "features5"> = [
    "features1", "features2", "features3", "features4", "features5",
];

export default function BillingPage() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [managing, setManaging] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    useEffect(() => {
        fetch("/api/billing/status")
            .then((res) => res.json())
            .then((data) => setBillingStatus(data))
            .finally(() => setLoading(false));
    }, []);

    const handleSubscribe = async () => {
        if (!billingStatus?.appUserId) return;
        setSubmitting(true);
        try {
            const { Purchases } = await import("@revenuecat/purchases-js");
            const purchases = Purchases.configure({
                apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
                appUserId: billingStatus.appUserId,
            });
            const offerings = await purchases.getOfferings();
            const pkg = offerings.current?.availablePackages[0];
            if (!pkg) {
                alert(t("billing.paymentError"));
                return;
            }
            await purchases.purchase({ rcPackage: pkg });
            // Refresh status after successful purchase
            const res = await fetch("/api/billing/status");
            setBillingStatus(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleManage = async () => {
        setManaging(true);
        try {
            const res = await fetch("/api/billing/manage");
            const { managementUrl } = await res.json();
            if (managementUrl) {
                window.open(managementUrl, "_blank");
            }
        } finally {
            setManaging(false);
        }
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const status = billingStatus?.status ?? "expired";
    const statusConfig = STATUS_CONFIG[status];
    const isExpiredOrCancelled = status === "expired" || status === "cancelled";
    const showUpgrade = isExpiredOrCancelled || status === "trial";

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">{t("billing.title")}</h1>
                <p className="text-slate-500 mt-1">{t("billing.subtitle")}</p>
            </div>

            {/* Notifications */}
            {successParam && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold mb-6">
                    <span className="material-symbols-outlined">check_circle</span>
                    {t("billing.paymentSuccess")}
                </div>
            )}
            {errorParam && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold mb-6">
                    <span className="material-symbols-outlined">error</span>
                    {t("billing.paymentError")}
                </div>
            )}

            {/* Current plan card */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.colorClass.replace("text-", "bg-").replace("-700", "-100").replace("-600", "-100").replace("-500", "-100")}`}>
                        <span className={`material-symbols-outlined text-xl ${statusConfig.colorClass.split(" ")[1]}`}>{statusConfig.icon}</span>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">
                            {t(`billing.${status}Status` as "billing.trialStatus" | "billing.activeStatus" | "billing.expiredStatus" | "billing.cancelledStatus")}
                        </p>
                        {status === "trial" && billingStatus?.daysRemaining !== undefined && (
                            <p className="text-sm text-slate-500">
                                {t("billing.trialDaysRemaining").replace("{days}", String(billingStatus.daysRemaining))}
                                {billingStatus.trialEndsAt && (
                                    <span className="ml-1">· {t("billing.trialExpires").replace("{date}", formatDate(billingStatus.trialEndsAt))}</span>
                                )}
                            </p>
                        )}
                        {status === "active" && (
                            <p className="text-sm text-slate-500">{t("billing.subscriptionActive")}</p>
                        )}
                        {status === "expired" && (
                            <p className="text-sm text-red-500">{t("billing.expiredMessage")}</p>
                        )}
                    </div>
                </div>

                {status === "active" && (
                    <button
                        onClick={handleManage}
                        disabled={managing}
                        className="text-sm text-slate-500 hover:text-slate-700 font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-base">settings</span>
                        {managing ? "..." : t("billing.manageSubscription")}
                    </button>
                )}
            </div>

            {/* Upgrade section */}
            {showUpgrade && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    {isExpiredOrCancelled && (
                        <p className="text-sm text-slate-600 mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            {t("billing.expiredDesc")}
                        </p>
                    )}
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{t("billing.upgradeTitle")}</h2>
                            <p className="text-slate-500 text-sm mt-0.5">{t("billing.upgradeDesc")}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-2xl font-black text-primary">{t("billing.upgradePrice")}</p>
                        </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                        {FEATURES.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                                {t(`billing.${f}`)}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleSubscribe}
                        disabled={submitting}
                        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                        <span className="material-symbols-outlined text-lg">credit_card</span>
                        {t("billing.startSubscription")}
                    </button>
                </div>
            )}
        </div>
    );
}
