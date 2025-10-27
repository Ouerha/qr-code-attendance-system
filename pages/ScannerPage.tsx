import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useEvents } from '../components/EventContext';
import type { Participant } from '../types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const QR_READER_ID = "qr-reader";

const ScannerPage: React.FC = () => {
  const { logAttendanceInActiveEvent, activeEvent } = useEvents();
  const checkpoints = activeEvent?.checkpoints || [];
  const [activeCheckpoint, setActiveCheckpoint] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  useEffect(() => {
    // Set initial checkpoint without overriding user selection
    if (checkpoints.length > 0 && !activeCheckpoint) {
      setActiveCheckpoint(checkpoints[0]);
    } else if (checkpoints.length === 0) {
      setActiveCheckpoint('');
    }
  }, [checkpoints, activeCheckpoint]);


  useEffect(() => {
    // Do nothing if there's no event or selected checkpoint
    if (!activeEvent || !activeCheckpoint) return;

    if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(QR_READER_ID, { experimentalFeatures: { useOffscreenCanvas: false }});
    }
    const html5QrCode = html5QrCodeRef.current;

    const startScanner = async () => {
        try {
            // Stop the scanner if it's already running. This is important when switching checkpoints.
            if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
                await html5QrCode.stop();
            }
            await html5QrCode.start(
                // Use 'ideal' to prefer the rear camera without making it a strict requirement.
                // This prevents "NotFoundError" on devices without a rear camera (e.g., laptops).
                { facingMode: { ideal: "environment" } },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    try {
                        const parsedData: Participant = JSON.parse(decodedText);
                        if (parsedData.id && parsedData.name && parsedData.class) {
                            const result = logAttendanceInActiveEvent(parsedData.id, activeCheckpoint);
                            setScanResult({ type: result.success ? 'success' : 'error', message: result.message });
                        } else {
                            throw new Error("Invalid QR code format.");
                        }
                    } catch (error) {
                        setScanResult({ type: 'error', message: "Invalid QR Code. Please scan a valid participant code." });
                    }
                    setTimeout(() => setScanResult(null), 5000);
                },
                () => {}
            );
            setScanResult(null); // Clear previous results on successful start
            setIsScannerActive(true);
        } catch (err) {
            console.error("Failed to start scanner", err);
            setScanResult({ type: 'error', message: 'Camera permission denied or no camera found. Please check your browser settings.' });
            setIsScannerActive(false);
        }
    };
    
    startScanner();

    // Cleanup function to stop the scanner on component unmount or when checkpoint changes
    return () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
          html5QrCodeRef.current.stop().catch(err => {
            console.error("Failed to stop scanner on cleanup", err);
          });
        }
    };
  }, [activeCheckpoint, logAttendanceInActiveEvent, activeEvent]);

  if (!activeEvent) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-xl font-semibold text-yellow-800">No Active Event</h3>
        <p className="mt-2 text-gray-600">You must select an event before you can start scanning.</p>
        <Link to="/select-event" className="mt-4 inline-block bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors">
          Select Event
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-1">Scan QR Code</h2>
      <p className="text-gray-500 mb-6">Scanning for: <span className="font-semibold text-brand-primary">{activeEvent.name}</span></p>
      
      {checkpoints.length > 0 ? (
        <div className="mb-6 bg-gray-100 p-2 rounded-full flex flex-wrap justify-center gap-2 shadow-inner">
          {checkpoints.map(checkpoint => (
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
      ) : (
         <p className="text-yellow-600 bg-yellow-100 p-3 rounded-md mb-4">No checkpoints have been configured for this event.</p>
      )}

      <div className="w-full max-w-md mx-auto border-4 border-gray-300 rounded-2xl overflow-hidden shadow-lg mb-6">
        <div id={QR_READER_ID} className="w-full"></div>
      </div>
      
      {scanResult && (
        <div
          className={`w-full max-w-md p-4 rounded-lg flex items-center gap-4 animate-fade-in ${
            scanResult.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {scanResult.type === 'success' ? <CheckCircle /> : <XCircle />}
          <span className="font-medium">{scanResult.message}</span>
        </div>
      )}

      {!isScannerActive && !scanResult && checkpoints.length > 0 && (
        <div className="w-full max-w-md p-4 rounded-lg flex items-center gap-4 bg-yellow-100 text-yellow-800">
            <AlertTriangle />
            <span className="font-medium">Initializing camera... Please allow camera access.</span>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;