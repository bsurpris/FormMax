import { useRef, useState, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type { Pose } from '@tensorflow-models/pose-detection';

interface UsePoseDetectionReturn {
  poses: Pose[];
  isModelLoaded: boolean;
  modelError: string | null;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
}

export function usePoseDetection(): UsePoseDetectionReturn {
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const rafRef = useRef<number>(0);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Load the model once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        // Ensure WebGL backend is ready
        await tf.setBackend('webgl');
        await tf.ready();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          }
        );

        if (!cancelled) {
          detectorRef.current = detector;
          setIsModelLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load pose model:', err);
          setModelError('Failed to load pose detection model. Try refreshing.');
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  const startDetection = useCallback((video: HTMLVideoElement) => {
    if (!detectorRef.current) return;

    async function detect() {
      if (!detectorRef.current || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const results = await detectorRef.current.estimatePoses(video, {
          flipHorizontal: false,
        });
        setPoses(results);
      } catch (err) {
        console.warn('Pose detection error:', err);
      }

      rafRef.current = requestAnimationFrame(detect);
    }

    rafRef.current = requestAnimationFrame(detect);
  }, []);

  const stopDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setPoses([]);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  return { poses, isModelLoaded, modelError, startDetection, stopDetection };
}
