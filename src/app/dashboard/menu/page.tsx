"use client";

import { useState, useEffect, useCallback } from "react";

interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    categoryId: string;
}

interface Category {
    id: string;
    name: string;
    order: number;
}

export default function MenuManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    // Category form
    const [newCategoryName, setNewCategoryName] = useState("");

    // Item form
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [itemForm, setItemForm] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
    });

    const fetchData = useCallback(async () => {
        try {
            const [catRes, itemRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/items"),
            ]);
            const catData = await catRes.json();
            const itemData = await itemRes.json();
            setCategories(Array.isArray(catData) ? catData : []);
            setItems(Array.isArray(itemData) ? itemData : []);
        } catch {
            console.error("Veri yükleme hatası");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Category Actions ---
    const addCategory = async () => {
        if (!newCategoryName.trim()) return;
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCategoryName.trim() }),
        });
        if (res.ok) {
            const cat = await res.json();
            setCategories((prev) => [...prev, cat]);
            setNewCategoryName("");
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm("Bu kategori ve içindeki tüm ürünler silinecek. Emin misiniz?"))
            return;
        const res = await fetch("/api/categories", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setCategories((prev) => prev.filter((c) => c.id !== id));
            setItems((prev) => prev.filter((i) => i.categoryId !== id));
        }
    };

    // --- Item Actions ---
    const openNewItem = (categoryId: string) => {
        setEditingItem(null);
        setItemForm({ name: "", description: "", price: "", categoryId });
        setShowItemForm(true);
    };

    const openEditItem = (item: Item) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            description: item.description,
            price: String(item.price),
            categoryId: item.categoryId,
        });
        setShowItemForm(true);
    };

    const saveItem = async () => {
        if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) return;

        if (editingItem) {
            const res = await fetch("/api/items", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingItem.id,
                    name: itemForm.name.trim(),
                    description: itemForm.description.trim(),
                    price: parseFloat(itemForm.price),
                }),
            });
            if (res.ok) {
                setItems((prev) =>
                    prev.map((i) =>
                        i.id === editingItem.id
                            ? {
                                ...i,
                                name: itemForm.name.trim(),
                                description: itemForm.description.trim(),
                                price: parseFloat(itemForm.price),
                            }
                            : i
                    )
                );
            }
        } else {
            const res = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: itemForm.name.trim(),
                    description: itemForm.description.trim(),
                    price: parseFloat(itemForm.price),
                    categoryId: itemForm.categoryId,
                }),
            });
            if (res.ok) {
                const item = await res.json();
                setItems((prev) => [...prev, item]);
            }
        }
        setShowItemForm(false);
        setEditingItem(null);
    };

    const toggleAvailability = async (item: Item) => {
        const res = await fetch("/api/items", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
        });
        if (res.ok) {
            setItems((prev) =>
                prev.map((i) =>
                    i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
                )
            );
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        const res = await fetch("/api/items", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setItems((prev) => prev.filter((i) => i.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900">Menü Yönetimi</h1>
                <p className="text-slate-500 mt-1">
                    Kategoriler ve menü öğelerinizi buradan yönetebilirsiniz.
                </p>
            </div>

            {/* Add Category */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    <h2 className="text-lg font-bold text-slate-900">Yeni Kategori Ekle</h2>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCategory()}
                        placeholder="Kategori adı (ör: Ana Yemekler)"
                        className="flex-1 px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <button
                        onClick={addCategory}
                        className="px-6 h-12 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold shadow-sm shadow-primary/20"
                    >
                        Ekle
                    </button>
                </div>
            </div>

            {/* Categories & Items */}
            {categories.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3 block">restaurant_menu</span>
                    Henüz kategori eklenmemiş. Yukarıdan ilk kategorinizi ekleyin.
                </div>
            ) : (
                categories.map((cat) => {
                    const catItems = items.filter((i) => i.categoryId === cat.id);
                    return (
                        <div key={cat.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">folder</span>
                                    <h3 className="font-bold text-slate-900">{cat.name}</h3>
                                    <span className="text-xs text-slate-400 ml-1">({catItems.length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openNewItem(cat.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-base">add</span>
                                        Ürün Ekle
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(cat.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                        Sil
                                    </button>
                                </div>
                            </div>

                            {catItems.length === 0 ? (
                                <div className="px-6 py-10 text-center text-slate-400 text-sm">
                                    <span className="material-symbols-outlined text-3xl mb-2 block">inventory_2</span>
                                    Bu kategoride henüz ürün yok.
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {catItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className={`font-semibold ${!item.isAvailable
                                                            ? "text-slate-400 line-through"
                                                            : "text-slate-900"
                                                            }`}
                                                    >
                                                        {item.name}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isAvailable
                                                        ? "bg-green-50 text-green-700 border border-green-200"
                                                        : "bg-slate-100 text-slate-500 border border-slate-200"
                                                        }`}>
                                                        {item.isAvailable ? "Aktif" : "Pasif"}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-sm text-slate-500 mt-0.5">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="font-bold text-primary whitespace-nowrap text-lg">
                                                {item.price.toFixed(2)} ₺
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleAvailability(item)}
                                                    className={`p-1.5 rounded-lg transition-colors ${item.isAvailable
                                                        ? "text-green-600 hover:bg-green-50"
                                                        : "text-slate-400 hover:bg-slate-100"
                                                        }`}
                                                    title={item.isAvailable ? "Pasife al" : "Aktife al"}
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {item.isAvailable ? "toggle_on" : "toggle_off"}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => openEditItem(item)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })
            )}

            {/* Item Form Modal */}
            {showItemForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">
                                {editingItem ? "edit" : "add_circle"}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={itemForm.name}
                                onChange={(e) =>
                                    setItemForm((f) => ({ ...f, name: e.target.value }))
                                }
                                placeholder="Ürün adı"
                                className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                            <input
                                type="text"
                                value={itemForm.description}
                                onChange={(e) =>
                                    setItemForm((f) => ({ ...f, description: e.target.value }))
                                }
                                placeholder="Açıklama (isteğe bağlı)"
                                className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                            <input
                                type="number"
                                step="0.01"
                                value={itemForm.price}
                                onChange={(e) =>
                                    setItemForm((f) => ({ ...f, price: e.target.value }))
                                }
                                placeholder="Fiyat (₺)"
                                className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setShowItemForm(false);
                                    setEditingItem(null);
                                }}
                                className="px-5 h-11 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                            >
                                İptal
                            </button>
                            <button
                                onClick={saveItem}
                                className="px-6 h-11 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold shadow-sm shadow-primary/20"
                            >
                                {editingItem ? "Güncelle" : "Ekle"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
