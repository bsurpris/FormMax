import type { Keypoint } from '@tensorflow-models/pose-detection';

export interface PoseKeypoints {
  nose: Keypoint;
  leftEye: Keypoint;
  rightEye: Keypoint;
  leftEar: Keypoint;
  rightEar: Keypoint;
  leftShoulder: Keypoint;
  rightShoulder: Keypoint;
  leftElbow: Keypoint;
  rightElbow: Keypoint;
  leftWrist: Keypoint;
  rightWrist: Keypoint;
  leftHip: Keypoint;
  rightHip: Keypoint;
  leftKnee: Keypoint;
  rightKnee: Keypoint;
  leftAnkle: Keypoint;
  rightAnkle: Keypoint;
}

export type SquatPhase = 'standing' | 'descending' | 'bottom' | 'ascending';

export interface FormFeedback {
  message: string;
  type: 'good' | 'warning' | 'error';
  icon: string;
}

export interface SquatState {
  phase: SquatPhase;
  repCount: number;
  currentFeedback: FormFeedback[];
  kneeAngle: number;
  hipAngle: number;
  torsoAngle: number;
  deepestAngle: number;
}

export const KEYPOINT_INDICES: Record<keyof PoseKeypoints, number> = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16,
};

// MoveNet skeleton connections for drawing
export const SKELETON_CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4],       // head
  [5, 6],                                  // shoulders
  [5, 7], [7, 9], [6, 8], [8, 10],       // arms
  [5, 11], [6, 12],                        // torso
  [11, 12],                                // hips
  [11, 13], [13, 15], [12, 14], [14, 16], // legs
];
