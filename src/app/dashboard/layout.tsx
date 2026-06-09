import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import AuthProvider from "@/components/AuthProvider";
import SubscriptionGuard from "@/components/SubscriptionGuard";

export default async function DashboardLayout({
    children,
}: {
    readonly children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    // Check subscription status
    const restaurantDoc = await adminDb.collection("restaurants").doc(session.restaurantId).get();
    const restaurant = restaurantDoc.data();
    const subscriptionStatus = (restaurant?.subscriptionStatus as string) || "trial";
    const trialEndsAt = restaurant?.trialEndsAt as string | undefined;

    const now = new Date();
    const isExpired =
        subscriptionStatus === "expired" ||
        (subscriptionStatus === "trial" && !!trialEndsAt && new Date(trialEndsAt) < now);

    return (
        <AuthProvider>
            <div className="min-h-screen bg-background-light">
                <SubscriptionGuard isExpired={isExpired} />
                <DashboardNav />
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
            </div>
        </AuthProvider>
    );
}
