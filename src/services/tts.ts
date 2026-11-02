export const TTSService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  speak(text: string, lang = 'en-US', rate = 0.9): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        console.warn('Web Speech API is not supported in this browser.');
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Stop any pending utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = 1.0;

        // Try finding best English voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.default));
        if (enVoice) {
          utterance.voice = enVoice;
        }

        utterance.onend = () => resolve(true);
        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          resolve(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('TTS execution error:', err);
        resolve(false);
      }
    });
  },

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
};
