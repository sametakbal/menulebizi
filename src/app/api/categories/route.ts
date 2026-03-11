import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
        .collection("categories")
        .where("restaurantId", "==", session.restaurantId)
        .get();

    const categories = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Record<string, unknown>)
        .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));
    return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.restaurantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();
        if (!name) {
            return NextResponse.json({ error: "Kategori adı zorunludur" }, { status: 400 });
        }

        // Get current max order
        const snapshot = await adminDb
            .collection("categories")
            .where("restaurantId", "==", session.restaurantId)
            .get();

        let maxOrder = 0;
        snapshot.docs.forEach((doc) => {
            const order = doc.data().order ?? 0;
            if (order >= maxOrder) maxOrder = order + 1;
        });

        const ref = await adminDb.collection("categories").add({
            name,
            order: maxOrder,
            restaurantId: session.restaurantId,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: ref.id, name, order: maxOrder });
    } catch (error) {
        console.error("POST /api/categories error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    // Verify ownership
    const catDoc = await adminDb.collection("categories").doc(id).get();
    if (!catDoc.exists || catDoc.data()?.restaurantId !== session.restaurantId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete all items in this category
    const items = await adminDb.collection("items").where("categoryId", "==", id).get();
    const batch = adminDb.batch();
    items.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(catDoc.ref);
    await batch.commit();

    return NextResponse.json({ success: true });
}
