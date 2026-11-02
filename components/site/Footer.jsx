import { igProfile } from '@/lib/i18n';

export default function Footer({ t, ig }) {
  return (
    <footer className="foot">
      <a className="flogo" href="#topo" aria-label="Scale Garage 64">
        <b>SCALE</b>
        <span>
          GARAGE<em>64</em>
        </span>
      </a>
      <p>{t.footer.rights}</p>
      <a className="ig" href={igProfile(ig)} target="_blank" rel="noopener noreferrer">
        @{ig}
      </a>
    </footer>
  );
}
