import type { Keypoint } from '@tensorflow-models/pose-detection';

/**
 * Calculate the angle (in degrees) at point B formed by the line segments BA and BC.
 * Returns a value between 0 and 180.
 */
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Calculate the midpoint between two keypoints.
 */
export function midpoint(a: Keypoint, b: Keypoint): Keypoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    score: Math.min(a.score ?? 0, b.score ?? 0),
    name: 'midpoint',
  };
}

/**
 * Calculate the horizontal distance between two keypoints.
 */
export function horizontalDistance(a: Keypoint, b: Keypoint): number {
  return Math.abs(a.x - b.x);
}

/**
 * Calculate the angle of the torso relative to vertical.
 * 0 degrees = perfectly upright, 90 degrees = horizontal.
 */
export function torsoAngle(shoulder: Keypoint, hip: Keypoint): number {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  // Angle from vertical (straight up is 0)
  const angleFromVertical = Math.abs(Math.atan2(dx, -dy) * (180 / Math.PI));
  return angleFromVertical;
}
