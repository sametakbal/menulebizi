import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// Create session cookie from Firebase ID token
export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();
        if (!idToken) {
            return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
        }

        // 5 days expiry
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ success: true });
        response.cookies.set("session", sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}

// Delete session cookie (logout)
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", "", {
        maxAge: 0,
        httpOnly: true,
        path: "/",
    });
    return response;
}
