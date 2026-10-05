"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, Volume2 } from "lucide-react";

interface VoiceVisualizerProps {
  isListening: boolean;
  onStop: () => void;
}

export function VoiceVisualizer({ isListening, onStop }: VoiceVisualizerProps) {
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 45, 70, 40, 20, 10]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isListening) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      return;
    }

    let active = true;

    // Attempt real microphone stream for true live audio visualization
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 32;
          analyserRef.current = analyser;

          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const renderWave = () => {
            if (!active) return;
            analyser.getByteFrequencyData(dataArray);

            // Sample 7 distinct frequency bands
            const sampled = [
              Math.max(12, Math.min(100, Math.round((dataArray[1] / 255) * 100))),
              Math.max(15, Math.min(100, Math.round((dataArray[3] / 255) * 100))),
              Math.max(18, Math.min(100, Math.round((dataArray[5] / 255) * 100))),
              Math.max(22, Math.min(100, Math.round((dataArray[7] / 255) * 100))),
              Math.max(18, Math.min(100, Math.round((dataArray[9] / 255) * 100))),
              Math.max(15, Math.min(100, Math.round((dataArray[11] / 255) * 100))),
              Math.max(12, Math.min(100, Math.round((dataArray[13] / 255) * 100))),
            ];
            setAudioLevels(sampled);
            animationFrameRef.current = requestAnimationFrame(renderWave);
          };

          renderWave();
        })
        .catch(() => {
          // Fallback to organic synthesized oscillation if mic stream access is restricted
          let step = 0;
          const simulateWave = () => {
            if (!active) return;
            step += 0.12;
            const simulated = [
              Math.round(20 + 15 * Math.sin(step)),
              Math.round(35 + 25 * Math.sin(step + 1.2)),
              Math.round(60 + 35 * Math.sin(step + 2.4)),
              Math.round(85 + 15 * Math.sin(step + 0.8)),
              Math.round(55 + 30 * Math.sin(step + 1.8)),
              Math.round(30 + 20 * Math.sin(step + 2.8)),
              Math.round(18 + 12 * Math.sin(step + 0.4)),
            ];
            setAudioLevels(simulated);
            animationFrameRef.current = requestAnimationFrame(simulateWave);
          };
          simulateWave();
        });
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isListening]);

  if (!isListening) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 mb-2 rounded-2xl bg-[#14161f]/95 border border-rose-500/40 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" /> Listening to your speech...
          </span>
          <span className="text-[10px] text-[#8e918f]">
            Speak naturally. Click Stop or send when done.
          </span>
        </div>
      </div>

      {/* Dynamic Animated Frequency Bars */}
      <div className="flex items-center gap-1 h-8 px-3">
        {audioLevels.map((val, idx) => (
          <div
            key={idx}
            className="w-1.5 rounded-full bg-gradient-to-t from-rose-600 via-pink-500 to-indigo-400 transition-all duration-75"
            style={{
              height: `${Math.max(15, val)}%`,
              opacity: 0.5 + (val / 100) * 0.5,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onStop}
        className="px-3 py-1 rounded-xl text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition"
      >
        Done
      </button>
    </div>
  );
}
