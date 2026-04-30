const USER_ID = "1107883033941512292";
const DISCORD_TAG = "1107883033941512292";
const CUSTOM_TRACK_URL = "co-chac-yeu-la-day-remix.mp3";
const TYPING_LINES = [
  "Hoàng Thích",
  "Êm dịu và thơ mộng",
  "Kết nối, chuyển khoản, tương tác"
];

const loader = document.getElementById("loader");
const enterButton = document.getElementById("enter-button");
const audioElement = document.getElementById("music");
const musicToggle = document.getElementById("music-toggle");
const themeToggle = document.getElementById("theme-toggle");
const volumeSlider = document.getElementById("volume-slider");
const clockElement = document.getElementById("clock");
const dateElement = document.getElementById("date-text");
const batteryElement = document.getElementById("battery-text");
const musicStateElement = document.getElementById("music-state");
const musicDetailElement = document.getElementById("music-detail");
const typingElement = document.getElementById("typing-text");
const statusElement = document.getElementById("discord-status");
const presenceDot = document.getElementById("presence-dot");
const copyDiscordButton = document.getElementById("copy-discord");
const copyBankButton = document.getElementById("copy-bank");
const copyBankNameButton = document.getElementById("copy-bank-name");
const copyBankOwnerButton = document.getElementById("copy-bank-owner");
const copyBankFullButton = document.getElementById("copy-bank-full");
const bankAccountElement = document.getElementById("bank-account");
const viewCountElement = document.getElementById("view-count");

let ambientAudioContext;
let ambientMasterGain;
let ambientOscillators = [];
let ambientLfo;
let usingAmbientFallback = false;
let audioStarted = false;

audioElement.volume = Number(volumeSlider.value) / 100;
audioElement.src = CUSTOM_TRACK_URL;

function hideLoader() {
  loader.classList.add("is-hidden");
}

async function startAudioExperience() {
  if (audioStarted) {
    return;
  }

  audioStarted = true;
  try {
    await audioElement.play();
    usingAmbientFallback = false;
    musicStateElement.textContent = "Có chắc yêu là đây";
    musicDetailElement.textContent = "Remix local";
    updateMusicButton(true);
  } catch (error) {
    startAmbientFallback();
  }
}

function startAmbientFallback() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    musicStateElement.textContent = "Âm thanh không hỗ trợ";
    musicDetailElement.textContent = "Trình duyệt này không hỗ trợ Web Audio.";
    updateMusicButton(false);
    return;
  }

  if (!ambientAudioContext) {
    ambientAudioContext = new AudioContextClass();
    ambientMasterGain = ambientAudioContext.createGain();
    ambientMasterGain.gain.value = Number(volumeSlider.value) / 320;
    ambientMasterGain.connect(ambientAudioContext.destination);

    const notes = [196, 220, 261.63, 293.66, 329.63];
    ambientOscillators = notes.map((frequency, index) => {
      const oscillator = ambientAudioContext.createOscillator();
      const gain = ambientAudioContext.createGain();
      const filter = ambientAudioContext.createBiquadFilter();

      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.003 + index * 0.0016;
      filter.type = "lowpass";
      filter.frequency.value = 1200 + index * 180;
      filter.Q.value = 0.8;

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(ambientMasterGain);
      oscillator.start();

      return { oscillator, gain, filter, baseFrequency: frequency };
    });

    ambientLfo = ambientAudioContext.createOscillator();
    const ambientLfoGain = ambientAudioContext.createGain();
    ambientLfo.type = "sine";
    ambientLfo.frequency.value = 0.12;
    ambientLfoGain.gain.value = 18;
    ambientLfo.connect(ambientLfoGain);
    ambientOscillators.forEach((item) => {
      ambientLfoGain.connect(item.filter.frequency);
    });
    ambientLfo.start();

    animateAmbientSound();
  }

  ambientAudioContext.resume();
  usingAmbientFallback = true;
  musicStateElement.textContent = "Nhạc nền dự phòng";
  musicDetailElement.textContent = "Thêm file remix vào thư mục";
  updateMusicButton(true);
}

function stopAudioExperience() {
  audioElement.pause();

  if (ambientAudioContext) {
    ambientAudioContext.suspend();
  }

  audioStarted = false;
  updateMusicButton(false);
  musicDetailElement.textContent = "Đã tắt";
}

function updateMusicButton(isPlaying) {
  musicToggle.innerHTML = isPlaying
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
}

function animateAmbientSound() {
  if (!ambientAudioContext || !ambientOscillators.length) {
    return;
  }

  const now = ambientAudioContext.currentTime;

  ambientOscillators.forEach((item, index) => {
    const wobble = Math.sin(Date.now() / 3200 + index * 0.8) * 2.4;
    const drift = Math.cos(Date.now() / 5100 + index) * 1.3;
    item.oscillator.frequency.linearRampToValueAtTime(item.baseFrequency + wobble + drift, now + 1.8);
  });

  setTimeout(animateAmbientSound, 1800);
}

function updateClock() {
  const now = new Date();

  clockElement.textContent = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  dateElement.textContent = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function initViews() {
  const key = "info-views";
  const nextCount = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(nextCount));
  viewCountElement.textContent = nextCount.toLocaleString("vi-VN");
}

function typeLines() {
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const line = TYPING_LINES[lineIndex];

    if (!deleting) {
      charIndex += 1;
      typingElement.textContent = line.slice(0, charIndex);

      if (charIndex === line.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      charIndex -= 1;
      typingElement.textContent = line.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % TYPING_LINES.length;
      }
    }

    setTimeout(tick, deleting ? 35 : 55);
  }

  tick();
}

async function loadDiscordStatus() {
  if (!USER_ID || USER_ID === "YOUR_DISCORD_ID") {
    statusElement.textContent = "Chưa gắn Discord ID";
    presenceDot.style.background = "#7e8ba0";
    return;
  }

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
    const json = await response.json();
    const status = json?.data?.discord_status || "offline";
    const mapping = {
      online: { label: "Online", color: "#57f287" },
      idle: { label: "Idle", color: "#f0b232" },
      dnd: { label: "Không làm phiền", color: "#ed4245" },
      offline: { label: "Ngoại tuyến", color: "#7e8ba0" }
    };
    const state = mapping[status] || mapping.offline;
    statusElement.textContent = state.label;
    presenceDot.style.background = state.color;
  } catch (error) {
    statusElement.textContent = "Không tải được trạng thái";
    presenceDot.style.background = "#7e8ba0";
  }
}

async function loadBattery() {
  if (!("getBattery" in navigator)) {
    batteryElement.textContent = "Không hỗ trợ";
    return;
  }

  try {
    const battery = await navigator.getBattery();

    function renderBattery() {
      const level = Math.round(battery.level * 100);
      batteryElement.textContent = battery.charging ? `${level}% | Đang sạc` : `${level}%`;
    }

    renderBattery();
    battery.addEventListener("levelchange", renderBattery);
    battery.addEventListener("chargingchange", renderBattery);
  } catch (error) {
    batteryElement.textContent = "Không đọc được";
  }
}

function setupThemeToggle() {
  const storageKey = "info-theme";
  const savedTheme = localStorage.getItem(storageKey);

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    localStorage.setItem(storageKey, isLight ? "light" : "dark");
    themeToggle.innerHTML = isLight
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  });
}

function setupCopyButton() {
  copyDiscordButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(DISCORD_TAG);
      copyDiscordButton.innerHTML = '<i class="fa-solid fa-check"></i> Đã sao chép';
      setTimeout(() => {
        copyDiscordButton.innerHTML = '<i class="fa-regular fa-copy"></i> Sao chép Discord ID';
      }, 1600);
    } catch (error) {
      copyDiscordButton.innerHTML = '<i class="fa-solid fa-xmark"></i> Sao chép thất bại';
    }
  });
}

function setupBankCopyButton() {
  if (!copyBankButton || !bankAccountElement) {
    return;
  }

  copyBankButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bankAccountElement.textContent.trim());
      copyBankButton.innerHTML = '<i class="fa-solid fa-check"></i> Đã sao chép STK';
      setTimeout(() => {
        copyBankButton.innerHTML = '<i class="fa-regular fa-copy"></i> Sao chép STK';
      }, 1600);
    } catch (error) {
      copyBankButton.innerHTML = '<i class="fa-solid fa-xmark"></i> Sao chép thất bại';
    }
  });
}

function wireCopyButton(button, text, idleLabel, successLabel) {
  if (!button) {
    return;
  }

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      button.innerHTML = `<i class="fa-solid fa-check"></i> ${successLabel}`;
      setTimeout(() => {
        button.innerHTML = `<i class="fa-regular fa-copy"></i> ${idleLabel}`;
      }, 1600);
    } catch (error) {
      button.innerHTML = '<i class="fa-solid fa-xmark"></i> Lỗi';
    }
  });
}

function setupVolume() {
  volumeSlider.addEventListener("input", (event) => {
    const volume = Number(event.target.value) / 100;
    audioElement.volume = volume;

    if (ambientMasterGain) {
      ambientMasterGain.gain.value = volume / 3.2;
    }
  });
}

function setupMusicToggle() {
  musicToggle.addEventListener("click", async () => {
    const isPlayingNative = !audioElement.paused;
    const isPlayingAmbient = usingAmbientFallback && ambientAudioContext?.state === "running";

    if (isPlayingNative || isPlayingAmbient) {
      stopAudioExperience();
      return;
    }

    await startAudioExperience();
  });
}

function initSnow() {
  const canvas = document.getElementById("snow");
  const context = canvas.getContext("2d");
  let flakes = [];
  let angle = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flakes = Array.from({ length: Math.max(90, Math.floor(window.innerWidth / 14)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.5,
      speed: Math.random() * 0.45 + 0.08,
      alpha: Math.random() * 0.45 + 0.4
    }));
  }

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
    flakes.forEach((flake) => {
      context.beginPath();
      context.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
      context.shadowColor = "rgba(255,255,255,0.45)";
      context.shadowBlur = 10;
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.shadowBlur = 0;

    angle += 0.003;
    flakes.forEach((flake) => {
      flake.y += flake.speed + Math.cos(angle + flake.x * 0.01) * 0.18;
      flake.x += Math.sin(angle + flake.y * 0.01) * 0.18;

      if (flake.y > canvas.height + 6) {
        flake.y = -8;
        flake.x = Math.random() * canvas.width;
      }

      if (flake.x > canvas.width + 6) {
        flake.x = -6;
      } else if (flake.x < -6) {
        flake.x = canvas.width + 6;
      }
    });

    requestAnimationFrame(render);
  }

  resizeCanvas();
  render();
  window.addEventListener("resize", resizeCanvas);
}

enterButton.addEventListener("click", async () => {
  hideLoader();
  await startAudioExperience();
});

window.addEventListener("load", () => {
  updateClock();
  setInterval(updateClock, 1000);

  initViews();
  typeLines();
  loadDiscordStatus();
  loadBattery();
  setupThemeToggle();
  setupCopyButton();
  setupBankCopyButton();
  wireCopyButton(copyBankNameButton, "Techcombank", "Tên", "Đã chép");
  wireCopyButton(copyBankOwnerButton, "NGUYEN HOANG THICH", "Chủ TK", "Đã chép");
  wireCopyButton(copyBankFullButton, "Techcombank | NGUYEN HOANG THICH | 3037 3736 840", "Full", "Đã chép");
  setupVolume();
  setupMusicToggle();
  initSnow();
});
