import { useEffect, useRef } from 'react';
import type { Pose } from '@tensorflow-models/pose-detection';
import { SKELETON_CONNECTIONS } from '../types/pose';
import { MIN_KEYPOINT_SCORE } from '../utils/thresholds';

interface PoseOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  poses: Pose[];
}

// Neon color palette for joints and skeleton
const JOINT_COLOR = '#00f5d4';
const SKELETON_COLOR = 'rgba(0, 245, 212, 0.5)';
const JOINT_GLOW = '#00f5d4';

export function PoseOverlay({ canvasRef, videoRef, poses }: PoseOverlayProps) {
  const prevRef = useRef(poses);
  prevRef.current = poses;

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      if (!canvas || !video || !ctx) return;

      // Match canvas dimensions to video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentPoses = prevRef.current;
      if (currentPoses.length === 0) return;

      const keypoints = currentPoses[0].keypoints;

      // Draw skeleton connections
      ctx.strokeStyle = SKELETON_COLOR;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      for (const [i, j] of SKELETON_CONNECTIONS) {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        if (
          (kp1.score ?? 0) >= MIN_KEYPOINT_SCORE &&
          (kp2.score ?? 0) >= MIN_KEYPOINT_SCORE
        ) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.stroke();
        }
      }

      // Draw keypoints
      for (const kp of keypoints) {
        if ((kp.score ?? 0) >= MIN_KEYPOINT_SCORE) {
          // Glow effect
          ctx.shadowColor = JOINT_GLOW;
          ctx.shadowBlur = 12;
          ctx.fillStyle = JOINT_COLOR;
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Run drawing on animation frame loop
    let rafId: number;
    function loop() {
      draw();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [canvasRef, videoRef]);

  return null; // Renders to canvas via ref
}
