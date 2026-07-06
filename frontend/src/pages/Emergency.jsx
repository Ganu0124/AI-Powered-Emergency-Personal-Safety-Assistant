import { useState, useRef } from 'react';
import { Upload, AlertTriangle, Phone, Volume2 } from 'lucide-react';
import { analyzeEmergency } from '../services/api';
import useVoice from '../hooks/useVoice';

export default function Emergency({ language, t }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const { speak } = useVoice();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeEmergency(file, language);
      setResult(response.data);
    } catch (err) {
      setError(t('common.error'));
    }
    setLoading(false);
  };

  const handleReadAloud = () => {
    if (!result) return;
    const steps = result.immediate_steps?.join('. ') || '';
    const text = `${result.condition}. ${steps}`;
    speak(text, language);
  };

  const severityColors = {
    critical: 'var(--primary)',
    medium: 'var(--warning)',
    low: 'var(--accent)',
  };

  return (
    <div>
      <div className="page-header">
        <h1>🚑 {t('features.emergency.title')}</h1>
        <p>{t('features.emergency.desc')}</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        id="emergency-upload-zone"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
          id="emergency-file-input"
        />
        <Upload className="upload-zone-icon" size={64} />
        <p className="upload-zone-text">{t('upload.title')}</p>
        <p className="upload-zone-subtext">{t('upload.subtitle')}</p>
        {preview && <img src={preview} alt="Preview" className="upload-preview" />}
      </div>

      {/* Analyze Button */}
      {file && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleAnalyze}
            disabled={loading}
            id="emergency-analyze-btn"
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} />
                {t('upload.analyzing')}
              </>
            ) : (
              <>
                <AlertTriangle size={20} />
                {t('common.analyze')}
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="disclaimer mt-6">
          <AlertTriangle className="disclaimer-icon" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && !result.parse_error && (
        <div className="result-container">
          <div className="glass-card-static">
            {/* Severity + Condition */}
            <div className="flex items-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
              <span className={`severity-badge ${result.severity}`}>
                {result.severity === 'critical' && '🔴'}
                {result.severity === 'medium' && '🟡'}
                {result.severity === 'low' && '🟢'}
                {' '}{result.severity?.toUpperCase()}
              </span>
              <button className="btn btn-ghost" onClick={handleReadAloud} id="emergency-read-aloud">
                <Volume2 size={16} /> Read Aloud
              </button>
            </div>

            <p style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-4)' }}>
              {result.condition}
            </p>

            {/* Steps */}
            {result.immediate_steps && (
              <>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  First-Aid Steps
                </h3>
                <ol className="result-steps">
                  {result.immediate_steps.map((step, i) => (
                    <li key={i} className="result-step">{step}</li>
                  ))}
                </ol>
              </>
            )}

            {/* Don'ts */}
            {result.do_not && result.do_not.length > 0 && (
              <>
                <h3 style={{ fontWeight: 700, marginTop: 'var(--space-6)', marginBottom: 'var(--space-2)', color: 'var(--warning)' }}>
                  ⚠️ Do NOT
                </h3>
                <ul className="result-warnings">
                  {result.do_not.map((item, i) => (
                    <li key={i} className="result-warning">
                      <AlertTriangle size={14} />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Emergency Call */}
            {result.call_emergency && (
              <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                <a
                  href={`tel:${result.emergency_number || '112'}`}
                  className="btn btn-primary btn-lg"
                  id="emergency-call-btn"
                >
                  <Phone size={20} />
                  {t('common.callEmergency')}
                </a>
              </div>
            )}

            {/* Additional Notes */}
            {result.additional_notes && (
              <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                ℹ️ {result.additional_notes}
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <AlertTriangle className="disclaimer-icon" size={18} />
            <span>{t('common.disclaimer')}</span>
          </div>
        </div>
      )}

      {/* Raw response fallback */}
      {result && result.parse_error && (
        <div className="result-container">
          <div className="glass-card-static">
            <p style={{ whiteSpace: 'pre-wrap' }}>{result.raw_response}</p>
          </div>
        </div>
      )}
    </div>
  );
}
