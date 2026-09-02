export const TIPOS_PEDIDO = ['mesa', 'delivery', 'pdv'];

export const TIPO_LABEL = {
  mesa: 'Mesa',
  delivery: 'Delivery',
  pdv: 'Ponto de Venda',
};

export const STATUS_PEDIDO = ['recebido', 'preparando', 'pronto', 'entregue', 'cancelado'];

export const STATUS_LABEL = {
  recebido: 'Recebido',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const STATUS_COR = {
  recebido: 'bg-sv-blue',
  preparando: 'bg-amber-500',
  pronto: 'bg-green-600',
  entregue: 'bg-gray-400',
  cancelado: 'bg-sv-red',
};

export const PROXIMO_STATUS = {
  recebido: 'preparando',
  preparando: 'pronto',
  pronto: 'entregue',
};

export const FORMAS_PAGAMENTO = ['dinheiro', 'pix', 'credito', 'debito', 'online'];

export const FORMA_PAGAMENTO_LABEL = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  credito: 'Crédito',
  debito: 'Débito',
  online: 'Online',
};

export const PONTOS_CARNE = ['mal_passado', 'ao_ponto', 'bem_passado'];

export const PONTO_CARNE_LABEL = {
  mal_passado: 'Mal passado',
  ao_ponto: 'Ao ponto',
  bem_passado: 'Bem passado',
};
