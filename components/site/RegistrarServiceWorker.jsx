'use client';

import { useEffect } from 'react';

// Sem service worker registrado, o Chrome no Android não considera o site
// instalável de verdade (só um atalho, sem o prompt de "Instalar app"). O
// mesmo public/sw.js da Comanda serve aqui — só reage a push/notificationclick,
// então fica inofensivo pra quem nunca se inscreve (cliente comum do site).
export default function RegistrarServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Instalável sem push também é melhor que travar a página por isso.
      });
    }
  }, []);

  return null;
}
