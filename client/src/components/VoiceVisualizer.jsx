import React, { useEffect, useRef } from 'react';
import { audioRecorder } from '../services/audioRecorder';

export default function VoiceVisualizer({ callStatus, isMuted }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numBars = 48;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Determine activity state
      const isListening = callStatus === 'listening' && !isMuted;
      const isSpeaking = callStatus === 'speaking';
      const isThinking = callStatus === 'thinking';

      let freqData = null;
      if (isListening) {
        freqData = audioRecorder.getFrequencyData();
      }

      const barWidth = width / numBars - 2;
      const centerY = height / 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4; // minimum baseline height

        if (isSpeaking) {
          // Dynamic animated wave simulation for bot speech
          const wave1 = Math.sin((i / numBars) * Math.PI * 4 + phase);
          const wave2 = Math.cos((i / numBars) * Math.PI * 2 - phase * 0.8);
          const combined = Math.abs(wave1 * wave2);
          barHeight = 6 + combined * (height * 0.75);
        } else if (isListening && freqData && freqData.length > 0) {
          // Real microphone frequency data
          const dataIdx = Math.floor((i / numBars) * (freqData.length / 2));
          const val = freqData[dataIdx] || 0;
          barHeight = 4 + (val / 255) * (height * 0.85);
        } else if (isThinking) {
          // Pulsing glow wave
          const wave = Math.sin((i / numBars) * Math.PI * 3 + phase * 2);
          barHeight = 5 + Math.abs(wave) * (height * 0.35);
        } else {
          // Idle ambient gentle wave
          const wave = Math.sin((i / numBars) * Math.PI * 2 + phase * 0.5);
          barHeight = 4 + Math.abs(wave) * 6;
        }

        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        // Gradient color based on state
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeaking) {
          gradient.addColorStop(0, '#818cf8'); // Indigo
          gradient.addColorStop(1, '#c084fc'); // Purple
        } else if (isListening) {
          gradient.addColorStop(0, '#2dd4bf'); // Teal
          gradient.addColorStop(1, '#06b6d4'); // Cyan
        } else if (isThinking) {
          gradient.addColorStop(0, '#f59e0b'); // Amber
          gradient.addColorStop(1, '#fbbf24');
        } else {
          gradient.addColorStop(0, '#334155'); // Slate
          gradient.addColorStop(1, '#475569');
        }

        ctx.fillStyle = gradient;
        // Rounded bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      phase += 0.08;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [callStatus, isMuted]);

  return (
    <div className="w-full h-16 flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 px-4 overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={480}
        height={64}
        className="w-full h-full max-w-md"
      />
    </div>
  );
}
