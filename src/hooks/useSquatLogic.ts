import { useRef, useMemo } from 'react';
import type { Pose } from '@tensorflow-models/pose-detection';
import type { SquatState } from '../types/pose';
import { analyzeFrame, createInitialState } from '../utils/repDetection';

export function useSquatLogic(poses: Pose[]): SquatState {
  const stateRef = useRef(createInitialState());

  const squatState = useMemo(() => {
    if (poses.length === 0 || !poses[0].keypoints) {
      return {
        phase: stateRef.current.phase,
        repCount: stateRef.current.repCount,
        currentFeedback: stateRef.current.feedback,
        kneeAngle: stateRef.current.kneeAngle,
        hipAngle: stateRef.current.hipAngle,
        torsoAngle: stateRef.current.torsoLean,
        deepestAngle: stateRef.current.deepestAngle,
      };
    }

    const newState = analyzeFrame(poses[0].keypoints, stateRef.current);
    stateRef.current = newState;

    return {
      phase: newState.phase,
      repCount: newState.repCount,
      currentFeedback: newState.feedback,
      kneeAngle: newState.kneeAngle,
      hipAngle: newState.hipAngle,
      torsoAngle: newState.torsoLean,
      deepestAngle: newState.deepestAngle,
    };
  }, [poses]);

  return squatState;
}
