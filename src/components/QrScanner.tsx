import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (data: string) => void;
}

const QrScanner = ({ onScan }: QrScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  const startScanner = async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          // Brief pause to prevent duplicate scans
          scanner.pause();
          setTimeout(() => {
            try { scanner.resume(); } catch {}
          }, 2000);
        },
        () => {} // ignore errors during scanning
      );
      setIsScanning(true);
    } catch (err: unknown) {
      setError(
        err?.message?.includes("NotAllowed")
          ? "Camera access denied. Please allow camera permissions."
          : "Could not start camera. Make sure no other app is using it."
      );
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current?.clear();
    } catch {}
    scannerRef.current = null;
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-primary" />
          QR Code Scanner
        </h3>
        <Button
          size="sm"
          variant={isScanning ? "destructive" : "hero"}
          className="rounded-full gap-1.5"
          onClick={isScanning ? stopScanner : startScanner}
        >
          {isScanning ? (
            <><CameraOff className="h-3.5 w-3.5" /> Stop</>
          ) : (
            <><Camera className="h-3.5 w-3.5" /> Scan QR</>
          )}
        </Button>
      </div>

      <div
        id={containerId}
        className={`rounded-xl overflow-hidden border-2 transition-all ${
          isScanning
            ? "border-primary bg-black aspect-square max-w-sm mx-auto"
            : "border-dashed border-border h-0"
        }`}
      />

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {isScanning && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">
          Point your camera at the attendee's ticket QR code
        </p>
      )}
    </div>
  );
};

export default QrScanner;
