import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, Send, Sparkles, Volume2, Mic, CheckCheck } from 'lucide-react';

export default function LiveChat({
  messages,
  interimTranscript,
  isCallActive,
  callStatus,
  onSendMessage,
  onSuggestionClick,
  productName
}) {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef(null);

  // Auto-scroll on new messages or interim text
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const samplePrompts = [
    "What are your pricing plans?",
    "We already use Salesforce, why should we switch?",
    "Does FlowPulse integrate with Slack and Gmail?",
    "Can we schedule a 15-minute live demo tomorrow?",
    "I would like to start a 14-day free trial right now."
  ];

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[520px] border border-slate-800/80 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/70 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Live Conversation Stream</h4>
            <p className="text-[11px] text-slate-400">Real-time synchronized speech-to-text transcript</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCallActive && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-mono">
            {messages.length} exchanges
          </span>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 && !interimTranscript ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Interactive Voice Conversation</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Click <strong>"Start Voice Call"</strong> above. The AI sales representative will introduce the product and listen to your responses.
              </p>
            </div>

            {/* Quick Prompts to try */}
            <div className="w-full max-w-md pt-2">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2 text-left">
                Suggested customer queries to speak or test:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSuggestionClick(prompt)}
                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-teal-500/40 hover:bg-slate-800 transition-all"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isBot = msg.speaker === 'bot';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                >
                  {isBot && (
                    <div className="h-8 w-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                    isBot
                      ? 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-sm'
                      : 'bg-gradient-to-br from-teal-600/90 to-teal-700/90 text-white border border-teal-500/30 rounded-tr-sm ml-auto'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className={`text-[11px] font-bold tracking-wide uppercase ${
                        isBot ? 'text-teal-400' : 'text-teal-100'
                      }`}>
                        {isBot ? `AI Sales Agent (${productName || 'FlowPulse'})` : 'Customer (You)'}
                      </span>
                      <span className={`text-[10px] font-mono ${
                        isBot ? 'text-slate-500' : 'text-teal-200/80'
                      }`}>
                        {msg.timestamp || 'Just now'}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {isBot && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-teal-400/80">
                          <Volume2 className="w-3 h-3" /> Voice Synthesized
                        </span>
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <CheckCheck className="w-3 h-3 text-teal-400" /> Delivered
                        </span>
                      </div>
                    )}
                  </div>

                  {!isBot && (
                    <div className="h-8 w-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Real-time Interim Transcript Bubble */}
            {interimTranscript && (
              <div className="flex items-start gap-3 justify-end animate-pulse">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm p-3.5 bg-teal-900/30 border border-teal-500/40 text-teal-200 shadow-md">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-300 mb-1">
                    <Mic className="w-3 h-3 animate-ping" /> Listening to you speak...
                  </div>
                  <p className="text-sm italic">
                    "{interimTranscript}"
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-teal-400 animate-blink"></span>
                  </p>
                </div>
                <div className="h-8 w-8 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* AI Thinking Indicator */}
            {callStatus === 'thinking' && (
              <div className="flex items-start gap-3 justify-start animate-fadeIn">
                <div className="h-8 w-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span>Formulating sales response...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Manual Input Fallback & Audio Sync Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!isCallActive}
            placeholder={
              isCallActive
                ? "Speak into your mic or type customer message here..."
                : "Start call to speak with the AI sales bot..."
            }
            className={`flex-1 px-4 py-2 text-sm rounded-xl bg-slate-900 border text-slate-200 placeholder-slate-500 focus:outline-none transition-colors ${
              isCallActive
                ? 'border-slate-700/80 focus:border-teal-500'
                : 'border-slate-800/50 opacity-60 cursor-not-allowed'
            }`}
          />

          <button
            type="submit"
            disabled={!isCallActive || !inputText.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
              isCallActive && inputText.trim()
                ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold shadow-md cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
