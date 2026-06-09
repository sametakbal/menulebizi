import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        // Verify the Firebase ID token from Authorization header
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decoded = await adminAuth.verifyIdToken(idToken);

        const { name, restaurantName } = await req.json();

        if (!name || !restaurantName) {
            return NextResponse.json({ error: "Tüm alanlar zorunludur" }, { status: 400 });
        }

        // Check if user doc already exists
        const existingUser = await adminDb
            .collection("users")
            .where("uid", "==", decoded.uid)
            .limit(1)
            .get();

        if (!existingUser.empty) {
            return NextResponse.json({ error: "Bu kullanıcı zaten kayıtlı" }, { status: 400 });
        }

        // Create slug from restaurant name
        const slug = restaurantName
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Check if slug exists
        const existingSlug = await adminDb
            .collection("restaurants")
            .where("slug", "==", slug)
            .limit(1)
            .get();

        if (!existingSlug.empty) {
            return NextResponse.json(
                { error: "Bu restoran adı zaten kullanılıyor" },
                { status: 400 }
            );
        }

        // Create restaurant with 30-day trial
        const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const restaurantRef = await adminDb.collection("restaurants").add({
            name: restaurantName,
            slug,
            phone: "",
            createdAt: new Date().toISOString(),
            subscriptionStatus: "trial",
            trialEndsAt,
        });

        // Create user doc linked to Firebase Auth uid
        await adminDb.collection("users").add({
            uid: decoded.uid,
            name,
            email: decoded.email,
            restaurantId: restaurantRef.id,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, slug });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
