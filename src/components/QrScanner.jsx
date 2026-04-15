"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function QrScanner({ onScanSuccess }) {
  useEffect(() => {
    // Configuramos para que prefiera la cámara trasera ("environment")
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      supportedScanTypes: [0], // 0 es para cámaras
    });

    scanner.render(onScanSuccess, (error) => {
      // Errores de escaneo silenciosos
    });

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border-2 border-dashed border-gray-300 p-4">
      <div id="reader"></div>
    </div>
  );
}
