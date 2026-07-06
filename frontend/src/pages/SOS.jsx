import { useState } from 'react';
import { Phone, Copy, Share2, MapPin, AlertTriangle, Check } from 'lucide-react';
import { generateSOS } from '../services/api';
import useGeolocation from '../hooks/useGeolocation';

export default function SOS({ language, t }) {
  const { lat, lng, loading: geoLoading } = useGeolocation();
  const [situation, setSituation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSOS = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await generateSOS(situation, lat || 0, lng || 0, language);
      setResult(response.data);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || t('common.error'));
    }
    setLoading(false);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="sos-page-container">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>🆘 {t('sos.title')}</h1>
        <p>{t('sos.subtitle')}</p>
      </div>

      {/* Big SOS Button */}
      <button
        className="sos-big-button"
        onClick={handleSOS}
        disabled={loading || !situation.trim()}
        id="sos-big-button"
      >
        {loading ? (
          <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3, borderTopColor: 'white', margin: 0 }} />
        ) : (
          'SOS'
        )}
      </button>

      {/* Location */}
      <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
        <MapPin size={14} />
        {geoLoading ? 'Detecting location...' :
         lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` :
         'Location unavailable'}
      </div>

      {/* Situation Input */}
      <div className="sos-message-box">
        <div className="form-group">
          <label className="form-label" htmlFor="sos-situation-input">
            {t('sos.situationLabel')}
          </label>
          <textarea
            className="form-textarea"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={t('sos.situationPlaceholder')}
            rows={3}
            id="sos-situation-input"
          />
        </div>

        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleSOS}
          disabled={loading || !situation.trim()}
          id="sos-generate-btn"
        >
          <Phone size={20} />
          {loading ? t('common.loading') : t('sos.generate')}
        </button>
      </div>

      {error && (
        <div className="disclaimer" style={{ maxWidth: 600 }}>
          <AlertTriangle className="disclaimer-icon" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && !result.parse_error && (
        <div className="result-container" style={{ width: '100%', maxWidth: 700 }}>
          <div className="glass-card-static">
            {/* SOS Message */}
            {result.sos_message && (
              <>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  📢 SOS Message
                </h3>
                <div className="sos-generated-message">
                  {result.sos_message}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="sos-actions">
              <button
                className="btn btn-ghost"
                onClick={() => handleCopy(result.sos_message || result.whatsapp_message)}
                id="sos-copy-btn"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('sos.copied') : t('sos.copy')}
              </button>
              <button
                className="btn btn-accent"
                onClick={() => handleWhatsApp(result.whatsapp_message || result.sos_message)}
                id="sos-whatsapp-btn"
              >
                <Share2 size={16} />
                {t('sos.whatsapp')}
              </button>
              {result.maps_link && (
                <a
                  href={result.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  <MapPin size={16} />
                  View on Map
                </a>
              )}
            </div>

            {/* Emergency Contacts */}
            {result.suggested_contacts?.length > 0 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  📞 Emergency Contacts
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
                  {result.suggested_contacts.map((contact, i) => (
                    <a
                      key={i}
                      href={`tel:${contact.number}`}
                      className="hospital-card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{contact.name}</div>
                        <div style={{ color: 'var(--primary)', fontSize: 'var(--font-xl)', fontWeight: 800 }}>
                          {contact.number}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Tips */}
            {result.safety_tips?.length > 0 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  🛡️ Safety Tips
                </h3>
                <ol className="result-steps">
                  {result.safety_tips.map((tip, i) => (
                    <li key={i} className="result-step">{tip}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
