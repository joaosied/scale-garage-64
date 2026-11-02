import { STATUS_COLOR, igDirect } from '@/lib/i18n';

export default function SaleCard({ item, t, ig }) {
  const sold = item.status === 'vendido';
  const sig = (item.montadora || item.marca || item.nome || '?').trim().charAt(0).toUpperCase();
  const sub = [item.marca || item.montadora, item.ano].filter(Boolean).join(' · ') || '1:64';
  return (
    <article className="pcard">
      <div className="pc-h">
        <span className="pc-b" aria-hidden="true">
          {sig}
        </span>
        <div className="pc-t">
          <b>{item.nome.toUpperCase()}</b>
          <span>{sub}</span>
        </div>
      </div>
      <div className="pc-p">
        <div className="wm" aria-hidden="true">
          {(item.montadora || item.marca || '').toUpperCase()}
        </div>
        {item.img ? <img src={item.img} alt={item.nome} loading="lazy" className={sold ? 'sold' : undefined} /> : null}
        {item.novo && !sold ? <span className="pc-new">{t.card.new}</span> : null}
        <span className="pill" style={{ '--c': STATUS_COLOR[item.status] }}>
          <i />
          {t.status[item.status]}
        </span>
      </div>
      <div className="pc-f">
        <div>
          <small>{t.card.importedFrom}</small>
          <b>{t.origem(item.origem)}</b>
        </div>
        {sold ? (
          <span className="pc-btn out">{t.card.sold}</span>
        ) : (
          <a className="pc-btn" href={igDirect(ig)} target="_blank" rel="noopener noreferrer">
            {t.card.interest} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
