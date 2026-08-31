// Beep gerado via Web Audio API — sem depender de nenhum arquivo de áudio.
// Navegadores só permitem tocar som depois de alguma interação do usuário na
// página (autoplay policy), por isso o AudioContext só é criado/retomado
// depois do primeiro clique/tecla — ver destravarAudio().

let audioContext = null;

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

function tocarNota(frequencia, inicio) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = frequencia;
  gain.gain.setValueAtTime(0.7, audioContext.currentTime + inicio);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + inicio + 0.35);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(audioContext.currentTime + inicio);
  osc.stop(audioContext.currentTime + inicio + 0.35);
}

export function tocarBeep() {
  if (!audioContext || audioContext.state !== 'running') return;

  // Duas notas em sequência (tipo "ding-dong") — mais alto e mais fácil de
  // notar num ambiente de cozinha barulhento do que um beep único.
  tocarNota(880, 0);
  tocarNota(1108, 0.18);
}
