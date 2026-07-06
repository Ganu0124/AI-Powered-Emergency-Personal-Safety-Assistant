import { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import { summarizeReport } from '../services/api';

export default function Reports({ language, t }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
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
      const response = await summarizeReport(file, language);
      setResult(response.data);
    } catch (err) {
      setError(t('common.error'));
    }
    setLoading(false);
  };

  const urgencyColors = {
    urgent: 'var(--primary)',
    follow_up_needed: 'var(--warning)',
    routine: 'var(--accent)',
  };

  return (
    <div>
      <div className="page-header">
        <h1>📄 {t('features.reports.title')}</h1>
        <p>{t('features.reports.desc')}</p>
      </div>

      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        id="reports-upload-zone"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
          id="reports-file-input"
        />
        <Upload className="upload-zone-icon" size={64} />
        <p className="upload-zone-text">{t('upload.title')}</p>
        <p className="upload-zone-subtext">JPG, PNG, WEBP, PDF</p>
        {preview && <img src={preview} alt="Preview" className="upload-preview" />}
        {file && !preview && (
          <p style={{ marginTop: 'var(--space-3)', color: 'var(--accent)' }}>
            📎 {file.name}
          </p>
        )}
      </div>

      {file && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleAnalyze}
            disabled={loading}
            id="reports-analyze-btn"
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} />
                {t('upload.analyzing')}
              </>
            ) : (
              <>
                <FileText size={20} />
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
            <div className="flex items-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
              {result.report_type && (
                <span className="severity-badge low">
                  📋 {result.report_type}
                </span>
              )}
              {result.urgency && (
                <span
                  className={`severity-badge ${
                    result.urgency === 'urgent' ? 'critical' :
                    result.urgency === 'follow_up_needed' ? 'medium' : 'low'
                  }`}
                >
                  {result.urgency === 'urgent' ? '🔴' :
                   result.urgency === 'follow_up_needed' ? '🟡' : '🟢'}{' '}
                  {result.urgency?.replace(/_/g, ' ').toUpperCase()}
                </span>
              )}
            </div>

            {result.patient_info && (
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                👤 {result.patient_info}
              </p>
            )}

            {/* Summary */}
            {result.summary && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'rgba(55, 66, 250, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--info-light)',
                  marginBottom: 'var(--space-6)',
                  lineHeight: 1.7,
                }}
              >
                {result.summary}
              </div>
            )}

            {/* Key Findings */}
            {result.key_findings?.length > 0 && (
              <>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  Key Findings
                </h3>
                {result.key_findings.map((finding, i) => (
                  <div key={i} className="report-finding">
                    <div className={`report-finding-status ${finding.status || 'normal'}`} />
                    <div className="report-finding-details">
                      <div className="report-finding-param">
                        {finding.parameter}: <strong>{finding.value}</strong>
                      </div>
                      <div className="report-finding-value">{finding.explanation}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  Recommendations
                </h3>
                <ol className="result-steps">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="result-step">{rec}</li>
                  ))}
                </ol>
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
