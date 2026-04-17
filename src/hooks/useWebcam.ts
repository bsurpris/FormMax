import { useRef, useState, useCallback, useEffect } from 'react';

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isStreaming: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log('[FormMax] Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      console.log('[FormMax] Camera access granted');
      // Store stream in state — this triggers re-render so <video> element appears
      setStream(mediaStream);
      setIsStreaming(true);
    } catch (err) {
      console.error('[FormMax] Camera error:', err);
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : 'Could not access camera. Make sure no other app is using it.';
      setError(message);
      setIsStreaming(false);
    }
  }, []);

  // Attach stream to video element once both are available
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    console.log('[FormMax] Attaching stream to video element');
    video.srcObject = stream;
    video.play().catch((err) => {
      console.error('[FormMax] Video play error:', err);
    });
  }, [stream, isStreaming]); // isStreaming dependency ensures video element exists

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsStreaming(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return { videoRef, stream, isStreaming, error, startCamera, stopCamera };
}
