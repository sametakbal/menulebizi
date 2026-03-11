import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await adminDb
        .collection("restaurants")
        .doc(session.restaurantId)
        .get();

    if (!doc.exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PATCH(req: Request) {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await req.json();
    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    await adminDb
        .collection("restaurants")
        .doc(session.restaurantId)
        .update(updates);

    return NextResponse.json({ success: true });
}
