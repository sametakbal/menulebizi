"use client";

import QRCode from "@/components/QRCode";

export default function QRCodeSection({ url }: { url: string }) {
    return <QRCode url={url} />;
}
