import React, { useState } from 'react';
import { 
  History, Search, Filter, Play, Pause, Trash2, ChevronDown, ChevronUp, 
  Volume2, CheckCircle2, Calendar, Sparkles, Clock, XCircle, PhoneMissed, 
  Download, MessageSquare, AlertCircle
} from 'lucide-react';
import { deleteCall } from '../services/api';

export default function CallHistory({ calls, onRefresh, onSelectCall }) {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCallId, setExpandedCallId] = useState(null);
  const [playingCallId, setPlayingCallId] = useState(null);

  const statuses = [
    'All',
    'Converted',
    'Interested',
    'Demo Requested',
    'Follow-up Required',
    'Not Interested',
    'No Response'
  ];

  const filteredCalls = calls.filter((call) => {
    const matchesStatus = selectedStatus === 'All' || call.sales_status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q ||
      (call.product_name && call.product_name.toLowerCase().includes(q)) ||
      (call.summary && call.summary.toLowerCase().includes(q)) ||
      (call.customer_requirements && call.customer_requirements.toLowerCase().includes(q)) ||
      (call.sales_status && call.sales_status.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this call record and its recording?')) return;
    try {
      await deleteCall(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete call: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Converted
          </span>
        );
      case 'Demo Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Calendar className="w-3.5 h-3.5" /> Demo Requested
          </span>
        );
      case 'Interested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Interested
          </span>
        );
      case 'Follow-up Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Follow-up Required
          </span>
        );
      case 'Not Interested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-700/40 text-slate-400 border border-slate-600/40">
            <XCircle className="w-3.5 h-3.5" /> Not Interested
          </span>
        );
      case 'No Response':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <PhoneMissed className="w-3.5 h-3.5" /> No Response
          </span>
        );
    }
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            Previous Sales Calls & Recordings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full history of recorded audio, transcripts, AI summaries, and assigned sales statuses
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcripts, status..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === status
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            {status}
            {status !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-75">
                ({calls.filter(c => c.sales_status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Calls List */}
      {filteredCalls.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 inline-block text-slate-500 mb-3">
            <History className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No Call History Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery || selectedStatus !== 'All'
              ? 'No conversations match your selected filters.'
              : 'Complete a voice sales call to automatically view recordings, summaries, and transcripts here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCalls.map((call) => {
            const isExpanded = expandedCallId === call.id;
            const recordingUrl = call.recording_filename 
              ? `/api/recordings/${call.recording_filename}` 
              : null;

            return (
              <div
                key={call.id}
                className="glass-panel rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all p-5 shadow-lg space-y-4"
              >
                {/* Call Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {call.product_name || 'FlowPulse AI CRM'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {call.language || 'en-US'}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">
                        {formatDate(call.created_at)}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-mono text-teal-400 font-semibold">
                        {formatDuration(call.duration_seconds || 0)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl line-clamp-2">
                      {call.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {getStatusBadge(call.sales_status)}

                    <button
                      onClick={(e) => handleDelete(call.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete call record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Audio Recording Playback Bar */}
                {recordingUrl && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Volume2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Audio Recording ({formatDuration(call.duration_seconds || 0)})</span>
                    </div>

                    <div className="w-full sm:w-auto flex-1 max-w-md">
                      <audio
                        src={recordingUrl}
                        controls
                        className="w-full h-8 filter invert hue-rotate-180 opacity-90"
                      />
                    </div>

                    <a
                      href={recordingUrl}
                      download={`call_${call.id}.webm`}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                )}

                {/* Collapsible Details & Full Transcript */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-teal-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isExpanded ? 'Hide' : 'View'} Full Transcript & Breakdown</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Consent Verified: Yes
                  </span>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="space-y-4 pt-3 border-t border-slate-800 animate-fadeIn">
                    {/* Requirements & Objections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <strong className="text-sky-400 block mb-1">Customer Requirements:</strong>
                        <p className="text-slate-300">{call.customer_requirements || 'None recorded.'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <strong className="text-amber-400 block mb-1">Objections Raised:</strong>
                        <p className="text-slate-300">{call.objections || 'None recorded.'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 md:col-span-2">
                        <strong className="text-emerald-400 block mb-1">Recommended Next Steps:</strong>
                        <p className="text-slate-300 whitespace-pre-line">{call.next_steps || 'None recorded.'}</p>
                      </div>
                    </div>

                    {/* Chat Transcript List */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Verbatim Transcript ({call.transcript?.length || 0} messages)
                      </h5>
                      <div className="max-h-60 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        {call.transcript && call.transcript.length > 0 ? (
                          call.transcript.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                                msg.speaker === 'bot'
                                  ? 'bg-slate-900/90 text-slate-200 border border-slate-800'
                                  : 'bg-teal-950/40 text-teal-200 border border-teal-800/40'
                              }`}
                            >
                              <div className="font-semibold text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                                {msg.speaker === 'bot' ? '🤖 AI Sales Agent' : '👤 Customer'}
                                <span className="text-slate-500 ml-2">{msg.timestamp}</span>
                              </div>
                              <p>{msg.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">No transcript recorded for this call.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
