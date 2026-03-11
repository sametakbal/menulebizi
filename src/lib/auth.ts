import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export interface SessionUser {
    uid: string;
    email: string;
    restaurantId: string;
}

/**
 * Verify the Firebase session cookie and return the authenticated user info.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return null;

    try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

        // Look up the user's restaurantId from Firestore
        const userSnap = await adminDb
            .collection("users")
            .where("uid", "==", decoded.uid)
            .limit(1)
            .get();

        if (userSnap.empty) return null;

        const userData = userSnap.docs[0].data();
        return {
            uid: decoded.uid,
            email: decoded.email || "",
            restaurantId: userData.restaurantId,
        };
    } catch {
        return null;
    }
}
