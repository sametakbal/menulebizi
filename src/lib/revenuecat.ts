const SECRET_KEY = process.env.REVENUECAT_SECRET_KEY!;
const BASE_URL = "https://api.revenuecat.com/v1";

async function rcFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
            "Content-Type": "application/json",
        },
    });
    return res.json() as Promise<T>;
}

interface RCSubscriberResponse {
    subscriber: {
        management_url: string | null;
        entitlements: Record<string, {
            expires_date: string | null;
            product_identifier: string;
            purchase_date: string;
        }>;
    };
}

export function getSubscriber(appUserId: string): Promise<RCSubscriberResponse> {
    return rcFetch<RCSubscriberResponse>(`/subscribers/${encodeURIComponent(appUserId)}`);
}
