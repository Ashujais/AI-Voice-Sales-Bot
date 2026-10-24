import React, { useState } from 'react';
import { ShieldCheck, Mic, FileText, CheckCircle2, X } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose, onConfirm, productName }) {
  const [agreed, setAgreed] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow bg-slate-900/95 border border-teal-500/30 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Call Recording & Privacy Consent</h3>
            <p className="text-xs text-slate-400">Required before connecting your interactive voice session</p>
          </div>
        </div>

        <div className="space-y-3.5 mb-6 text-sm text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <Mic className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Voice Audio Recording:</strong> To provide accurate voice responses and enable playback of the conversation afterwards, your audio will be recorded and processed locally.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <FileText className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Real-Time Transcription & AI Summary:</strong> The bot will convert speech to text in real time, generate an automated sales summary, and assess customer requirements and objections.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Active Product Pitch:</strong> You will be speaking with an autonomous sales agent representing <span className="text-teal-300 font-medium">{productName || 'FlowPulse AI CRM'}</span>.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 cursor-pointer mb-6 hover:bg-teal-500/10 transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 focus:ring-offset-slate-900 border-slate-700 bg-slate-900 cursor-pointer"
          />
          <span className="text-xs font-medium text-slate-200">
            I understand and give consent to record this call and generate automated transcripts.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(agreed)}
            disabled={!agreed}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              agreed
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-teal-500/25 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Mic className="w-4 h-4" />
            Accept Consent & Start Call
          </button>
        </div>
      </div>
    </div>
  );
}
