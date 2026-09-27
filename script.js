const screens = document.querySelectorAll('.screen');
const startButton = document.querySelector('#start-button');
const logoScreen = document.querySelector('#logo-screen');
const musicStatus = document.querySelector('#music-status');
const fearOverlay = document.querySelector('#fear-overlay');
const fearAudio = document.querySelector('#fear-audio');
const secretDisplay = document.querySelector('#secret-display');
const secretStatus = document.querySelector('#secret-status');
const secretSubmit = document.querySelector('#secret-submit');
const nightClearButton = document.querySelector('#night-clear-button');
const visitProgress = document.querySelector('#visit-progress');
const nightClearTitle = document.querySelector('#night-clear-title');
const nightClearScreen = document.querySelector('#night-clear-screen');
const nightClearAudio = document.querySelector('#night-clear-audio');
const confetti = document.querySelector('#confetti');
const finalScareButton = document.querySelector('#final-scare-button');
const heartGameLaunch = document.querySelector('#heart-game-launch');
const heartGameScreen = document.querySelector('#heart-game-screen');
const heartGameBoard = document.querySelector('#heart-game-board');
const heartGameStart = document.querySelector('#heart-game-start');
const heartGameBack = document.querySelector('#heart-game-back');
const heartPlayer = document.querySelector('#heart-player');
const fallingHearts = document.querySelector('#falling-hearts');
const heartScore = document.querySelector('#heart-score');
const heartGameHint = document.querySelector('.heart-game-hint');
const heartReward = document.querySelector('#heart-reward');
const maxHeartScore = 10;
let heartGameTimer;
let heartAnimationFrame;
let heartGameRunning = false;
let heartsCaught = 0;
let fallingHeartItems = [];
let fearTimeout;
let finalCountdownTimer;
let finalCountdownStarted = false;
const visitedSections = new Set();
const secretCode = '07022024';
let audioContext;
let currentTrack = -1;
let melodyTimer;

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle('screen--active', screen.id === id));
}

function triggerFreddyJumpscare(event) {
  event.stopPropagation();
  window.clearTimeout(fearTimeout);
  document.body.classList.add('fear-shake');
  fearOverlay.classList.remove('is-closing');
  fearOverlay.classList.add('is-active');
  fearOverlay.setAttribute('aria-hidden', 'false');
  fearAudio.currentTime = 0;
  fearAudio.volume = 1;
  fearAudio.play().catch(() => {});
  fearTimeout = window.setTimeout(() => {
    fearOverlay.classList.add('is-closing');
    window.setTimeout(() => {
      fearOverlay.classList.remove('is-active', 'is-closing');
      fearOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('fear-shake');
    }, 100);
  }, 1400);
}

finalScareButton.addEventListener('click', triggerFreddyJumpscare);

let enteredSecretCode = '';

function updateSecretDisplay() {
  if (!enteredSecretCode) {
    secretDisplay.textContent = '__/__/____';
    return;
  }
  const digits = enteredSecretCode.slice(0, 8);
  secretDisplay.textContent = digits.length > 4
    ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    : digits;
}

function playUnlockSound() {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(330, now);
  oscillator.frequency.setValueAtTime(660, now + 0.12);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.48);
}

function playNightClearedSound() {
  nightClearAudio.currentTime = 0;
  nightClearAudio.play().catch(() => {
    musicStatus.textContent = '♫ activa el sonido para escuchar la celebración';
    musicStatus.classList.add('is-visible');
    window.setTimeout(startFinalButtonCountdown, 500);
  });
}

function startFinalButtonCountdown() {
  if (finalCountdownStarted) return;
  finalCountdownStarted = true;
  const countdown = document.querySelector('#final-scare-countdown');
  let seconds = 5;
  countdown.textContent = `ESPERA... ${seconds}`;
  countdown.classList.add('is-visible');
  finalScareButton.classList.remove('is-visible');
  finalCountdownTimer = window.setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      window.clearInterval(finalCountdownTimer);
      countdown.classList.remove('is-visible');
      finalScareButton.classList.add('is-visible');
      return;
    }
    countdown.textContent = `ESPERA... ${seconds}`;
  }, 1000);
}

nightClearAudio.addEventListener('ended', startFinalButtonCountdown);

function launchConfetti() {
  confetti.innerHTML = Array.from({ length: 42 }, (_, index) => `<span class="confetti-piece confetti-piece--${index % 4}" style="--confetti-index:${index}"></span>`).join('');
}

function submitSecretCode() {
  if (enteredSecretCode === secretCode) {
    secretStatus.textContent = 'Acceso autorizado ♥';
    secretStatus.classList.remove('is-error');
    playUnlockSound();
    showScreen('menu-screen');
    startAmbientSound();
    return;
  }
  secretStatus.textContent = 'Acceso denegado ❌ ¡Intenta con nuestra fecha especial! 🧸';
  secretStatus.classList.add('is-error');
}

document.querySelectorAll('[data-key]').forEach((key) => {
  key.addEventListener('click', () => {
    const value = key.dataset.key;
    if (value === 'clear') enteredSecretCode = '';
    else if (value === 'backspace') enteredSecretCode = enteredSecretCode.slice(0, -1);
    else if (enteredSecretCode.length < 8) enteredSecretCode += value;
    secretStatus.textContent = 'Escribe nuestra fecha especial';
    secretStatus.classList.remove('is-error');
    updateSecretDisplay();
  });
});

secretSubmit.addEventListener('click', submitSecretCode);

function updateVisitedProgress() {
  visitProgress.textContent = `RECUERDOS VISITADOS: ${visitedSections.size}/4`;
  if (visitedSections.size === 4) nightClearButton.classList.add('is-visible');
}

function startAmbientSound() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [220, 262, 330, 294, 247, 196];
    let noteIndex = 0;
    const playNote = () => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = 'triangle';
      oscillator.frequency.value = notes[noteIndex % notes.length];
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.025, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.72);
      noteIndex += 1;
    };
    playNote();
    melodyTimer = window.setInterval(playNote, 800);
    musicStatus.classList.add('is-visible');
  } catch (error) {
    musicStatus.textContent = '♫ modo silencioso';
    musicStatus.classList.add('is-visible');
  }
}

function stopAmbientSound() {
  if (melodyTimer) {
    window.clearInterval(melodyTimer);
    melodyTimer = undefined;
  }
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}

function startCountdown() {
  showScreen('countdown-screen');
  const number = document.querySelector('#countdown-number');
  let count = 3;
  number.textContent = count;
  const timer = setInterval(() => {
    count -= 1;
    if (count > 0) number.textContent = count;
    if (count === 0) {
      clearInterval(timer);
      showScreen('menu-screen');
    }
  }, 900);
}

startButton.addEventListener('click', () => {
  startAmbientSound();
  showScreen('logo-screen');
});

logoScreen.addEventListener('click', startCountdown);

document.querySelectorAll('[data-page]').forEach((card) => {
  card.addEventListener('click', () => {
    showScreen(`${card.dataset.page}-screen`);
    visitedSections.add(card.dataset.page);
    updateVisitedProgress();
  });
});
document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => showScreen('menu-screen'));
});

function showNightClearSequence() {
  stopAmbientSound();
  nightClearButton.disabled = true;
  showScreen('night-clear-screen');
  nightClearTitle.textContent = '5:59 AM';
  finalCountdownStarted = false;
  window.clearInterval(finalCountdownTimer);
  document.querySelector('#final-scare-countdown').classList.remove('is-visible');
  finalScareButton.classList.remove('is-visible');
  nightClearScreen.classList.remove('is-final', 'is-transitioning');
  void nightClearTitle.offsetWidth;
  nightClearScreen.classList.add('is-transitioning');
  window.setTimeout(() => {
    nightClearTitle.textContent = '6:00 AM';
    nightClearScreen.classList.remove('is-transitioning');
    nightClearScreen.classList.add('is-final');
    launchConfetti();
    window.setTimeout(playNightClearedSound, 1000);
  }, 500);
}

nightClearButton.addEventListener('click', showNightClearSequence);

function moveHeartPlayer(clientX) {
  const bounds = heartGameBoard.getBoundingClientRect();
  const playerHalfWidth = heartPlayer.offsetWidth / 2;
  const playerX = Math.max(playerHalfWidth, Math.min(bounds.width - playerHalfWidth, clientX - bounds.left));
  heartPlayer.style.left = `${playerX}px`;
}

function createFallingHeart() {
  const heart = document.createElement('span');
  const size = 22 + Math.random() * 10;
  const item = { element: heart, x: Math.random() * (heartGameBoard.clientWidth - size), y: -size, speed: 1.7 + Math.random() * 2.2, size };
  heart.className = 'falling-heart';
  heart.textContent = Math.random() > .35 ? '♥' : '✦';
  heart.style.fontSize = `${size}px`;
  heart.style.left = `${item.x}px`;
  fallingHearts.appendChild(heart);
  fallingHeartItems.push(item);
}

function updateFallingHearts() {
  if (!heartGameRunning) return;
  const boardHeight = heartGameBoard.clientHeight;
  const playerBounds = heartPlayer.getBoundingClientRect();
  fallingHeartItems = fallingHeartItems.filter((item) => {
    item.y += item.speed;
    item.element.style.transform = `translateY(${item.y}px)`;
    const heartBounds = item.element.getBoundingClientRect();
    const caught = heartBounds.bottom >= playerBounds.top && heartBounds.left < playerBounds.right && heartBounds.right > playerBounds.left;
    if (caught) {
      heartsCaught += 1;
      if (heartsCaught >= maxHeartScore) {
        heartsCaught = maxHeartScore;
        heartScore.textContent = maxHeartScore;
        heartGameHint.textContent = '¡10 CORAZONES! JUEGO COMPLETADO ♥';
        heartGameStart.textContent = 'JUEGO COMPLETADO';
        heartGameStart.disabled = true;
        heartReward.classList.add('is-visible');
        stopHeartGame();
      } else {
        heartScore.textContent = heartsCaught;
      }
      item.element.remove();
      return false;
    }
    if (item.y > boardHeight + item.size) {
      item.element.remove();
      return false;
    }
    return true;
  });
  if (heartGameRunning) heartAnimationFrame = window.requestAnimationFrame(updateFallingHearts);
}

function stopHeartGame() {
  heartGameRunning = false;
  window.clearInterval(heartGameTimer);
  window.cancelAnimationFrame(heartAnimationFrame);
  fallingHeartItems.forEach((item) => item.element.remove());
  fallingHeartItems = [];
}

function startHeartGame() {
  stopHeartGame();
  heartsCaught = 0;
  heartScore.textContent = '0';
  heartGameHint.textContent = 'MUEVE EL MOUSE PARA ATRAPARLOS';
  heartGameStart.disabled = false;
  heartReward.classList.remove('is-visible');
  heartGameRunning = true;
  heartGameStart.textContent = 'REINICIAR JUEGO';
  heartGameTimer = window.setInterval(createFallingHeart, 650);
  heartAnimationFrame = window.requestAnimationFrame(updateFallingHearts);
}

heartGameLaunch.addEventListener('click', () => showScreen('heart-game-screen'));
heartGameStart.addEventListener('click', startHeartGame);
heartGameBack.addEventListener('click', () => {
  stopHeartGame();
  showScreen('menu-screen');
});
heartGameBoard.addEventListener('mousemove', (event) => moveHeartPlayer(event.clientX));
heartGameBoard.addEventListener('touchmove', (event) => {
  moveHeartPlayer(event.touches[0].clientX);
  event.preventDefault();
}, { passive: false });

const songs = [
  { id: '01', title: 'Slap the city', artist: 'Drake, Qendresa', duration: '3:22', file: 'Slap the city', cover: 'Fondo 1.png' },
  { id: '02', title: 'Teenage fever', artist: 'Drake', duration: '3:39', file: 'Teenage fever', cover: 'Fondo 2.png' },
  { id: '03', title: 'Suki', artist: 'Álvaro Diaz Ft. Rainao', duration: '3:35', file: 'Suki', cover: 'Fondo 3.png' },
  { id: '04', title: 'Dímelo', artist: 'Gonzalo Genek, Daske, Gaintán', duration: '2:00', file: 'Dimelo-Gonzalo', cover: 'Fondo 4.png' },
  { id: '05', title: 'Table dance', artist: 'La Santa Grifa, Chino El Don', duration: '4:10', file: 'Table dance', cover: 'Fondo 5.png' }
];
const playlist = document.querySelector('#playlist');
const nowPlayingTitle = document.querySelector('#now-playing-title');
const nowPlayingArtist = document.querySelector('#now-playing-artist');
const nowPlayingImage = document.querySelector('#now-playing-image');
const audioPlayer = document.querySelector('#audio-player');
const progressBar = document.querySelector('#progress-bar');
const elapsedTime = document.querySelector('#elapsed-time');
const totalTime = document.querySelector('#total-time');
const previousTrackButton = document.querySelector('#previous-track-button');
const toggleTrackButton = document.querySelector('#toggle-track-button');
const cardNextTrackButton = document.querySelector('#card-next-track-button');
const musicControls = document.querySelector('#music-controls');
const stopMusicButton = document.querySelector('#stop-music-button');
const nextTrackButton = document.querySelector('#next-track-button');
audioPlayer.addEventListener('error', () => {
  musicStatus.textContent = 'No se pudo cargar el archivo de audio';
  musicStatus.classList.add('is-visible');
});
playlist.innerHTML = songs.map((song, index) => `<div class="track${index === 0 ? ' active' : ''}" data-track="${index}"><span class="track-number">${song.id}</span><span class="track-title">${song.title}</span><span class="track-time">${song.duration}</span></div>`).join('');

function playTrack(index) {
  currentTrack = index;
  const song = songs[currentTrack];
  const audioPath = `./${song.file}.mp3`;
  stopAmbientSound();
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  audioPlayer.src = encodeURI(audioPath);
  audioPlayer.load();
  progressBar.value = 0;
  progressBar.max = 0;
  elapsedTime.textContent = '0:00';
  totalTime.textContent = '0:00';
  audioPlayer.play().catch(() => {
    musicStatus.textContent = 'No se pudo reproducir la canción';
    musicStatus.classList.add('is-visible');
  });
  playlist.querySelectorAll('.track').forEach((item) => item.classList.remove('active'));
  playlist.querySelector(`[data-track="${currentTrack}"]`).classList.add('active');
  nowPlayingImage.src = encodeURI(`./${song.cover}`);
  nowPlayingImage.classList.remove('is-placeholder');
  nowPlayingImage.alt = `Portada de ${song.title}`;
  nowPlayingTitle.textContent = song.title;
  nowPlayingArtist.textContent = song.artist;
  musicStatus.textContent = `♫ reproduciendo: ${song.title}`;
  musicStatus.classList.add('is-visible');
  musicControls.classList.add('is-visible');
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

audioPlayer.addEventListener('loadedmetadata', () => {
  progressBar.max = audioPlayer.duration;
  totalTime.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', () => {
  progressBar.value = audioPlayer.currentTime;
  elapsedTime.textContent = formatTime(audioPlayer.currentTime);
});

progressBar.addEventListener('input', () => {
  audioPlayer.currentTime = Number(progressBar.value);
});

function updatePlayButton() {
  toggleTrackButton.textContent = audioPlayer.paused ? '▶' : 'Ⅱ';
  toggleTrackButton.setAttribute('aria-label', audioPlayer.paused ? 'Reproducir canción' : 'Pausar canción');
}

function updateFloatingMusicButton() {
  stopMusicButton.textContent = audioPlayer.paused ? '▶ iniciar' : '■ parar';
  stopMusicButton.setAttribute('aria-label', audioPlayer.paused ? 'Iniciar música' : 'Parar música');
}

playlist.querySelectorAll('.track').forEach((track) => {
  track.addEventListener('click', () => {
    playTrack(Number(track.dataset.track));
  });
});

stopMusicButton.addEventListener('click', () => {
  if (currentTrack < 0) return;
  if (audioPlayer.paused) {
    audioPlayer.play().then(() => {
      musicStatus.textContent = `♫ reproduciendo: ${songs[currentTrack].title}`;
      musicStatus.classList.add('is-visible');
    }).catch(() => {});
  } else {
    audioPlayer.pause();
    stopAmbientSound();
    musicStatus.textContent = '♫ música detenida';
    musicStatus.classList.add('is-visible');
  }
});

nextTrackButton.addEventListener('click', () => {
  playTrack((currentTrack + 1) % songs.length);
});

previousTrackButton.addEventListener('click', () => {
  playTrack((currentTrack - 1 + songs.length) % songs.length);
});

cardNextTrackButton.addEventListener('click', () => {
  playTrack((currentTrack + 1) % songs.length);
});

toggleTrackButton.addEventListener('click', () => {
  if (currentTrack < 0) {
    playTrack(0);
  } else if (audioPlayer.paused) {
    audioPlayer.play().catch(() => {});
  } else {
    audioPlayer.pause();
  }
  updatePlayButton();
});

audioPlayer.addEventListener('play', () => {
  updatePlayButton();
  updateFloatingMusicButton();
});
audioPlayer.addEventListener('pause', () => {
  updatePlayButton();
  updateFloatingMusicButton();
});
audioPlayer.addEventListener('ended', () => playTrack((currentTrack + 1) % songs.length));

const messages = [
  'Tu sonrisa cuando te cuento algo bobo y cómo me haces sentir en paz... 🧸💖',
  'Lo hermosa que te ves incluso cuando estás despeinada o con sueño 🎀✨',
  'Eres mi persona favorita para hablar de cualquier cosa a cualquier hora 🐱🤍',
  'Tu forma única de hacerme reír siempre que estoy estresado 🐾💗'
];
const messageGrid = document.querySelector('#message-grid');
const messageOutput = document.querySelector('#message-output');
messageGrid.innerHTML = messages.map((message, index) => `<button class="message-button" type="button" data-message="${message}">CAJA ${String(index + 1).padStart(2, '0')} // ABRIR</button>`).join('');
messageGrid.querySelectorAll('.message-button').forEach((button) => {
  button.addEventListener('click', () => {
    messageGrid.querySelectorAll('.message-button').forEach((item) => item.classList.remove('is-selected'));
    button.classList.add('is-selected');
    messageOutput.textContent = button.dataset.message;
  });
});

const photos = [
  ['Fondo 1.jpg', 'tú + yo 🧸💖'],
  ['Fondo 2.jpg', 'juntos 🎀💖'],
  ['Fondo 3.jpg', 'mi lugar feliz 🧸'],
  ['Fondo 4.jpg', 'nuestro universo 💖'],
  ['Fondo 5.jpg', 'siempre contigo 🎀'],
  ['Fondo 6.jpg', 'mi persona favorita 🧸💖']
];
const photoCollage = document.querySelector('#photo-collage');
photoCollage.innerHTML = photos.map(([file, caption], index) => `
  <figure class="polaroid polaroid--${index + 1}">
    <div class="photo-frame"><img src="${file}" alt="Recuerdo ${index + 1}" loading="lazy"></div>
    <figcaption>${caption}</figcaption>
  </figure>
`).join('');
