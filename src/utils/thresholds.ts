/**
 * Thresholds for squat form detection.
 * All angles are in degrees.
 */

// Minimum confidence score to consider a keypoint valid
export const MIN_KEYPOINT_SCORE = 0.3;

// Knee angle thresholds
export const STANDING_KNEE_ANGLE = 160; // Above this = standing
export const SQUAT_DEPTH_ANGLE = 100;   // Below this = good depth
export const PARTIAL_SQUAT_ANGLE = 130;  // Below standing but above depth = partial

// Torso angle thresholds  
export const MAX_TORSO_LEAN = 45;       // More than this = too much forward lean

// Knee tracking: ratio of knee-width to foot-width
// If knees are narrower than feet by this ratio, "knees inward"
export const KNEE_CAVE_RATIO = 0.75;

// How many frames to hold a phase before transitioning
export const PHASE_HOLD_FRAMES = 3;

// Smoothing factor for angle values (0 = no smoothing, 1 = full smoothing)
export const ANGLE_SMOOTHING = 0.3;
