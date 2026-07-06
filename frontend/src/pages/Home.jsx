import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Pill,
  FileText,
  MapPin,
  Phone,
  Mic,
} from 'lucide-react';

const features = [
  {
    id: 'emergency',
    path: '/emergency',
    icon: AlertTriangle,
    colorClass: 'emergency',
    tKey: 'features.emergency',
  },
  {
    id: 'medicine',
    path: '/medicine',
    icon: Pill,
    colorClass: 'health',
    tKey: 'features.medicine',
  },
  {
    id: 'reports',
    path: '/reports',
    icon: FileText,
    colorClass: 'info',
    tKey: 'features.reports',
  },
  {
    id: 'hospitals',
    path: '/hospitals',
    icon: MapPin,
    colorClass: 'info',
    tKey: 'features.hospitals',
  },
  {
    id: 'sos',
    path: '/sos',
    icon: Phone,
    colorClass: 'emergency',
    tKey: 'features.sos',
  },
  {
    id: 'voice',
    path: '#',
    icon: Mic,
    colorClass: 'warning',
    tKey: 'features.voice',
  },
];

export default function Home({ t }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <span className="hero-badge">
          ⚡ {t('home.badge')}
        </span>
        <h1 className="hero-title">
          {t('home.heroTitle')}{' '}
          <span className="gradient-text">{t('home.heroTitleHighlight')}</span>
        </h1>
        <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
        <div className="hero-features">
          {t('home.features')?.map?.((feat, i) => (
            <span key={i} className="hero-feature-tag">
              {feat}
            </span>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <div className="feature-grid">
        {features.map((feat) => {
          const Icon = feat.icon;
          const title = t(`${feat.tKey}.title`);
          const desc = t(`${feat.tKey}.desc`);

          return (
            <Link
              key={feat.id}
              to={feat.path}
              className={`feature-card ${feat.colorClass}`}
              id={`feature-card-${feat.id}`}
            >
              <div className={`feature-card-icon ${feat.colorClass}`}>
                <Icon size={28} />
              </div>
              <h3 className="feature-card-title">{title}</h3>
              <p className="feature-card-desc">{desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
