import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimalProfile } from '../types';
import { ANIMALS_DATA } from '../data/animals';
import { Camera, RefreshCw, Sparkles, Zap, ZapOff, Settings, AlertCircle, Eye, Gauge, X, Loader2 } from 'lucide-react';
import { initWebGLContext, animalIdToNumeric, WebGLProgramContext } from '../utils/webglRenderer';
import { explainCameraScene } from '../services/gemini';

interface CameraCanvasProps {
  selectedAnimal: AnimalProfile;
  onSelectAnimal: (animal: AnimalProfile) => void;
  onCaptureSnapshot: (dataUrl: string) => void;
  onRequestCamera: () => void;
  cameraError: string | null;
  onNavigateToAI: () => void;
  onNavigateToSettings: () => void;
}

const DEMO_IMAGE_URL = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80';

export const CameraCanvas: React.FC<CameraCanvasProps> = React.memo(({
  selectedAnimal,
  onSelectAnimal,
  onCaptureSnapshot,
  onRequestCamera,
  cameraError,
  onNavigateToAI,
  onNavigateToSettings,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const webglCtxRef = useRef<WebGLProgramContext | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [flashToast, setFlashToast] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  // AI Explanation Modal state
  const [isAiExplaining, setIsAiExplaining] = useState<boolean>(false);
  const [aiExplanationText, setAiExplanationText] = useState<string | null>(null);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState<boolean>(false);

  const handleExplainScene = async () => {
    setIsExplanationModalOpen(true);
    setIsAiExplaining(true);
    try {
      const text = await explainCameraScene({
        animal: selectedAnimal,
        filterSettings: selectedAnimal.shaderConfig,
      });
      setAiExplanationText(text);
    } catch (e: any) {
      setAiExplanationText(`Unable to retrieve scene explanation: ${e.message || 'Error connecting to Gemini'}`);
    } finally {
      setIsAiExplaining(false);
    }
  };

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());

  // Auto-scroll filter carousel to selected animal
  useEffect(() => {
    if (carouselRef.current) {
      const selectedEl = document.getElementById(`filter-lens-${selectedAnimal.id}`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedAnimal.id]);

  // Handle Flash button toggle
  const handleToggleFlash = () => {
    const nextMode = flashMode === 'off' ? 'on' : flashMode === 'on' ? 'auto' : 'off';
    setFlashMode(nextMode);
    const label = nextMode === 'on' ? 'Flash: On' : nextMode === 'auto' ? 'Flash: Auto' : 'Flash: Off';
    setFlashToast(label);
    setTimeout(() => setFlashToast(null), 1800);
  };

  // Camera stream initialization with demo image fallback
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    navigator.mediaDevices?.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 60, max: 60 }
      },
      audio: false,
    }).then((stream) => {
      currentStream = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
        setStreamActive(true);
      }
    }).catch((err) => {
      console.warn('Camera stream unavailable, using demo sample:', err);
      setStreamActive(false);
    });

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  // Load fallback demo image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = DEMO_IMAGE_URL;
    img.onload = () => {
      imageRef.current = img;
    };
  }, []);

  // Main 60 FPS WebGL Shader Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!webglCtxRef.current) {
      webglCtxRef.current = initWebGLContext(canvas);
    }

    const webgl = webglCtxRef.current;
    if (!webgl) return;

    const { gl, program, uniforms, texture, prevTexture } = webgl;
    let startTime = performance.now();

    const render = (now: number) => {
      const elapsedTime = (now - startTime) / 1000;

      // FPS Calculation
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      if (delta > 0) {
        frameTimesRef.current.push(1000 / delta);
        if (frameTimesRef.current.length > 30) {
          frameTimesRef.current.shift();
          const avgFps = Math.round(
            frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
          );
          setFps(Math.min(60, avgFps));
        }
      }

      let sourceElement: HTMLVideoElement | HTMLImageElement | null = null;
      if (videoRef.current && streamActive && videoRef.current.readyState >= 2) {
        sourceElement = videoRef.current;
      } else if (imageRef.current && imageRef.current.complete) {
        sourceElement = imageRef.current;
      }

      gl.useProgram(program);
      gl.viewport(0, 0, canvas.width, canvas.height);

      if (sourceElement) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, prevTexture);
        gl.uniform1i(uniforms.u_prevTexture, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceElement);
        } catch {
          // ignore transient video decode frame
        }
        gl.uniform1i(uniforms.u_texture, 0);
      }

      gl.uniform1f(uniforms.u_time, elapsedTime);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1i(uniforms.u_animalId, animalIdToNumeric(selectedAnimal.id));
      gl.uniform1f(uniforms.u_intensity, 1.0);

      const nightGainVal = selectedAnimal.shaderConfig.nightGain || 1.0;
      gl.uniform1f(uniforms.u_nightGain, nightGainVal);

      const zoomLevel = selectedAnimal.shaderConfig.foveaZoom ? 2.5 : 1.0;
      gl.uniform1f(uniforms.u_zoomLevel, zoomLevel);
      gl.uniform1f(uniforms.u_compoundScale, 50.0);
      gl.uniform1f(uniforms.u_motionSensitivity, 60.0);

      if (selectedAnimal.shaderConfig.colorMatrix && selectedAnimal.shaderConfig.colorMatrix.length >= 9) {
        const cm = selectedAnimal.shaderConfig.colorMatrix;
        const mat3 = new Float32Array([
          cm[0], cm[1], cm[2],
          cm[4], cm[5], cm[6],
          cm[8], cm[9], cm[10],
        ]);
        gl.uniformMatrix3fv(uniforms.u_colorMatrix, false, mat3);
        gl.uniform1f(uniforms.u_hasColorMatrix, 1.0);
      } else {
        gl.uniform1f(uniforms.u_hasColorMatrix, 0.0);
      }

      // SINGLE VISION MODE ONLY - split screen comparison completely disabled
      gl.uniform1f(uniforms.u_comparisonActive, 0.0);
      gl.uniform1f(uniforms.u_comparisonSplit, 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [selectedAnimal, streamActive]);

  // Shutter Capture
  const handleCapture = useCallback(() => {
    if (flashMode === 'on' || flashMode === 'auto') {
      setIsFlashActive(true);
      setTimeout(() => setIsFlashActive(false), 200);
    }

    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCaptureSnapshot(dataUrl);
    }
  }, [flashMode, onCaptureSnapshot]);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden select-none flex flex-col justify-between">
      {/* Hidden Media Elements */}
      <video ref={videoRef} className="hidden" playsInline muted loop crossOrigin="anonymous" />
      <img ref={imageRef} className="hidden" alt="Source sample" crossOrigin="anonymous" />

      {/* Simulated Flash Screen Effect */}
      {isFlashActive && (
        <div className="absolute inset-0 bg-white z-50 animate-pulse pointer-events-none" />
      )}

      {/* Camera Error / Permission Banner */}
      {cameraError && !streamActive && (
        <div className="absolute top-16 left-4 right-4 z-40 bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200 shadow-2xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Demo view active. Grant camera access for live feed.</span>
          </div>
          <button
            onClick={onRequestCamera}
            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-xl text-[11px] hover:bg-amber-400 cursor-pointer shadow-md"
          >
            Enable Camera
          </button>
        </div>
      )}

      {/* Flash Toast Indicator */}
      {flashToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-amber-400/50 text-amber-300 font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{flashToast}</span>
        </div>
      )}

      {/* 100% EDGE-TO-EDGE FULL SCREEN CAMERA CANVASES */}
      <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-cover cursor-crosshair transition-all duration-300"
        />
      </div>

      {/* TOP FLOATING OVERLAY BAR (Clean & Minimalist) */}
      <div className="relative z-30 pt-safe px-4 pt-4 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Left Floating Badge: Selected Animal */}
        <div className="bg-slate-950/75 backdrop-blur-2xl border border-white/15 rounded-full px-3.5 py-2 flex items-center gap-2 shadow-2xl">
          <span className="text-xl">{selectedAnimal.icon}</span>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs text-white leading-none">
              {selectedAnimal.name} Vision
            </span>
            <span className="text-[9px] text-emerald-400 font-mono mt-0.5">
              {selectedAnimal.stats.type}
            </span>
          </div>
        </div>

        {/* Center 60 FPS Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md border border-emerald-500/40 rounded-full px-3 py-1 text-xs text-emerald-400 font-mono shadow-xl">
          <Gauge className="w-3.5 h-3.5" />
          <span className="font-bold">{fps} FPS</span>
        </div>

        {/* Right Floating Control Cluster: ONLY Flash, Flip Camera, AI Assistant, Settings */}
        <div className="flex items-center gap-2">
          {/* Flash (future toggle) */}
          <button
            id="btn-toggle-flash"
            type="button"
            onClick={handleToggleFlash}
            title="Toggle Flash Mode"
            className={`p-2.5 rounded-full backdrop-blur-2xl border transition-all cursor-pointer shadow-xl active:scale-95 ${
              flashMode !== 'off'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-amber-400/30'
                : 'bg-slate-950/75 border-white/15 text-white hover:bg-slate-900'
            }`}
          >
            {flashMode !== 'off' ? <Zap className="w-4 h-4 fill-slate-950" /> : <ZapOff className="w-4 h-4" />}
          </button>

          {/* Flip Camera */}
          <button
            id="btn-flip-camera"
            type="button"
            onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
            title="Flip Camera"
            className="p-2.5 rounded-full bg-slate-950/75 backdrop-blur-2xl border border-white/15 text-white hover:bg-slate-900 cursor-pointer shadow-xl active:scale-95 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* AI Camera Explanation Trigger */}
          <button
            id="btn-ai-explain-scene"
            type="button"
            onClick={handleExplainScene}
            title="AI Scene Explanation"
            className="p-2.5 rounded-full bg-emerald-500/30 backdrop-blur-2xl border border-emerald-400 text-emerald-300 hover:text-white cursor-pointer shadow-xl active:scale-95 transition flex items-center gap-1.5 px-3"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold hidden sm:inline">AI Explain Scene</span>
          </button>

          {/* AI Assistant */}
          <button
            id="btn-ai-assistant"
            type="button"
            onClick={onNavigateToAI}
            title="AI Animal Vision Assistant"
            className="p-2.5 rounded-full bg-slate-950/75 backdrop-blur-2xl border border-purple-500/40 text-purple-300 hover:text-white cursor-pointer shadow-xl active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            type="button"
            onClick={onNavigateToSettings}
            title="Camera & App Settings"
            className="p-2.5 rounded-full bg-slate-950/75 backdrop-blur-2xl border border-white/15 text-slate-300 hover:text-white cursor-pointer shadow-xl active:scale-95 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM FLOATING CONTROLS: ANIMAL FILTER CAROUSEL & SHUTTER BUTTON */}
      <div className="relative z-30 pb-20 sm:pb-24 pt-4 px-2 flex flex-col items-center gap-3 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent pointer-events-auto">
        {/* Horizontal Instagram/Snapchat Animal Filter Carousel */}
        <div
          ref={carouselRef}
          className="w-full max-w-lg overflow-x-auto no-scrollbar py-2 px-4 flex items-center justify-start sm:justify-center gap-3.5 scroll-smooth snap-x snap-mandatory"
        >
          {ANIMALS_DATA.map((animal) => {
            const isSelected = animal.id === selectedAnimal.id;
            return (
              <button
                key={animal.id}
                id={`filter-lens-${animal.id}`}
                onClick={() => onSelectAnimal(animal)}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer shrink-0 snap-center group"
              >
                {/* Circular Lens Frame */}
                <div
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300 ${
                    isSelected
                      ? 'ring-4 ring-emerald-400 bg-gradient-to-tr from-emerald-400 to-teal-300 scale-110 shadow-xl shadow-emerald-500/50'
                      : 'bg-white/20 hover:bg-white/30 hover:scale-105 opacity-80 group-hover:opacity-100'
                  }`}
                >
                  <img
                    src={animal.imageUrl}
                    alt={animal.name}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                  />
                  {/* Animal Icon Badge */}
                  <span className="absolute -bottom-1 -right-1 text-xs bg-slate-950 rounded-full w-5 h-5 flex items-center justify-center border border-white/20 shadow-md">
                    {animal.icon}
                  </span>
                </div>

                {/* Animal Name Tag */}
                <span
                  className={`text-[11px] font-bold tracking-tight transition-all ${
                    isSelected
                      ? 'text-emerald-300 font-black scale-105'
                      : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {animal.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Snapchat / Instagram Style Shutter Button */}
        <div className="flex items-center justify-center pt-1">
          <button
            id="btn-main-shutter"
            type="button"
            onClick={handleCapture}
            title="Take Photo"
            className="group relative w-20 h-20 rounded-full border-4 border-white bg-white/20 p-1 flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-90 transition-all cursor-pointer"
          >
            <span className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition-all flex items-center justify-center shadow-inner">
              <Camera className="w-7 h-7 text-slate-950" />
            </span>
          </button>
        </div>
      </div>

      {/* AI Scene Explanation Bottom Sheet Modal */}
      {isExplanationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl overflow-hidden flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedAnimal.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    AI Scene Explanation
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    {selectedAnimal.name} Optical Perspective
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExplanationModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed space-y-3">
              {isAiExplaining ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                  <p className="text-xs font-semibold animate-pulse">
                    Analyzing camera scene through {selectedAnimal.name} photoreceptor mechanics...
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 whitespace-pre-wrap font-sans">
                  {aiExplanationText}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsExplanationModalOpen(false)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 cursor-pointer shadow-lg"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CameraCanvas.displayName = 'CameraCanvas';
