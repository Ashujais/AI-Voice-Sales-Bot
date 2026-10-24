import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import CallControls from './components/CallControls';
import LiveChat from './components/LiveChat';
import PostCallSummary from './components/PostCallSummary';
import CallHistory from './components/CallHistory';
import ProductConfig from './components/ProductConfig';
import ConsentModal from './components/ConsentModal';

import { speechService } from './services/speechService';
import { audioRecorder } from './services/audioRecorder';
import { 
  fetchProducts, 
  sendChatMessage, 
  generateSummary, 
  saveCallRecord, 
  fetchCalls 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('call');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, listening, thinking, speaking, ended
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Consent & Recording
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [recordingConsentGiven, setRecordingConsentGiven] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState(null);

  // Summary & History
  const [lastCallSummary, setLastCallSummary] = useState(null);
  const [callsHistory, setCallsHistory] = useState([]);

  const timerRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Load products & call history on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const prods = await fetchProducts();
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProduct(prods[0]);
      }
    } catch (err) {
      console.warn('Could not load products:', err);
    }

    try {
      const history = await fetchCalls();
      setCallsHistory(history);
    } catch (err) {
      console.warn('Could not load call history:', err);
    }
  };

  // Timer effect during active call
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  // Handle Start Call request
  const handleStartCallClick = () => {
    if (!recordingConsentGiven) {
      setIsConsentModalOpen(true);
    } else {
      startCallSession();
    }
  };

  const handleConsentConfirmed = (agreed) => {
    setRecordingConsentGiven(agreed);
    setIsConsentModalOpen(false);
    startCallSession();
  };

  const startCallSession = async () => {
    // Reset call state
    setMessages([]);
    setInterimTranscript('');
    setDurationSeconds(0);
    setLastCallSummary(null);
    setCurrentAudioUrl(null);
    setCurrentAudioBlob(null);
    setIsMuted(false);
    setIsCallActive(true);
    setCallStatus('connecting');

    try {
      // 1. Start Audio Recorder (captures microphone audio)
      await audioRecorder.startRecording();
    } catch (err) {
      console.warn('Microphone permission issue:', err);
    }

    // 2. Prepare Greeting based on product and language
    const prod = selectedProduct || { name: 'FlowPulse AI CRM', default_greeting: 'Hello! This is Alex from FlowPulse AI CRM.' };
    let initialGreeting = prod.default_greeting;

    if (selectedLanguage.startsWith('hi')) {
      initialGreeting = `नमस्ते! मैं ${prod.name} से बोल रहा हूँ। हम कंपनियों को उनके सेल्स और कस्टमर वर्कफ़्लो को ऑटोमेट करने में मदद करते हैं। क्या आप अभी 2 मिनट बात कर सकते हैं?`;
    } else if (selectedLanguage.startsWith('te')) {
      initialGreeting = `నమస్కారం! నేను ${prod.name} నుండి మాట్లాడుతున్నాను. మేము కంపెనీల సేల్స్ ప్రాసెస్‌ను వేగవంతం చేయడంలో సహాయం చేస్తాము. మీరు 2 నిమిషాలు మాట్లాడగలరా?`;
    }

    const greetingMsg = {
      speaker: 'bot',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([greetingMsg]);
    setCallStatus('speaking');

    // 3. Synthesize bot's greeting voice
    speechService.speak(
      initialGreeting,
      selectedLanguage,
      () => setCallStatus('speaking'),
      () => {
        setCallStatus('listening');
        // Start listening to customer speech
        initAndStartListening();
      }
    );
  };

  const initAndStartListening = () => {
    speechService.initRecognition(
      selectedLanguage,
      ({ finalText, interimText }) => {
        setInterimTranscript(interimText);
        if (finalText) {
          handleCustomerSpeech(finalText);
        }
      },
      (error) => {
        console.warn('Speech recognition warning:', error);
      },
      (status) => {
        // status: listening or idle
      }
    );
    speechService.startListening(selectedLanguage);
  };

  // Process customer speech
  const handleCustomerSpeech = async (customerText) => {
    if (!customerText.trim()) return;

    setInterimTranscript('');
    const customerMsg = {
      speaker: 'customer',
      text: customerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messagesRef.current, customerMsg];
    setMessages(updatedHistory);
    setCallStatus('thinking');

    try {
      // Fetch AI response from backend
      const res = await sendChatMessage(
        customerText,
        updatedHistory,
        selectedProduct?.id || 'flowpulse-crm',
        selectedLanguage
      );

      const botText = res.text || "Thank you for sharing that. How else can FlowPulse support your team's goals?";
      const botMsg = {
        speaker: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setCallStatus('speaking');

      // Speak response
      speechService.speak(
        botText,
        selectedLanguage,
        () => setCallStatus('speaking'),
        () => setCallStatus('listening')
      );
    } catch (err) {
      console.error('Chat error:', err);
      setCallStatus('listening');
    }
  };

  // End Call session
  const handleEndCall = async () => {
    setIsCallActive(false);
    setCallStatus('ended');

    // Stop speech recognition and synthesis
    speechService.cleanup();

    // Stop audio recorder
    let recordingResult = { audioBlob: null, audioUrl: null, duration: durationSeconds };
    try {
      recordingResult = await audioRecorder.stopRecording();
      setCurrentAudioBlob(recordingResult.audioBlob);
      setCurrentAudioUrl(recordingResult.audioUrl);
    } catch (err) {
      console.warn('Error stopping recording:', err);
    }

    const finalMessages = messagesRef.current;

    // Generate AI Summary and Sales Status
    try {
      const summaryResult = await generateSummary(
        finalMessages,
        selectedProduct?.id || 'flowpulse-crm',
        selectedLanguage
      );

      const finalCallData = {
        ...summaryResult,
        duration_seconds: durationSeconds,
        language: selectedLanguage,
        product_name: selectedProduct?.name || 'FlowPulse AI CRM',
        recording_consent: true,
        transcript: finalMessages,
        created_at: new Date().toISOString()
      };

      setLastCallSummary(finalCallData);

      // Persist call to backend database
      await saveCallRecord(finalCallData, recordingResult.audioBlob);

      // Refresh call history
      const updatedHistory = await fetchCalls();
      setCallsHistory(updatedHistory);
    } catch (err) {
      console.error('Failed to summarize and save call:', err);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      speechService.resumeListening();
      setIsMuted(false);
    } else {
      speechService.pauseListening();
      setIsMuted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProduct={selectedProduct}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        isCallActive={isCallActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Live Voice Call */}
        {activeTab === 'call' && (
          <div className="space-y-6">
            {/* Show Post-Call Summary Banner if call just ended */}
            {lastCallSummary && !isCallActive && (
              <PostCallSummary
                callSummary={lastCallSummary}
                audioUrl={currentAudioUrl}
                onNewCall={handleStartCallClick}
                onViewHistory={() => setActiveTab('history')}
              />
            )}

            {/* Live Call Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Call Controls & Visualizer (Left Column) */}
              <div className="lg:col-span-5 space-y-6">
                <CallControls
                  isCallActive={isCallActive}
                  callStatus={callStatus}
                  onStartCall={handleStartCallClick}
                  onEndCall={handleEndCall}
                  durationSeconds={durationSeconds}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                  productName={selectedProduct?.name}
                  language={selectedLanguage}
                />

                {/* SaaS Pitch Cheat-Sheet Card */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Live Product Briefing
                    </span>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Change SaaS Product
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {selectedProduct?.name || 'FlowPulse AI CRM'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedProduct?.tagline}
                  </p>

                  <div className="pt-2 border-t border-slate-800/60 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Customer:</span>
                      <span className="font-medium text-slate-200">{selectedProduct?.target_audience?.split('.')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pricing Entry:</span>
                      <span className="font-mono text-teal-400 font-bold">
                        {Array.isArray(selectedProduct?.pricing_tiers) && selectedProduct.pricing_tiers[0]?.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-Time Live Chat Screen (Right Column) */}
              <div className="lg:col-span-7">
                <LiveChat
                  messages={messages}
                  interimTranscript={interimTranscript}
                  isCallActive={isCallActive}
                  callStatus={callStatus}
                  onSendMessage={handleCustomerSpeech}
                  onSuggestionClick={(prompt) => {
                    if (isCallActive) {
                      handleCustomerSpeech(prompt);
                    } else {
                      handleStartCallClick();
                    }
                  }}
                  productName={selectedProduct?.name}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Call History & Recordings */}
        {activeTab === 'history' && (
          <CallHistory
            calls={callsHistory}
            onRefresh={loadInitialData}
            onSelectCall={(c) => {
              setLastCallSummary(c);
              setActiveTab('call');
            }}
          />
        )}

        {/* Tab 3: SaaS Products Knowledge Base */}
        {activeTab === 'products' && (
          <ProductConfig
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setActiveTab('call');
            }}
          />
        )}
      </main>

      {/* Recording Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirm={handleConsentConfirmed}
        productName={selectedProduct?.name}
      />
    </div>
  );
}
