import '@fontsource/jaro/400.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import './globals.css';

export const metadata = {
  title: 'Scale Garage 64 · Miniaturas 1:64',
  description: 'Miniaturas 1:64 importadas do Japão, China e EUA. Veja o que está à venda, a coleção e fale com a gente no Instagram.',
  openGraph: {
    title: 'Scale Garage 64',
    description: 'Miniaturas 1:64 importadas do Japão, China e EUA.',
    type: 'website'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3A3A3A'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
