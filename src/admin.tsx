import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './AdminApp.tsx';
import './index.css';
import { brand } from './config/brand';
import { applyBrandColors } from './utils/brandTheme';

applyBrandColors(brand.colors);
document.title = 'Admin Panel - ' + (brand.seo.title || brand.name);

if (brand.analytics.googleTagId) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${brand.analytics.googleTagId}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${brand.analytics.googleTagId}');
  `;
  document.head.appendChild(inlineScript);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
