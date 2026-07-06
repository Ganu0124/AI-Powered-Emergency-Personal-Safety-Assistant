import { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Navigation, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { findHospitals } from '../services/api';
import useGeolocation from '../hooks/useGeolocation';

export default function Hospitals({ language, t }) {
  const { lat, lng, loading: geoLoading, error: geoError } = useGeolocation();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(null);
    try {
      const response = await findHospitals(lat, lng);
      setHospitals(response.data || []);
      setSearched(true);
    } catch (err) {
      setError(t('common.error'));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (lat && lng && !searched) {
      handleSearch();
    }
  }, [lat, lng]);

  return (
    <div>
      <div className="page-header">
        <h1>🏥 {t('features.hospitals.title')}</h1>
        <p>{t('features.hospitals.desc')}</p>
      </div>

      {/* Location Status */}
      <div className="glass-card-static mb-6">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div className="flex items-center gap-3">
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            {geoLoading ? (
              <span style={{ color: 'var(--text-secondary)' }}>Detecting location...</span>
            ) : lat && lng ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                📍 Location: {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            ) : (
              <span style={{ color: 'var(--warning)' }}>
                Location unavailable. Please enable location services.
              </span>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading || !lat}
            id="hospitals-search-btn"
          >
            {loading ? (
              <div className="loading-spinner" style={{ width: 18, height: 18, margin: 0, borderWidth: 2 }} />
            ) : (
              <RefreshCw size={16} />
            )}
            {loading ? t('common.loading') : 'Search Nearby'}
          </button>
        </div>
      </div>

      {/* Map Embed */}
      {lat && lng && (
        <div className="map-container">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_KEY'}&q=hospitals+near+me&center=${lat},${lng}&zoom=13`}
            allowFullScreen
            title="Nearby Hospitals Map"
            id="hospitals-map"
          />
        </div>
      )}

      {error && (
        <div className="disclaimer">
          <AlertTriangle className="disclaimer-icon" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Hospital List */}
      {hospitals.length > 0 && (
        <div className="hospital-list">
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Found {hospitals.length} hospitals nearby
          </h3>
          {hospitals.map((hospital, i) => (
            <div key={i} className="hospital-card" id={`hospital-card-${i}`}>
              <div className="hospital-rank">{i + 1}</div>
              <div className="hospital-info">
                <div className="hospital-name">{hospital.name}</div>
                <div className="hospital-address">{hospital.address}</div>
                <div className="hospital-meta">
                  {hospital.rating && (
                    <span className="hospital-meta-item">
                      <Star size={12} style={{ color: 'var(--warning)' }} />
                      {hospital.rating} ({hospital.rating_count || 0})
                    </span>
                  )}
                  {hospital.is_open !== null && (
                    <span className="hospital-meta-item" style={{ color: hospital.is_open ? 'var(--accent)' : 'var(--primary)' }}>
                      {hospital.is_open ? `🟢 ${t('common.open')}` : `🔴 ${t('common.closed')}`}
                    </span>
                  )}
                  {hospital.phone && (
                    <span className="hospital-meta-item">
                      <Phone size={12} /> {hospital.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="hospital-actions">
                {hospital.maps_url && (
                  <a
                    href={hospital.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                  >
                    <Navigation size={14} />
                    {t('common.getDirections')}
                  </a>
                )}
                {hospital.phone && (
                  <a href={`tel:${hospital.phone}`} className="btn btn-primary">
                    <Phone size={14} />
                    {t('common.call')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && hospitals.length === 0 && !loading && !error && (
        <div className="empty-state">
          <MapPin className="empty-state-icon" size={80} />
          <p className="empty-state-title">No hospitals found</p>
          <p className="empty-state-desc">
            Try increasing the search radius or check your location settings.
          </p>
        </div>
      )}
    </div>
  );
}
