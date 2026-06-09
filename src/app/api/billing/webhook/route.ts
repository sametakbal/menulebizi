import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    if (WEBHOOK_SECRET) {
        const auth = req.headers.get("authorization");
        if (auth !== WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const body = await req.json();
    const event = body.event;

    if (!event?.app_user_id) {
        return NextResponse.json({ ok: true });
    }

    const restaurantId = event.app_user_id as string;
    const type = event.type as string;

    let subscriptionStatus: string | null = null;
    switch (type) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
        case "UNCANCELLATION":
            subscriptionStatus = "active";
            break;
        case "CANCELLATION":
            subscriptionStatus = "cancelled";
            break;
        case "EXPIRATION":
            subscriptionStatus = "expired";
            break;
    }

    if (subscriptionStatus) {
        await adminDb.collection("restaurants").doc(restaurantId).update({
            subscriptionStatus,
            subscriptionUpdatedAt: new Date().toISOString(),
        });
    }

    return NextResponse.json({ ok: true });
}
