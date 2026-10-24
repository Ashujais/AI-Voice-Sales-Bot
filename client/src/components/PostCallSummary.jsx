import React, { useRef, useState } from 'react';
import { 
  CheckCircle2, AlertCircle, Clock, Calendar, XCircle, PhoneMissed, 
  Sparkles, Play, Pause, Download, RotateCcw, History, FileText,
  Target, ShieldAlert, ArrowRight, Volume2
} from 'lucide-react';

export default function PostCallSummary({ 
  callSummary, 
  audioUrl, 
  onNewCall, 
  onViewHistory 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  if (!callSummary) return null;

  const {
    sales_status = 'Interested',
    summary = '',
    customer_requirements = '',
    objections = '',
    next_steps = '',
    confidence_score = 0.9,
    status_reason = '',
    duration_seconds = 0,
    product_name = 'FlowPulse AI CRM'
  } = callSummary;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Status Styling & Icon
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Converted':
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          icon: CheckCircle2,
          description: 'Deal Closed / Trial Activated'
        };
      case 'Demo Requested':
        return {
          bg: 'bg-purple-500/15',
          border: 'border-purple-500/40',
          text: 'text-purple-400',
          icon: Calendar,
          description: 'Product Demo Scheduled'
        };
      case 'Interested':
        return {
          bg: 'bg-sky-500/15',
          border: 'border-sky-500/40',
          text: 'text-sky-400',
          icon: Sparkles,
          description: 'High Purchase Intent'
        };
      case 'Follow-up Required':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          icon: Clock,
          description: 'Nurture & Callback Required'
        };
      case 'Not Interested':
        return {
          bg: 'bg-slate-700/30',
          border: 'border-slate-600/40',
          text: 'text-slate-400',
          icon: XCircle,
          description: 'Declined Offer / Disqualified'
        };
      case 'No Response':
      default:
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          icon: PhoneMissed,
          description: 'No Customer Audio Detected'
        };
    }
  };

  const statusConfig = getStatusConfig(sales_status);
  const StatusIcon = statusConfig.icon;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-2xl animate-fadeIn space-y-6">
      {/* Top Banner: Status & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Post-Call Intelligence Report
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-teal-400 font-medium">{product_name}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sales Call Summary & Classification
          </h2>
        </div>

        {/* Assigned Sales Status Badge */}
        <div className={`px-4 py-2.5 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} flex items-center gap-3 shadow-md`}>
          <div className={`p-2 rounded-xl bg-slate-950/40 ${statusConfig.text}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Status
            </div>
            <div className={`text-base font-extrabold ${statusConfig.text}`}>
              {sales_status}
            </div>
          </div>
        </div>
      </div>

      {/* Rationale & Confidence Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="text-slate-300">
          <strong className="text-white">Classification Reason: </strong>
          {status_reason || statusConfig.description}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-400">Call Duration: <strong className="text-white">{formatDuration(duration_seconds)}</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">AI Confidence: <strong className="text-teal-400">{Math.round(confidence_score * 100)}%</strong></span>
        </div>
      </div>

      {/* Voice Recording Player */}
      {audioUrl && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-teal-500/20 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Call Voice Recording</h4>
                <p className="text-xs text-slate-400">Captured with verified participant recording consent</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause Audio' : 'Play Recording'}
              </button>

              <a
                href={audioUrl}
                download={`call_recording_${Date.now()}.webm`}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Download voice recording"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            className="w-full mt-2 h-10 rounded-lg filter invert hue-rotate-180 opacity-90"
            controls
          />
        </div>
      )}

      {/* 4 Core Summary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Executive Summary */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wide">
            <FileText className="w-4 h-4" /> Conversation Summary
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {summary || 'Summary generation in progress...'}
          </p>
        </div>

        {/* Customer Requirements */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
            <Target className="w-4 h-4" /> Customer Requirements & Needs
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {customer_requirements || 'None captured or not stated.'}
          </p>
        </div>

        {/* Objections */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4" /> Objections Raised & Handled
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {objections || 'No objections raised during the call.'}
          </p>
        </div>

        {/* Next Steps */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
            <ArrowRight className="w-4 h-4" /> Recommended Next Steps
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {next_steps || '1. Follow up via email with product details.'}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={onViewHistory}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4" />
          View All in Call History
        </button>

        <button
          onClick={onNewCall}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Voice Call
        </button>
      </div>
    </div>
  );
}
