import type { Keypoint } from '@tensorflow-models/pose-detection';
import type { SquatPhase, FormFeedback } from '../types/pose';
import { calculateAngle, torsoAngle, horizontalDistance, midpoint } from './angles';
import {
  MIN_KEYPOINT_SCORE,
  STANDING_KNEE_ANGLE,
  SQUAT_DEPTH_ANGLE,
  MAX_TORSO_LEAN,
  KNEE_CAVE_RATIO,
} from './thresholds';

interface RepDetectionState {
  phase: SquatPhase;
  repCount: number;
  feedback: FormFeedback[];
  kneeAngle: number;
  hipAngle: number;
  torsoLean: number;
  deepestAngle: number;
  hitDepth: boolean;
}

/**
 * Check if all required keypoints have sufficient confidence.
 */
function areKeypointsValid(keypoints: Keypoint[], indices: number[]): boolean {
  return indices.every(
    (i) => keypoints[i] && (keypoints[i].score ?? 0) >= MIN_KEYPOINT_SCORE
  );
}

/**
 * Analyze a single frame of pose data and return updated squat state.
 */
export function analyzeFrame(
  keypoints: Keypoint[],
  prevState: RepDetectionState
): RepDetectionState {
  // Required keypoint indices: shoulders(5,6), hips(11,12), knees(13,14), ankles(15,16)
  const requiredIndices = [5, 6, 11, 12, 13, 14, 15, 16];

  if (!areKeypointsValid(keypoints, requiredIndices)) {
    return {
      ...prevState,
      feedback: [{ message: 'Step back so your full body is visible', type: 'warning', icon: '📷' }],
    };
  }

  const leftShoulder = keypoints[5];
  const rightShoulder = keypoints[6];
  const leftHip = keypoints[11];
  const rightHip = keypoints[12];
  const leftKnee = keypoints[13];
  const rightKnee = keypoints[14];
  const leftAnkle = keypoints[15];
  const rightAnkle = keypoints[16];

  // Calculate angles (average of left and right sides)
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
  const hipAngle = (leftHipAngle + rightHipAngle) / 2;

  // Torso lean
  const midShoulder = midpoint(leftShoulder, rightShoulder);
  const midHip = midpoint(leftHip, rightHip);
  const torsoLean = torsoAngle(midShoulder, midHip);

  // Knee tracking
  const kneeWidth = horizontalDistance(leftKnee, rightKnee);
  const ankleWidth = horizontalDistance(leftAnkle, rightAnkle);
  const kneeCaveRatio = ankleWidth > 10 ? kneeWidth / ankleWidth : 1;

  // Determine phase and generate feedback
  const feedback: FormFeedback[] = [];
  let { phase, repCount, deepestAngle, hitDepth } = prevState;

  // Track deepest angle in current rep
  if (kneeAngle < deepestAngle) {
    deepestAngle = kneeAngle;
  }

  // Phase state machine
  if (phase === 'standing') {
    if (kneeAngle < STANDING_KNEE_ANGLE) {
      phase = 'descending';
      deepestAngle = kneeAngle;
      hitDepth = false;
    }
  } else if (phase === 'descending') {
    if (kneeAngle <= SQUAT_DEPTH_ANGLE) {
      phase = 'bottom';
      hitDepth = true;
    } else if (kneeAngle >= STANDING_KNEE_ANGLE) {
      // Went back up without hitting depth
      phase = 'standing';
      if (!hitDepth) {
        feedback.push({ message: 'Go lower', type: 'warning', icon: '⬇️' });
      }
    }
  } else if (phase === 'bottom') {
    if (kneeAngle > SQUAT_DEPTH_ANGLE + 10) {
      phase = 'ascending';
    }
  } else if (phase === 'ascending') {
    if (kneeAngle >= STANDING_KNEE_ANGLE) {
      phase = 'standing';
      if (hitDepth) {
        repCount += 1;
        feedback.push({ message: 'Good rep!', type: 'good', icon: '✅' });
      } else {
        feedback.push({ message: 'Stand up fully', type: 'warning', icon: '⬆️' });
      }
      deepestAngle = 180;
      hitDepth = false;
    }
  }

  // Real-time form checks (only during descent/bottom/ascent)
  if (phase !== 'standing') {
    // Depth feedback during descent
    if (phase === 'descending' && kneeAngle > SQUAT_DEPTH_ANGLE && kneeAngle < STANDING_KNEE_ANGLE) {
      feedback.push({ message: 'Go lower', type: 'warning', icon: '⬇️' });
    }

    // Torso lean check
    if (torsoLean > MAX_TORSO_LEAN) {
      feedback.push({ message: 'Chest up', type: 'error', icon: '🔄' });
    }

    // Knee cave check
    if (kneeCaveRatio < KNEE_CAVE_RATIO && kneeAngle < STANDING_KNEE_ANGLE) {
      feedback.push({ message: 'Knees out', type: 'error', icon: '🦵' });
    }
  }

  // Default feedback when standing
  if (feedback.length === 0 && phase === 'standing') {
    feedback.push({ message: 'Ready — start squatting', type: 'good', icon: '🏋️' });
  } else if (feedback.length === 0 && phase === 'bottom') {
    feedback.push({ message: 'Good depth! Stand up', type: 'good', icon: '✅' });
  }

  return {
    phase,
    repCount,
    feedback,
    kneeAngle: Math.round(kneeAngle),
    hipAngle: Math.round(hipAngle),
    torsoLean: Math.round(torsoLean),
    deepestAngle,
    hitDepth,
  };
}

/**
 * Create the initial rep detection state.
 */
export function createInitialState(): RepDetectionState {
  return {
    phase: 'standing',
    repCount: 0,
    feedback: [{ message: 'Loading pose model...', type: 'warning', icon: '⏳' }],
    kneeAngle: 180,
    hipAngle: 180,
    torsoLean: 0,
    deepestAngle: 180,
    hitDepth: false,
  };
}
