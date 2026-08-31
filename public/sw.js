self.addEventListener('push', (event) => {
  let dados = { titulo: 'The Seventies — Comanda', corpo: 'Você tem uma atualização.' };

  try {
    dados = event.data.json();
  } catch {
    // payload sem JSON — usa o texto padrão acima
  }

  event.waitUntil(
    self.registration.showNotification(dados.titulo, {
      body: dados.corpo,
      icon: '/logo.png',
      badge: '/logo.png',
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((listaClientes) => {
      for (const cliente of listaClientes) {
        if (cliente.url.includes('/comanda') && 'focus' in cliente) {
          return cliente.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/comanda');
      }
    })
  );
});
