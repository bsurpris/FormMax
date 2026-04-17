# FormMax — AI Squat Form Checker

Real-time squat form analysis using TensorFlow.js MoveNet pose estimation, webcam input, and rule-based feedback.

## Features

- **Live webcam** with mirrored video feed
- **Pose detection** via MoveNet (SinglePose Lightning) — draws neon skeleton overlay
- **Rep counting** — tracks squat phases (standing → descending → bottom → ascending)
- **Form feedback** — real-time checks:
  - **Depth check** — "Go lower" if hips don't drop below knee level
  - **Standing check** — only counts a rep when fully standing
  - **Knee tracking** — "Knees out" if knees cave inward
  - **Torso angle** — "Chest up" if leaning too far forward
- **Angle dashboard** — live knee, hip, and torso angle readouts

## Tech Stack

- **React 19** + TypeScript
- **Vite** (dev server / bundler)
- **Tailwind CSS v4**
- **TensorFlow.js** + MoveNet pose estimation
- No backend required

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click **Start Workout**.

## Project Structure

```
src/
├── components/
│   ├── WebcamView.tsx      # Camera stream display
│   ├── PoseOverlay.tsx     # Skeleton/keypoint rendering
│   ├── RepCounter.tsx      # Rep count + phase display
│   ├── FeedbackPanel.tsx   # Form feedback messages
│   └── StartButton.tsx     # Start/stop controls
├── hooks/
│   ├── useWebcam.ts        # Camera lifecycle
│   ├── usePoseDetection.ts # MoveNet model + detection loop
│   └── useSquatLogic.ts    # Squat analysis bridge
├── utils/
│   ├── angles.ts           # Joint angle math
│   ├── thresholds.ts       # Configurable detection thresholds
│   └── repDetection.ts     # Phase state machine + form rules
├── types/
│   └── pose.ts             # TypeScript types + skeleton map
└── stubs/
    └── mediapipe-pose.ts   # Module stub for Vite compatibility
```

## How the Squat Logic Works

The rep detection uses a **phase state machine**:

```
standing → descending → bottom → ascending → standing (rep counted!)
```

Form checks run during each phase based on joint angles calculated from MoveNet keypoints.

## License

MIT
# FormMax
