import { igDirect } from '@/lib/i18n';

// Texto escuro em fundo claro e texto claro em fundo escuro.
function inkFor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#F2F2F2';
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#151515' : '#FFFFFF';
}

export default function Importacao({ t, lang, brands, settings, ig }) {
  const text = (lang === 'en' ? settings.importacao_en : settings.importacao_pt) || settings.importacao_pt;
  return (
    <section className="wrap imp" aria-label={t.importacao.title}>
      {brands.length ? (
        <ul className="bgrid" aria-label={t.importacao.brands}>
          {brands.map(b => (
            <li key={b.id} className="btile" style={{ background: b.cor_fundo || '#2A2A2A', listStyle: 'none' }}>
              {b.logo_url ? (
                <img src={b.logo_url} alt={b.nome} loading="lazy" />
              ) : (
                <span style={{ color: inkFor(b.cor_fundo) }}>{b.nome}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div />
      )}
      <div className="imp-text">
        <p>{text}</p>
        <a className="rbtn" href={igDirect(ig)} target="_blank" rel="noopener noreferrer">
          {t.importacao.contact}
        </a>
      </div>
    </section>
  );
}
