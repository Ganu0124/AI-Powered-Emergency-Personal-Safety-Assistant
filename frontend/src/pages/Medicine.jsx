import { useState, useRef } from 'react';
import { Upload, Pill, Volume2, AlertTriangle } from 'lucide-react';
import { explainMedicine } from '../services/api';
import useVoice from '../hooks/useVoice';

export default function Medicine({ language, t }) {
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
      const response = await explainMedicine(file, language);
      setResult(response.data);
    } catch (err) {
      setError(t('common.error'));
    }
    setLoading(false);
  };

  const handleReadAloud = () => {
    if (!result?.simple_summary) return;
    speak(result.simple_summary, language);
  };

  return (
    <div>
      <div className="page-header">
        <h1>💊 {t('features.medicine.title')}</h1>
        <p>{t('features.medicine.desc')}</p>
      </div>

      {/* Upload */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        id="medicine-upload-zone"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
          id="medicine-file-input"
        />
        <Upload className="upload-zone-icon" size={64} />
        <p className="upload-zone-text">{t('upload.title')}</p>
        <p className="upload-zone-subtext">{t('upload.subtitle')}</p>
        {preview && <img src={preview} alt="Preview" className="upload-preview" />}
      </div>

      {file && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <button
            className="btn btn-accent btn-lg"
            onClick={handleAnalyze}
            disabled={loading}
            id="medicine-analyze-btn"
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} />
                {t('upload.analyzing')}
              </>
            ) : (
              <>
                <Pill size={20} />
                {t('common.analyze')}
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="disclaimer mt-6">
          <AlertTriangle className="disclaimer-icon" size={20} />
          <span>{error}</span>
        </div>
      )}

      {result && !result.parse_error && (
        <div className="result-container">
          <div className="glass-card-static">
            {/* Header */}
            <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>
                  {result.medicine_name || 'Unknown Medicine'}
                </h2>
                {result.generic_name && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                    {result.generic_name}
                  </p>
                )}
              </div>
              <button className="btn btn-ghost" onClick={handleReadAloud} id="medicine-read-aloud">
                <Volume2 size={16} /> Read Summary
              </button>
            </div>

            {/* Simple Summary */}
            {result.simple_summary && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'rgba(46, 213, 115, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--accent)',
                  marginBottom: 'var(--space-6)',
                  fontSize: 'var(--font-base)',
                  lineHeight: 1.7,
                }}
              >
                {result.simple_summary}
              </div>
            )}

            {/* Info Grid */}
            <div className="medicine-info-grid">
              {result.purpose && (
                <div className="medicine-info-item">
                  <div className="medicine-info-label">Purpose</div>
                  <div className="medicine-info-value">{result.purpose}</div>
                </div>
              )}
              {result.dosage && (
                <div className="medicine-info-item">
                  <div className="medicine-info-label">Dosage</div>
                  <div className="medicine-info-value">{result.dosage}</div>
                </div>
              )}
              {result.storage && (
                <div className="medicine-info-item">
                  <div className="medicine-info-label">Storage</div>
                  <div className="medicine-info-value">{result.storage}</div>
                </div>
              )}
              {result.interactions && (
                <div className="medicine-info-item">
                  <div className="medicine-info-label">Interactions</div>
                  <div className="medicine-info-value">{result.interactions}</div>
                </div>
              )}
            </div>

            {/* Side Effects */}
            {result.side_effects?.length > 0 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  Side Effects
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {result.side_effects.map((effect, i) => (
                    <span
                      key={i}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        background: 'rgba(255, 165, 2, 0.1)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-sm)',
                        color: 'var(--warning-light)',
                      }}
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--primary)' }}>
                  ⚠️ Warnings
                </h3>
                <ul className="result-warnings">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="result-warning">
                      <AlertTriangle size={14} />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="disclaimer">
            <AlertTriangle className="disclaimer-icon" size={18} />
            <span>{t('common.disclaimer')}</span>
          </div>
        </div>
      )}

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
