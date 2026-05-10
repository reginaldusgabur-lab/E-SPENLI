'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig, Html5QrcodeResult } from 'html5-qrcode';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  scanSuccess: boolean;
}

const readerId = "qr-reader-component";

// This component encapsulates the html5-qrcode library.
// It is designed to be dynamically imported with ssr: false.
export function QrScanner({ onScanSuccess, scanSuccess }: QrScannerProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  
  // Use a ref to hold the callback to avoid re-running the effect when it changes
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  useEffect(() => {
    // This effect runs only once on mount to initialize and start the scanner.
    const qrCode = new Html5Qrcode(readerId, { verbose: false });
    html5QrCodeRef.current = qrCode;

    const config: Html5QrcodeCameraScanConfig = { fps: 5, aspectRatio: 1.0 };
    
    const successCallback = (decodedText: string, result: Html5QrcodeResult) => {
        // Wrap the call in a ref to avoid stale closures
        onScanSuccessRef.current(decodedText);
    };

    const errorCallback = (error: string) => {
      // Errors are frequent (e.g., QR not found), so we mostly ignore them.
    };
    
    qrCode.start({ facingMode: 'environment' }, config, successCallback, errorCallback as any)
      .then(() => {
        setIsScannerReady(true);
      })
      .catch(err => {
        console.error('Failed to start QR scanner', err);
      });

    // Cleanup function to stop the scanner when the component unmounts.
    return () => {
      if (qrCode?.isScanning) {
        qrCode.stop().catch(err => console.warn("Failed to stop QR Scanner cleanly.", err));
      }
    };
  }, []);
  
  const borderColor = scanSuccess ? 'border-green-500' : (isScannerReady ? 'border-white' : 'border-foreground');

  return (
    <>
      {/* The container for the video feed */}
      <div id={readerId} className="absolute inset-0 z-0 w-full h-full" />
      <style>{`
          #${readerId} > video { width: 100% !important; height: 100% !important; object-fit: cover !important; opacity: ${isScannerReady ? 1 : 0}; transition: opacity 0.5s ease-in-out; }
          #${readerId}__scan_region, #${readerId}__dashboard_section_csr { display: none !important; }
      `}</style>
      
      {/* The UI Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-between p-4 py-8 text-center w-full h-full pointer-events-none">
        <div className="w-full pointer-events-auto">
            <h1 className={cn("text-3xl font-bold tracking-tight", isScannerReady ? 'text-white' : 'text-foreground', 'dark:text-white')} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Pindai QR Code</h1>
            <p className={cn("mt-2", isScannerReady ? 'text-white/80' : 'text-muted-foreground', 'dark:text-white/80')} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Arahkan kamera ke QR Code yang ditampilkan.</p>
        </div>

        <div className="relative w-full max-w-[280px] sm:max-w-xs aspect-square">
            <div className={cn("absolute top-0 left-0 w-1/4 h-1/4 border-t-4 border-l-4 rounded-tl-xl transition-colors duration-300", borderColor)} />
            <div className={cn("absolute top-0 right-0 w-1/4 h-1/4 border-t-4 border-r-4 rounded-tr-xl transition-colors duration-300", borderColor)} />
            <div className={cn("absolute bottom-0 left-0 w-1/4 h-1/4 border-b-4 border-l-4 rounded-bl-xl transition-colors duration-300", borderColor)} />
            <div className={cn("absolute bottom-0 right-0 w-1/4 h-1/4 border-b-4 border-r-4 rounded-br-xl transition-colors duration-300", borderColor)} />
            
            {!isScannerReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground dark:text-white/80">
                    <Loader2 className="h-10 w-10 animate-spin text-foreground dark:text-white" />
                    <p className="mt-4 text-sm font-medium">Menyiapkan kamera...</p>
                </div>
            )}
            
            {isScannerReady && (
                <div className={cn("absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-red-500/70 shadow-[0_0_15px_3px_theme(colors.red.500)] animate-scan-line", { 'bg-green-400 shadow-[0_0_15px_3px_theme(colors.green.400)]': scanSuccess })} />
            )}
        </div>
        
        <div className="w-full max-w-md h-10 pointer-events-auto" />
      </div>
    </>
  );
}
