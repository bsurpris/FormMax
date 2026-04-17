import { useRef, useCallback, useEffect, useState } from 'react';
import { useWebcam } from './hooks/useWebcam';
import { usePoseDetection } from './hooks/usePoseDetection';
import { useSquatLogic } from './hooks/useSquatLogic';
import { WebcamView } from './components/WebcamView';
import { PoseOverlay } from './components/PoseOverlay';
import { RepCounter } from './components/RepCounter';
import { FeedbackPanel } from './components/FeedbackPanel';
import { StartButton } from './components/StartButton';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { videoRef, isStreaming, error: camError, startCamera, stopCamera } = useWebcam();
  const { poses, isModelLoaded, modelError, startDetection, stopDetection } = usePoseDetection();
  const squatState = useSquatLogic(poses);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = useCallback(async () => {
    console.log('[FormMax] Start button clicked, isModelLoaded:', isModelLoaded);
    setIsStarting(true);
    await startCamera();
    setIsStarting(false);
  }, [startCamera, isModelLoaded]);

  // Start pose detection once video is streaming and ready
  useEffect(() => {
    if (isStreaming && videoRef.current && isModelLoaded) {
      console.log('[FormMax] Starting pose detection...');
      // Small delay to let video element settle
      const timer = setTimeout(() => {
        if (videoRef.current) {
          startDetection(videoRef.current);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, isModelLoaded, startDetection, videoRef]);

  const handleStop = useCallback(() => {
    stopDetection();
    stopCamera();
  }, [stopDetection, stopCamera]);

  const errorMessage = camError || modelError;

  return (
    <>
      <div className="ambient-bg" />

      <div className="min-h-dvh flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black shadow-lg shadow-purple-500/20">
              F
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FormMax</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Squat Form Checker</p>
            </div>
          </div>

          {isStreaming && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="pulse-dot" />
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Live</span>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
          {/* Left: Video Feed */}
          <div className="flex-1 flex flex-col gap-4">
            {isStreaming ? (
              <>
                <WebcamView videoRef={videoRef} canvasRef={canvasRef} />
                <PoseOverlay canvasRef={canvasRef} videoRef={videoRef} poses={poses} />
              </>
            ) : (
              /* Landing / Idle State */
              <div className="flex-1 flex flex-col items-center justify-center gap-8 glass-card p-12 min-h-[400px]">
                <div className="text-6xl">🏋️</div>
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Real-Time Squat Analysis
                  </h2>
                  <p className="text-white/40 text-sm max-w-md leading-relaxed">
                    Position yourself so your full body is visible in the camera.
                    FormMax will track your movement and provide instant feedback on your form.
                  </p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {['Rep Counting', 'Depth Check', 'Knee Tracking', 'Posture Analysis'].map((feat) => (
                    <span key={feat} className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white/30 bg-white/5 border border-white/5">
                      {feat}
                    </span>
                  ))}
                </div>

                <StartButton
                  isStreaming={isStreaming}
                  isModelLoaded={isModelLoaded}
                  onStart={handleStart}
                  onStop={handleStop}
                />

                {!isModelLoaded && (
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading MoveNet pose detection model...
                  </div>
                )}
              </div>
            )}

            {/* Error display */}
            {errorMessage && (
              <div className="px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-medium">
                ⚠️ {errorMessage}
              </div>
            )}
          </div>

          {/* Right: Stats Panel (visible when streaming) */}
          {isStreaming && (
            <div className="lg:w-80 flex flex-col gap-4">
              {/* Rep Counter Card */}
              <div className="glass-card p-8 flex flex-col items-center">
                <RepCounter
                  repCount={squatState.repCount}
                  phase={squatState.phase}
                  kneeAngle={squatState.kneeAngle}
                />
              </div>

              {/* Feedback Card */}
              <div className="glass-card p-5 flex-1">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4">
                  Form Feedback
                </h3>
                <FeedbackPanel feedback={squatState.currentFeedback} />
              </div>

              {/* Quick Stats */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-3">
                  Angles
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-indigo-300">{squatState.kneeAngle}°</div>
                    <div className="text-[10px] text-white/30 uppercase font-semibold">Knee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-purple-300">{squatState.hipAngle}°</div>
                    <div className="text-[10px] text-white/30 uppercase font-semibold">Hip</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-pink-300">{squatState.torsoAngle}°</div>
                    <div className="text-[10px] text-white/30 uppercase font-semibold">Torso</div>
                  </div>
                </div>
              </div>

              {/* Stop Button */}
              <div className="flex justify-center pt-2">
                <StartButton
                  isStreaming={isStreaming}
                  isModelLoaded={isModelLoaded}
                  onStart={handleStart}
                  onStop={handleStop}
                />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/20 font-medium">
            FormMax — Powered by TensorFlow.js MoveNet
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
