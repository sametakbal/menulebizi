"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    categoryId: string;
    imageUrl?: string;
}

interface Category {
    id: string;
    name: string;
    order: number;
}

export default function MenuManagementPage() {
    const { t } = useLanguage();
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
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            console.error("Failed to load data");
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
        if (!confirm(t("menu.confirmDeleteCategory")))
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
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl("");
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
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(item.imageUrl || "");
        setShowItemForm(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const uploadImage = async (file: File, itemId: string): Promise<string> => {
        const ext = file.name.split(".").pop();
        const storageRef = ref(storage, `items/${itemId}/image.${ext}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    };

    const patchItem = (id: string, data: Record<string, unknown>) =>
        fetch("/api/items", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data }),
        });

    const updateExistingItem = async () => {
        if (!editingItem) return;
        let imageUrl = existingImageUrl;

        if (imageFile) {
            if (editingItem.imageUrl) {
                try { await deleteObject(ref(storage, editingItem.imageUrl)); } catch { /* ignore */ }
            }
            imageUrl = await uploadImage(imageFile, editingItem.id);
        }

        const updates = {
            name: itemForm.name.trim(),
            description: itemForm.description.trim(),
            price: Number.parseFloat(itemForm.price),
            imageUrl,
        };
        const res = await patchItem(editingItem.id, updates);
        if (res.ok) {
            setItems((prev) => prev.map((i) => i.id === editingItem.id ? { ...i, ...updates } : i));
        }
    };

    const createNewItem = async () => {
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: itemForm.name.trim(),
                description: itemForm.description.trim(),
                price: Number.parseFloat(itemForm.price),
                categoryId: itemForm.categoryId,
            }),
        });
        if (!res.ok) return;
        const item = await res.json();

        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, item.id);
            await patchItem(item.id, { imageUrl });
            item.imageUrl = imageUrl;
        }

        setItems((prev) => [...prev, item]);
    };

    const saveItem = async () => {
        if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) return;
        setUploadingImage(true);

        try {
            if (editingItem) {
                await updateExistingItem();
            } else {
                await createNewItem();
            }
        } finally {
            setUploadingImage(false);
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
        if (!confirm(t("menu.confirmDeleteItem"))) return;
        const item = items.find((i) => i.id === id);
        const res = await fetch("/api/items", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setItems((prev) => prev.filter((i) => i.id !== id));
            // Delete image from storage if exists
            if (item?.imageUrl) {
                try {
                    const imgRef = ref(storage, item.imageUrl);
                    await deleteObject(imgRef);
                } catch {
                    // ignore
                }
            }
        }
    };

    const currentImage = imagePreview || existingImageUrl;

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
                <h1 className="text-2xl font-black text-slate-900">{t("menu.title")}</h1>
                <p className="text-slate-500 mt-1">{t("menu.subtitle")}</p>
            </div>

            {/* Add Category */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    <h2 className="text-lg font-bold text-slate-900">{t("menu.addCategoryTitle")}</h2>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCategory()}
                        placeholder={t("menu.categoryPlaceholder")}
                        className="flex-1 px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <button
                        onClick={addCategory}
                        className="px-6 h-12 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold shadow-sm shadow-primary/20"
                    >
                        {t("menu.addButton")}
                    </button>
                </div>
            </div>

            {/* Categories & Items */}
            {categories.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3 block">restaurant_menu</span>
                    {t("menu.noCategories")}
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
                                        {" "}{t("menu.addItem")}
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(cat.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                        {" "}{t("menu.deleteCategory")}
                                    </button>
                                </div>
                            </div>

                            {catItems.length === 0 ? (
                                <div className="px-6 py-10 text-center text-slate-400 text-sm">
                                    <span className="material-symbols-outlined text-3xl mb-2 block">inventory_2</span>
                                    {t("menu.noItems")}
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {catItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                                        >
                                            {item.imageUrl ? (
                                                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-slate-300 text-2xl">image</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className={`font-semibold ${item.isAvailable
                                                            ? "text-slate-900"
                                                            : "text-slate-400 line-through"
                                                            }`}
                                                    >
                                                        {item.name}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isAvailable
                                                        ? "bg-green-50 text-green-700 border border-green-200"
                                                        : "bg-slate-100 text-slate-500 border border-slate-200"
                                                        }`}>
                                                        {item.isAvailable ? t("menu.active") : t("menu.inactive")}
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
                                                    title={item.isAvailable ? t("menu.deactivate") : t("menu.activate")}
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {item.isAvailable ? "toggle_on" : "toggle_off"}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => openEditItem(item)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={t("menu.edit")}
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={t("menu.delete")}
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
                                {editingItem ? t("menu.editItemTitle") : t("menu.newItemTitle")}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={itemForm.name}
                                onChange={(e) =>
                                    setItemForm((f) => ({ ...f, name: e.target.value }))
                                }
                                placeholder={t("menu.itemName")}
                                className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                            <input
                                type="text"
                                value={itemForm.description}
                                onChange={(e) =>
                                    setItemForm((f) => ({ ...f, description: e.target.value }))
                                }
                                placeholder={t("menu.itemDescription")}
                                className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                            <input
                                type="number"
                                step="0.01"
                                value={itemForm.price}
                                onChange={(e) =>
                                    setItemForm((f) => ({ ...f, price: e.target.value }))
                                }
                                placeholder={t("menu.itemPrice")}
                                className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />

                            {/* Image Upload */}
                            <div>
                                {currentImage ? (
                                    <div className="relative">
                                        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
                                            <Image
                                                src={currentImage}
                                                alt="Ürün resmi"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow border border-slate-200 text-slate-500 hover:text-red-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-primary/40 hover:text-primary/60 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                        <span className="text-sm font-medium">{t("menu.addImage")}</span>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                {currentImage && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 text-sm text-primary hover:underline"
                                    >
                                        {t("menu.changeImage")}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setShowItemForm(false);
                                    setEditingItem(null);
                                }}
                                className="px-5 h-11 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                            >
                                {t("menu.cancel")}
                            </button>
                            <button
                                onClick={saveItem}
                                disabled={uploadingImage}
                                className="px-6 h-11 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold shadow-sm shadow-primary/20 disabled:opacity-60 flex items-center gap-2"
                            >
                                {uploadingImage && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                )}
                                {editingItem ? t("menu.update") : t("menu.addButton")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
