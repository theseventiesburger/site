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

export function tocarBeep() {
  if (!audioContext || audioContext.state !== 'running') return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.3);
}
