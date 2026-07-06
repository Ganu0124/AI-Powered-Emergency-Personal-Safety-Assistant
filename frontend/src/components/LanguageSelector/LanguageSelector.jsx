import { useState } from 'react';
import { LANGUAGES } from '../../i18n/translations';

export default function LanguageSelector({ language, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="lang-selector">
      <button
        className="lang-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        id="language-selector-toggle"
      >
        <span>{current.flag}</span>
        <span>{current.nativeName}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              id={`lang-option-${lang.code}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {lang.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
