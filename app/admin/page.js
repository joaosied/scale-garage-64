import { getCatalog, hasDb } from '@/lib/db';
import AdminApp from '@/components/admin/AdminApp';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let data;
  let error = null;
  try {
    data = await getCatalog();
  } catch (e) {
    error = e.message;
    data = { items: [], brands: [], settings: null, demo: false };
  }
  return <AdminApp initial={data} dbReady={hasDb()} loadError={error} />;
}
