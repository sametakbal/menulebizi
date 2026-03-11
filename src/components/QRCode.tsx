"use client";

import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";
import { useLanguage } from "@/contexts/LanguageContext";

export default function QRCode({ url }: { readonly url: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (canvasRef.current) {
            QRCodeLib.toCanvas(canvasRef.current, url, {
                width: 200,
                margin: 2,
                color: { dark: "#000000", light: "#ffffff" },
            });
        }
    }, [url]);

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement("a");
        link.download = "menu-qr-code.png";
        link.href = canvasRef.current.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <canvas ref={canvasRef} />
            </div>
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm rounded-xl hover:bg-primary/90 transition-colors font-bold shadow-sm shadow-primary/20"
            >
                <span className="material-symbols-outlined text-lg">download</span>
                {t("dashboard.downloadQR")}
            </button>
        </div>
    );
}
