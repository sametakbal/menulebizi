import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// Public: call waiter from table
export async function POST(req: NextRequest) {
    const { restaurantId, tableNumber } = await req.json();

    if (!restaurantId || !tableNumber) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const restaurantDoc = await adminDb.collection("restaurants").doc(restaurantId).get();
    if (!restaurantDoc.exists) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Prevent spam: check for existing active call from same table
    const existing = await adminDb
        .collection("waiterCalls")
        .where("restaurantId", "==", restaurantId)
        .where("tableNumber", "==", String(tableNumber))
        .where("status", "==", "active")
        .limit(1)
        .get();

    if (!existing.empty) {
        return NextResponse.json({ id: existing.docs[0].id, status: "already_active" });
    }

    const ref = await adminDb.collection("waiterCalls").add({
        restaurantId,
        tableNumber: String(tableNumber),
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id, status: "active" });
}

// Dashboard: get waiter calls
export async function GET() {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
        .collection("waiterCalls")
        .where("restaurantId", "==", session.restaurantId)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .get();

    const calls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json(calls);
}

// Dashboard: dismiss waiter call
export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
        return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const callDoc = await adminDb.collection("waiterCalls").doc(id).get();
    if (!callDoc.exists || callDoc.data()?.restaurantId !== session.restaurantId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await adminDb.collection("waiterCalls").doc(id).update({ status: "dismissed" });
    return NextResponse.json({ success: true });
}
