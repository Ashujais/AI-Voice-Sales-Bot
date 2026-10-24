import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles, Activity } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';

export default function CallControls({
  isCallActive,
  callStatus,
  onStartCall,
  onEndCall,
  durationSeconds,
  isMuted,
  onToggleMute,
  productName,
  language
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusBadge = () => {
    switch (callStatus) {
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Connecting Agent...
          </span>
        );
      case 'listening':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            Listening (Speak now)
          </span>
        );
      case 'thinking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            AI Processing...
          </span>
        );
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
            AI Bot Speaking
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Call Ended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Ready to Connect
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 shadow-xl">
      {/* Top row: Status & Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <span className="text-xs text-slate-400 hidden sm:inline">
            Language: <span className="text-slate-200 font-medium">{language}</span>
          </span>
        </div>

        {/* Call Duration */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-sm font-semibold tracking-wider">
          <span className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className={isCallActive ? 'text-white' : 'text-slate-400'}>
            {formatTime(durationSeconds)}
          </span>
        </div>
      </div>

      {/* Audio Visualizer Wave */}
      <div className="mb-5">
        <VoiceVisualizer callStatus={callStatus} isMuted={isMuted} />
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Pitching <strong className="text-slate-200">{productName || 'FlowPulse AI CRM'}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mute button (only active during call) */}
          {isCallActive && (
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={`p-3 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Start Call / End Call */}
          {!isCallActive ? (
            <button
              onClick={onStartCall}
              className="px-6 py-3 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lg shadow-teal-500/25 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-slate-950" />
              <span>Start Voice Call</span>
            </button>
          ) : (
            <button
              onClick={onEndCall}
              className="px-6 py-3 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-rose-600 to-red-500 text-white hover:brightness-110 shadow-lg shadow-rose-600/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneOff className="w-4 h-4 text-white" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
