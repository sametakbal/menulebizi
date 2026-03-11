"use client";

import { useState, useCallback } from "react";
import type { MenuLayout } from "@/components/MenuCard";
import CategorySection from "@/components/CategorySection";

interface Item {
    id: string;
    name: string;
    description?: string;
    price: number;
    isAvailable: boolean;
    imageUrl?: string;
    categoryId: string;
}

interface Category {
    id: string;
    name: string;
    order: number;
    items: Item[];
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface TableMenuProps {
    readonly restaurantId: string;
    readonly restaurantName: string;
    readonly restaurantPhone?: string;
    readonly categories: Category[];
    readonly layout: MenuLayout;
    readonly accentColor: string;
    readonly showPrices: boolean;
    readonly currency: string;
    readonly tableNumber: string;
    readonly t: Record<string, string>;
}

function WaiterButtonLabel({ status, t }: { readonly status: string; readonly t: Record<string, string> }) {
    let label = t.callWaiter;
    if (status === "sending") label = t.calling;
    else if (status === "called") label = t.waiterCalled;
    return <span className="hidden sm:inline">{label}</span>;
}

export default function TableMenu({
    restaurantId,
    restaurantName,
    restaurantPhone,
    categories,
    layout,
    accentColor,
    showPrices,
    currency,
    tableNumber,
    t,
}: TableMenuProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [note, setNote] = useState("");
    const [cartOpen, setCartOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState<"" | "sending" | "sent" | "error">("");
    const [waiterStatus, setWaiterStatus] = useState<"" | "sending" | "called" | "error">("");

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const addToCart = useCallback((item: { id: string; name: string; price: number }) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.id === item.id);
            if (existing) {
                return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c)
                .filter((c) => c.quantity > 0)
        );
    }, []);

    const handleOrder = async () => {
        if (cart.length === 0) return;
        setOrderStatus("sending");
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantId,
                    tableNumber,
                    items: cart.map((c) => ({ id: c.id, quantity: c.quantity })),
                    note,
                }),
            });
            if (res.ok) {
                setOrderStatus("sent");
                setCart([]);
                setNote("");
                setCartOpen(false);
                setTimeout(() => setOrderStatus(""), 4000);
            } else {
                setOrderStatus("error");
                setTimeout(() => setOrderStatus(""), 3000);
            }
        } catch {
            setOrderStatus("error");
            setTimeout(() => setOrderStatus(""), 3000);
        }
    };

    const handleCallWaiter = async () => {
        if (waiterStatus === "sending" || waiterStatus === "called") return;
        setWaiterStatus("sending");
        try {
            const res = await fetch("/api/waiter-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ restaurantId, tableNumber }),
            });
            if (res.ok) {
                setWaiterStatus("called");
                setTimeout(() => setWaiterStatus(""), 5000);
            } else {
                setWaiterStatus("error");
                setTimeout(() => setWaiterStatus(""), 3000);
            }
        } catch {
            setWaiterStatus("error");
            setTimeout(() => setWaiterStatus(""), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-background-light" style={{ "--color-primary": accentColor } as React.CSSProperties}>
            <div className="max-w-lg mx-auto px-4 py-8 pb-32">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">{restaurantName}</h1>
                    {restaurantPhone && (
                        <p className="text-slate-500 mt-1 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-sm">phone</span>
                            {restaurantPhone}
                        </p>
                    )}
                </div>

                {/* Table badge */}
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        <span className="material-symbols-outlined text-base">table_restaurant</span>
                        {t.table} {tableNumber}
                    </span>
                </div>

                {/* Category tabs */}
                {categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
                        {categories.map((cat) => (
                            <a
                                key={cat.id}
                                href={`#cat-${cat.id}`}
                                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                            >
                                {cat.name}
                            </a>
                        ))}
                    </div>
                )}

                {/* Menu with add buttons */}
                <div className="space-y-8">
                    {categories.map((cat) => (
                        <TableCategorySection
                            key={cat.id}
                            category={cat}
                            layout={layout}
                            showPrices={showPrices}
                            currency={currency}
                            cart={cart}
                            onAdd={addToCart}
                            onUpdateQuantity={updateQuantity}
                            t={t}
                        />
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-3 block">restaurant_menu</span>
                            {t.notReady}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                    <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                        <span className="font-bold">menülebizi</span> {t.poweredBy}
                    </a>
                </div>
            </div>

            {/* Order sent notification */}
            {orderStatus === "sent" && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {t.orderSent}
                </div>
            )}

            {/* Waiter called notification */}
            {waiterStatus === "called" && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {t.waiterCalled}
                </div>
            )}

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 safe-area-bottom">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
                    {/* Call waiter button */}
                    <button
                        onClick={handleCallWaiter}
                        disabled={waiterStatus === "sending" || waiterStatus === "called"}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50 shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">
                            {waiterStatus === "called" ? "check" : "notifications_active"}
                        </span>
                        <WaiterButtonLabel status={waiterStatus} t={t} />
                    </button>

                    {/* Cart button */}
                    <button
                        onClick={() => setCartOpen(true)}
                        disabled={cartCount === 0}
                        className="flex-1 flex items-center justify-between gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 transition-colors hover:bg-primary/90 shadow-sm"
                        style={{ backgroundColor: cartCount > 0 ? accentColor : undefined }}
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">shopping_cart</span>
                            {t.viewCart}
                            {cartCount > 0 && (
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
                            )}
                        </span>
                        {cartCount > 0 && showPrices && (
                            <span>{cartTotal.toFixed(2)} {currency}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Cart drawer */}
            {cartOpen && (
                <div className="fixed inset-0 z-50">
                    <button className="absolute inset-0 bg-black/40 cursor-default" onClick={() => setCartOpen(false)} aria-label="Close cart" />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col safe-area-bottom animate-in slide-in-from-bottom">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{t.yourOrder}</h2>
                                <p className="text-xs text-slate-500">{t.table} {tableNumber}</p>
                            </div>
                            <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                        {showPrices && (
                                            <p className="text-xs text-slate-500">{item.price.toFixed(2)} {currency}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                                        >
                                            <span className="material-symbols-outlined text-base">remove</span>
                                        </button>
                                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                                        >
                                            <span className="material-symbols-outlined text-base">add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {cart.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 block">shopping_cart</span>
                                    <p className="text-sm">{t.emptyCart}</p>
                                </div>
                            )}

                            {/* Note input */}
                            {cart.length > 0 && (
                                <div className="pt-3 border-t border-slate-100">
                                    <label htmlFor="order-note" className="block text-xs font-semibold text-slate-500 mb-1.5">{t.orderNote}</label>
                                    <textarea
                                        id="order-note"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        maxLength={500}
                                        rows={2}
                                        placeholder={t.orderNotePlaceholder}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-5 border-t border-slate-100 shrink-0 space-y-3">
                                {showPrices && (
                                    <div className="flex items-center justify-between font-bold text-slate-900">
                                        <span>{t.total}</span>
                                        <span className="text-lg">{cartTotal.toFixed(2)} {currency}</span>
                                    </div>
                                )}
                                <button
                                    onClick={handleOrder}
                                    disabled={orderStatus === "sending"}
                                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {orderStatus === "sending" ? "hourglass_top" : "send"}
                                    </span>
                                    {orderStatus === "sending" ? t.sendingOrder : t.sendOrder}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Category section with add-to-cart buttons
function TableCategorySection({
    category,
    layout,
    showPrices,
    currency,
    cart,
    onAdd,
    onUpdateQuantity,
    t,
}: {
    readonly category: Category;
    readonly layout: MenuLayout;
    readonly showPrices: boolean;
    readonly currency: string;
    readonly cart: CartItem[];
    readonly onAdd: (item: { id: string; name: string; price: number }) => void;
    readonly onUpdateQuantity: (id: string, delta: number) => void;
    readonly t: Record<string, string>;
}) {
    const available = category.items.filter((item) => item.isAvailable);
    if (available.length === 0) return null;

    return (
        <section id={`cat-${category.id}`} className="scroll-mt-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-primary/20"></div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    {category.name}
                </h2>
                <div className="h-px flex-1 bg-primary/20"></div>
            </div>
            <div className={layout === "visual" ? "grid grid-cols-2 gap-3" : "space-y-1"}>
                {available.map((item) => {
                    const inCart = cart.find((c) => c.id === item.id);
                    return (
                        <div key={item.id} className="relative">
                            <CategorySection
                                id={`inline-${item.id}`}
                                name=""
                                items={[item]}
                                layout={layout}
                                showPrices={showPrices}
                                currency={currency}
                            />
                            {/* Add/quantity overlay */}
                            <div className="absolute bottom-1 right-1 z-10">
                                {inCart ? (
                                    <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-0.5">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="w-5 text-center font-bold text-xs">{inCart.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onAdd({ id: item.id, name: item.name, price: item.price })}
                                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                                        title={t.add}
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
