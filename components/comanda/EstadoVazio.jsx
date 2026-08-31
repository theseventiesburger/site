export default function EstadoVazio({ mensagem = 'Nada por aqui.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">🍔</span>
      <p className="text-gray-400 text-sm font-medium">{mensagem}</p>
    </div>
  );
}
