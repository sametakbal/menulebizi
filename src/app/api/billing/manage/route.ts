import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSubscriber } from "@/lib/revenuecat";

export const runtime = "nodejs";

export async function GET() {
    const session = await getSession();
    if (!session?.restaurantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await getSubscriber(session.restaurantId);
        return NextResponse.json({ managementUrl: data.subscriber.management_url });
    } catch {
        return NextResponse.json({ error: "Servis hatası" }, { status: 500 });
    }
}
