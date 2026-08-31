// Toque gerado via Web Audio API — sem depender de nenhum arquivo de áudio.
// Navegadores só permitem tocar som depois de alguma interação do usuário na
// página (autoplay policy), por isso o AudioContext só é criado/retomado
// depois do primeiro clique/tecla — ver destravarAudio().

let audioContext = null;
let intervaloSirene = null;
let osciladoresAtivos = [];

export function destravarAudio() {
  if (typeof window === 'undefined') return;

  if (!audioContext) {
    const AudioContextClasse = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClasse) return;
    audioContext = new AudioContextClasse();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function tocarNota(frequencia, inicio, duracao) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequencia, inicio);

  gain.gain.setValueAtTime(0, inicio);
  gain.gain.linearRampToValueAtTime(0.7, inicio + 0.02);
  gain.gain.setValueAtTime(0.7, inicio + duracao * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(inicio);
  osc.stop(inicio + duracao);

  osciladoresAtivos.push(osc);
  osc.onended = () => {
    osciladoresAtivos = osciladoresAtivos.filter((o) => o !== osc);
  };
}

// "Ding-ding-ding!" alegre e ascendente (dó-mi-sol), tipo sininho.
function tocarBuzinada() {
  if (!audioContext || audioContext.state !== 'running') return;

  const agora = audioContext.currentTime;
  tocarNota(523.25, agora, 0.22); // dó5
  tocarNota(659.25, agora + 0.16, 0.22); // mi5
  tocarNota(783.99, agora + 0.32, 0.32); // sol5
}

// Toca o toque repetido até pararSirene() ser chamado.
export function iniciarSirene() {
  if (!audioContext || audioContext.state !== 'running') return;
  if (intervaloSirene) return; // já está tocando

  tocarBuzinada();
  intervaloSirene = setInterval(tocarBuzinada, 1600);
}

export function pararSirene() {
  if (intervaloSirene) {
    clearInterval(intervaloSirene);
    intervaloSirene = null;
  }
  osciladoresAtivos.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      // já parou sozinho
    }
  });
  osciladoresAtivos = [];
}
