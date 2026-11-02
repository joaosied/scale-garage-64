import { getCatalog } from '@/lib/db';
import { DEFAULT_SETTINGS } from '@/lib/seed';
import Site from '@/components/site/Site';

// Sempre busca os dados na hora, pra mudanca feita no admin aparecer na proxima visita.
export const dynamic = 'force-dynamic';

export default async function Home() {
  let data;
  try {
    data = await getCatalog();
  } catch (e) {
    console.error('Falha ao carregar o catálogo:', e.message);
    data = { items: [], brands: [], settings: DEFAULT_SETTINGS };
  }
  return <Site items={data.items} brands={data.brands} settings={data.settings} />;
}
