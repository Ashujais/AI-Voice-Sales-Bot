// Speech Recognition & Synthesis Service

const SpeechRecognition = typeof window !== 'undefined' 
  ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
  : null;

export class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStatusChange = null;
    this.currentLanguage = 'en-US';
    this.shouldRestart = false;
    this.isSpeaking = false;
  }

  isSupported() {
    return !!SpeechRecognition && typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  initRecognition(language = 'en-US', onTranscript, onError, onStatusChange) {
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser');
      return false;
    }

    this.currentLanguage = language;
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.onStatusChange = onStatusChange;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = language;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStatusChange) this.onStatusChange('listening');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.onTranscriptCallback) {
          this.onTranscriptCallback({
            finalText: finalTranscript.trim(),
            interimText: interimTranscript.trim()
          });
        }
      };

      this.recognition.onerror = (event) => {
        // 'no-speech' is common and normal during pauses; don't trigger loud error
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition error:', event.error);
          if (this.onErrorCallback) this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Auto-restart if call is still active and not speaking
        if (this.shouldRestart && !this.isSpeaking) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or busy
          }
        } else if (!this.shouldRestart && this.onStatusChange) {
          this.onStatusChange('idle');
        }
      };

      return true;
    } catch (e) {
      console.error('Failed to init speech recognition:', e);
      return false;
    }
  }

  startListening(language) {
    if (language) {
      this.currentLanguage = language;
      if (this.recognition) {
        this.recognition.lang = language;
      }
    }
    this.shouldRestart = true;
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        // Ignored if already started
      }
    }
  }

  pauseListening() {
    this.shouldRestart = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  resumeListening() {
    this.shouldRestart = true;
    if (this.recognition && !this.isListening && !this.isSpeaking) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  stopListening() {
    this.shouldRestart = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  speak(text, language = 'en-US', onStart, onEnd) {
    if (!('speechSynthesis' in window)) {
      console.warn('speechSynthesis not supported');
      if (onEnd) onEnd();
      return;
    }

    // Temporarily pause recognition while bot is speaking to avoid feedback loop
    this.pauseListening();
    this.isSpeaking = true;
    window.speechSynthesis.cancel(); // cancel any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.02; // natural pace
    utterance.pitch = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language.split('-')[0].toLowerCase();
    
    // Prefer natural / google / premium voices
    let selectedVoice = voices.find(v => v.lang.toLowerCase() === language.toLowerCase() && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      // Resume listening for customer reply
      this.resumeListening();
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis error:', err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
      this.resumeListening();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  cleanup() {
    this.stopListening();
    this.stopSpeaking();
  }
}

export const speechService = new SpeechService();
