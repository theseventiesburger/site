// Sirene gerada via Web Audio API — sem depender de nenhum arquivo de áudio.
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

function tocarBuzinada() {
  if (!audioContext || audioContext.state !== 'running') return;

  const inicio = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Tom grave e descendente, tipo buzina/sirene de navio.
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, inicio);
  osc.frequency.linearRampToValueAtTime(105, inicio + 1.1);

  gain.gain.setValueAtTime(0, inicio);
  gain.gain.linearRampToValueAtTime(0.9, inicio + 0.15);
  gain.gain.setValueAtTime(0.9, inicio + 1.0);
  gain.gain.linearRampToValueAtTime(0, inicio + 1.3);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(inicio);
  osc.stop(inicio + 1.3);

  osciladoresAtivos.push(osc);
  osc.onended = () => {
    osciladoresAtivos = osciladoresAtivos.filter((o) => o !== osc);
  };
}

// Toca buzinadas repetidas até pararSirene() ser chamado.
export function iniciarSirene() {
  if (!audioContext || audioContext.state !== 'running') return;
  if (intervaloSirene) return; // já está tocando

  tocarBuzinada();
  intervaloSirene = setInterval(tocarBuzinada, 1800);
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
