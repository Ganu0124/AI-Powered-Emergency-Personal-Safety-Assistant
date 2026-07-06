import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';
import useVoice from '../../hooks/useVoice';
import { voiceChat } from '../../services/api';

export default function VoiceAssistant({ language, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const { isListening, transcript, isSpeaking, isSupported, startListening, stopListening, speak, stopSpeaking } = useVoice();

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
      // Wait a moment for final transcript
      setTimeout(async () => {
        if (transcript) {
          await handleSendMessage(transcript);
        }
      }, 500);
    } else {
      startListening(language);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setIsThinking(true);
    try {
      const result = await voiceChat(message, language);
      const response = result.data.response;
      setMessages((prev) => [...prev, { role: 'ai', text: response }]);
      speak(response, language);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: t('common.error') }]);
    }
    setIsThinking(false);
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Floating Mic Button */}
      <div className="voice-fab">
        <button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          id="voice-assistant-toggle"
          title={t('voice.title')}
        >
          <Mic size={24} />
        </button>
      </div>

      {/* Voice Panel */}
      {isOpen && (
        <div className="voice-panel">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-base)' }}>
              🎙️ {t('voice.title')}
            </h3>
            <button
              className="btn btn-icon btn-ghost"
              onClick={() => setIsOpen(false)}
              style={{ width: 32, height: 32 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              maxHeight: 200,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background:
                    msg.role === 'user'
                      ? 'rgba(55, 66, 250, 0.15)'
                      : 'var(--surface)',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  fontSize: 'var(--font-sm)',
                }}
              >
                {msg.text}
              </div>
            ))}
            {isThinking && (
              <div className="loading-dots">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            )}
          </div>

          {/* Waveform (when listening) */}
          {isListening && (
            <div className="voice-waveform">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="voice-waveform-bar" />
              ))}
            </div>
          )}

          {/* Transcript preview */}
          {transcript && (
            <p
              style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 'var(--space-3)',
              }}
            >
              "{transcript}"
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              className={`btn ${isListening ? 'btn-primary' : 'btn-ghost'}`}
              onClick={handleVoiceToggle}
              id="voice-listen-toggle"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? t('voice.listening') : t('voice.tapToSpeak')}
            </button>

            {isSpeaking && (
              <button
                className="btn btn-ghost btn-icon"
                onClick={stopSpeaking}
                title="Stop speaking"
              >
                <VolumeX size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
