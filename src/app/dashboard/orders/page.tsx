"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    tableNumber: string;
    items: OrderItem[];
    note: string;
    status: string;
    createdAt: string | null;
}

interface WaiterCall {
    id: string;
    tableNumber: string;
    createdAt: string | null;
}

const STATUS_LABELS_KEY: Record<string, TranslationKey> = {
    pending: "orders.status.pending",
    confirmed: "orders.status.confirmed",
    preparing: "orders.status.preparing",
    ready: "orders.status.ready",
    completed: "orders.status.completed",
    cancelled: "orders.status.cancelled",
};

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "completed"];

const STATUS_ICONS: Record<string, string> = {
    pending: "schedule",
    confirmed: "thumb_up",
    preparing: "skillet",
    ready: "check_circle",
    completed: "done_all",
    cancelled: "cancel",
};

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    ready: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-500",
    cancelled: "bg-red-100 text-red-600",
};

export default function OrdersPage() {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersEnabled, setOrdersEnabled] = useState(true);
    const [filter, setFilter] = useState<"active" | "all">("active");

    const fetchData = useCallback(async () => {
        const [ordersRes, callsRes, restaurantRes] = await Promise.all([
            fetch("/api/orders"),
            fetch("/api/waiter-call"),
            fetch("/api/restaurant"),
        ]);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (callsRes.ok) setWaiterCalls(await callsRes.json());
        if (restaurantRes.ok) {
            const data = await restaurantRes.json();
            setOrdersEnabled(data.ordersEnabled === true);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const updateOrderStatus = async (orderId: string, status: string) => {
        const res = await fetch("/api/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: orderId, status }),
        });
        if (res.ok) {
            setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
        }
    };

    const dismissWaiterCall = async (callId: string) => {
        const res = await fetch("/api/waiter-call", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: callId }),
        });
        if (res.ok) {
            setWaiterCalls((prev) => prev.filter((c) => c.id !== callId));
        }
    };

    const filteredOrders = filter === "active"
        ? orders.filter((o) => !["completed", "cancelled"].includes(o.status))
        : orders;

    const formatTime = (iso: string | null) => {
        if (!iso) return "";
        return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!ordersEnabled) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">{t("orders.title")}</h1>
                    <p className="text-slate-500 mt-1">{t("orders.subtitle")}</p>
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">receipt_long</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-700 mb-2">{t("orders.disabled")}</h2>
                    <p className="text-slate-500 text-sm max-w-sm mb-6">{t("orders.disabledDesc")}</p>
                    <a
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-5 h-11 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">settings</span>
                        {t("orders.goToSettings")}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900">{t("orders.title")}</h1>
                <p className="text-slate-500 mt-1">{t("orders.subtitle")}</p>
            </div>

            {/* Waiter calls */}
            {waiterCalls.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 animate-pulse">notifications_active</span>
                        <h2 className="text-lg font-bold text-slate-900">{t("orders.waiterCalls")}</h2>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{waiterCalls.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {waiterCalls.map((call) => (
                            <div key={call.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-amber-600">table_restaurant</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{t("orders.table")} {call.tableNumber}</p>
                                        <p className="text-xs text-slate-500">{formatTime(call.createdAt)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => dismissWaiterCall(call.id)}
                                    className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    {t("orders.dismiss")}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setFilter("active")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === "active" ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-50"}`}
                >
                    {t("orders.activeOrders")}
                </button>
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === "all" ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-50"}`}
                >
                    {t("orders.allOrders")}
                </button>
                <button
                    onClick={fetchData}
                    className="ml-auto flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
            </div>

            {/* Orders */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3 block">receipt_long</span>
                    <p>{t("orders.noOrders")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">table_restaurant</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{t("orders.table")} {order.tableNumber}</p>
                                            <p className="text-xs text-slate-500">{formatTime(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                                        <span className="material-symbols-outlined text-sm">{STATUS_ICONS[order.status] || "schedule"}</span>
                                        {t(STATUS_LABELS_KEY[order.status])}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="space-y-1.5 mb-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-700">
                                                <span className="font-bold text-primary">{item.quantity}x</span>{" "}
                                                {item.name}
                                            </span>
                                            <span className="text-slate-500">{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.note && (
                                    <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm text-slate-600 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-base mt-0.5">sticky_note_2</span>
                                        {order.note}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                    {nextStatus && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">{STATUS_ICONS[nextStatus]}</span>
                                            {t(STATUS_LABELS_KEY[nextStatus])}
                                        </button>
                                    )}
                                    {order.status !== "cancelled" && order.status !== "completed" && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                                            className="flex items-center gap-1 px-3 py-2 text-red-600 text-sm font-semibold hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">cancel</span>
                                            {t("orders.cancel")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
