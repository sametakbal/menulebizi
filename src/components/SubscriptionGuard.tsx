"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Props {
    readonly isExpired: boolean;
}

export default function SubscriptionGuard({ isExpired }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isExpired && pathname !== "/dashboard/billing") {
            router.push("/dashboard/billing");
        }
    }, [isExpired, pathname, router]);

    return null;
}
