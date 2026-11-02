import './admin.css';

export const metadata = {
  title: 'Admin · Scale Garage 64',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }) {
  return <div className="adm">{children}</div>;
}
