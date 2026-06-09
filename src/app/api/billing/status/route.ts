import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await adminDb.collection("restaurants").doc(session.restaurantId).get();
    if (!doc.exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = doc.data()!;
    const trialEndsAt = data.trialEndsAt as string | undefined;
    const subscriptionStatus = (data.subscriptionStatus as string) || "trial";
    const subscriptionReferenceCode = data.subscriptionReferenceCode as string | undefined;

    const now = new Date();
    let status = subscriptionStatus;
    let daysRemaining = 0;

    if (subscriptionStatus === "trial" && trialEndsAt) {
        const trialEnd = new Date(trialEndsAt);
        if (trialEnd <= now) {
            status = "expired";
        } else {
            daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }
    }

    return NextResponse.json({
        status,
        trialEndsAt: trialEndsAt || null,
        daysRemaining,
        subscriptionReferenceCode: subscriptionReferenceCode || null,
        appUserId: session.restaurantId,
    });
}
