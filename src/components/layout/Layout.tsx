import { Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLangs } from '@/i18n';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && (supportedLangs as readonly string[]).includes(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
    }
  }, [lang, i18n]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
