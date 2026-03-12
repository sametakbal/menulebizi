import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// Public: create order from table
export async function POST(req: NextRequest) {
    const { restaurantId, tableNumber, items, note } = await req.json();

    if (!restaurantId || !tableNumber || !items?.length) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate restaurant exists and orders are enabled
    const restaurantDoc = await adminDb.collection("restaurants").doc(restaurantId).get();
    if (!restaurantDoc.exists) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }
    if (!restaurantDoc.data()?.ordersEnabled) {
        return NextResponse.json({ error: "Orders not enabled" }, { status: 403 });
    }

    // Validate items exist and belong to this restaurant
    const validItems: { id: string; name: string; price: number; quantity: number }[] = [];
    for (const item of items) {
        if (!item.id || !item.quantity || item.quantity < 1) continue;
        const itemDoc = await adminDb.collection("items").doc(item.id).get();
        if (!itemDoc.exists || itemDoc.data()?.restaurantId !== restaurantId) continue;
        const data = itemDoc.data()!;
        validItems.push({
            id: item.id,
            name: data.name,
            price: data.price,
            quantity: Math.min(Math.floor(item.quantity), 50),
        });
    }

    if (validItems.length === 0) {
        return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    const ref = await adminDb.collection("orders").add({
        restaurantId,
        tableNumber: String(tableNumber),
        items: validItems,
        note: typeof note === "string" ? note.slice(0, 500) : "",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id, status: "pending" });
}

// Dashboard: get orders
export async function GET() {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
        .collection("orders")
        .where("restaurantId", "==", session.restaurantId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

    const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json(orders);
}

// Dashboard: update order status
export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !["confirmed", "preparing", "ready", "completed", "cancelled"].includes(status)) {
        return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const orderDoc = await adminDb.collection("orders").doc(id).get();
    if (!orderDoc.exists || orderDoc.data()?.restaurantId !== session.restaurantId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await adminDb.collection("orders").doc(id).update({ status });
    return NextResponse.json({ success: true });
}
