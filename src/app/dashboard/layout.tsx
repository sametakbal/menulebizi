import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import AuthProvider from "@/components/AuthProvider";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <AuthProvider>
            <div className="min-h-screen bg-background-light">
                <DashboardNav />
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
            </div>
        </AuthProvider>
    );
}
