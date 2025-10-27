
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useAttendance } from '../context/AttendanceContext';
import { CHECKPOINTS } from '../types';
import type { Checkpoint, Participant } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

const QR_READER_ID = "qr-reader";

const ScannerPage: React.FC = () => {
  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint>(CHECKPOINTS[0]);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const { logAttendance } = useAttendance();

  useEffect(() => {
    // This ref is used to cleanup in the return function.
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(QR_READER_ID);
    }
    const html5QrCode = html5QrCodeRef.current;

    const startScanner = async () => {
        setCameraError(null);
        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    try {
                        const parsedData: Participant = JSON.parse(decodedText);
                        if (parsedData.id && parsedData.name && parsedData.class) {
                            const result = logAttendance(parsedData.id, activeCheckpoint);
                            setScanResult({ type: result.success ? 'success' : 'error', message: result.message });
                        } else {
                            throw new Error("Invalid QR code format.");
                        }
                    } catch (error) {
                        setScanResult({ type: 'error', message: "Invalid QR Code. Please scan a valid participant code." });
                    }
                    setTimeout(() => setScanResult(null), 5000);
                },
                (errorMessage) => {
                    // console.warn(`QR Code no longer in front of camera.`, errorMessage);
                }
            );
        } catch (err) {
            console.error("Failed to start scanner", err);
            setCameraError('Camera permission denied or no camera found. Please check your browser settings.');
        }
    };
    
    startScanner();

    return () => {
        if (html5QrCodeRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
            html5QrCodeRef.current.stop().catch(e => console.error("Failed to stop scanner cleanly.", e));
        }
    };
  // We only want to run this on mount, checkpoint changes are handled by state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Scan QR Code</h2>
      <p className="text-gray-600 mb-6">Select a checkpoint and hold the QR code in front of the camera.</p>
      
      <div className="mb-6 bg-gray-100 p-2 rounded-full flex gap-2 shadow-inner">
        {CHECKPOINTS.map(checkpoint => (
          <button
            key={checkpoint}
            onClick={() => setActiveCheckpoint(checkpoint)}
            className={`px-6 py-2 rounded-full font-semibold transition-colors text-sm ${
              activeCheckpoint === checkpoint ? 'bg-brand-primary text-white shadow' : 'bg-transparent text-gray-700 hover:bg-brand-light'
            }`}
          >
            {checkpoint}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md mx-auto border-4 border-gray-300 rounded-2xl overflow-hidden shadow-lg mb-6 min-h-[300px] bg-gray-200">
        <div id={QR_READER_ID} className="w-full"></div>
      </div>
      
      <div className="w-full max-w-md h-20">
        {cameraError ? (
            <div
                className={`w-full p-4 rounded-lg flex items-center gap-4 animate-fade-in bg-red-100 text-red-800`}
                role="alert"
            >
                <XCircle />
                <span className="font-medium">{cameraError}</span>
            </div>
        ) : scanResult && (
            <div
            className={`w-full p-4 rounded-lg flex items-center gap-4 animate-fade-in ${
                scanResult.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
            >
            {scanResult.type === 'success' ? <CheckCircle /> : <XCircle />}
            <span className="font-medium">{scanResult.message}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
