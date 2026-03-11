import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categoryId = req.nextUrl.searchParams.get("categoryId");

    let query: FirebaseFirestore.Query = adminDb
        .collection("items")
        .where("restaurantId", "==", session.restaurantId);

    if (categoryId) {
        query = adminDb
            .collection("items")
            .where("categoryId", "==", categoryId)
            .where("restaurantId", "==", session.restaurantId);
    }

    const snapshot = await query.get();
    const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Record<string, unknown>)
        .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));
    return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, price, categoryId, imageUrl } = await req.json();

    if (!name || price === undefined || !categoryId) {
        return NextResponse.json({ error: "Gerekli alanlar eksik" }, { status: 400 });
    }

    // Verify category ownership
    const catDoc = await adminDb.collection("categories").doc(categoryId).get();
    if (!catDoc.exists || catDoc.data()?.restaurantId !== session.restaurantId) {
        return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    // Get max order for this category
    const snapshot = await adminDb
        .collection("items")
        .where("categoryId", "==", categoryId)
        .get();

    let maxOrder = 0;
    snapshot.docs.forEach((doc) => {
        const order = doc.data().order ?? 0;
        if (order >= maxOrder) maxOrder = order + 1;
    });

    const ref = await adminDb.collection("items").add({
        name,
        description: description || "",
        price: Number(price),
        categoryId,
        restaurantId: session.restaurantId,
        isAvailable: true,
        order: maxOrder,
        imageUrl: imageUrl || "",
        createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
        id: ref.id,
        name,
        description: description || "",
        price: Number(price),
        categoryId,
        isAvailable: true,
        order: maxOrder,
        imageUrl: imageUrl || "",
    });
}

export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updates } = await req.json();
    if (!id) {
        return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    // Verify ownership
    const itemDoc = await adminDb.collection("items").doc(id).get();
    if (!itemDoc.exists || itemDoc.data()?.restaurantId !== session.restaurantId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowedFields = ["name", "description", "price", "isAvailable", "order", "imageUrl"];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (updates[key] !== undefined) {
            sanitized[key] = key === "price" ? Number(updates[key]) : updates[key];
        }
    }

    await adminDb.collection("items").doc(id).update(sanitized);
    return NextResponse.json({ id, ...sanitized });
}

export async function DELETE(req: NextRequest) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    const itemDoc = await adminDb.collection("items").doc(id).get();
    if (!itemDoc.exists || itemDoc.data()?.restaurantId !== session.restaurantId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await adminDb.collection("items").doc(id).delete();
    return NextResponse.json({ success: true });
}
