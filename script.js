const audio = document.getElementById('bg-music');
const slider = document.getElementById('volume-slider');
audio.volume = 0.5;
slider.value = audio.volume;
slider.addEventListener('input', () => { audio.volume = slider.value; });

// Theme toggle
const toggleBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
  toggleBtn.textContent = '🌙 DARK';
}
toggleBtn.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    document.documentElement.removeAttribute('data-theme');
    toggleBtn.textContent = '☀️ LIGHT';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    toggleBtn.textContent = '🌙 DARK';
    localStorage.setItem('theme', 'light');
  }
});

// Skill tag → Google search on click
document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.style.cursor = 'pointer';
  tag.addEventListener('click', () => {
    const query = encodeURIComponent(tag.textContent.trim());
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  });
});

// Footer character running animation
const footerChar = document.getElementById('footer-char');
const charBubble = document.getElementById('char-bubble');
const bubbleText = document.getElementById('bubble-text');
const SPEED_PX_S = 100; // pixels per second
let runningRight = true;

function calcDuration(distancePx) {
  return Math.round(distancePx / SPEED_PX_S * 1000); // ms
}

function startRun() {
  const totalDist = window.innerWidth + 200; // -180px to 110vw ≈ screen + 200
  const duration = calcDuration(totalDist);
  footerChar.style.animation = 'none';
  footerChar.offsetHeight; // reflow
  if (runningRight) {
    footerChar.style.animation = `run-right ${duration}ms linear`;
  } else {
    footerChar.style.animation = `run-left ${duration}ms linear`;
  }
  runningRight = !runningRight;
}

footerChar.addEventListener('animationend', () => { if (!isIdle) startRun(); });
startRun(); // kick off

// Click to toggle idle / run
let isIdle = false;
let savedLeft = null;
let savedFacingLeft = false;
let isLocked = false;

function toggleChar(e) {
  e.preventDefault();
  if (isLocked) return;
  isIdle = !isIdle;
  if (isIdle) {
    // Freeze at current position
    savedLeft = footerChar.getBoundingClientRect().left;
    savedFacingLeft = !runningRight;
    footerChar.style.animation = 'none';
    footerChar.style.left = savedLeft + 'px';
    footerChar.style.transform = savedFacingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    footerChar.src = 'animation1.gif';
    // Show bubble at character position (reset text first)
    bubbleText.innerHTML = "Hey! What's going on? I'm on a mission —<br>wanna join? ⚔️";
    document.getElementById('bubble-btns').style.display = 'flex';
    charBubble.style.left = savedLeft + 'px';
    charBubble.classList.add('visible');
  } else {
    // Show "bored" message briefly then resume
    bubbleText.innerHTML = 'Ugh, you bore me. 😒<br>Stop bothering me!';
    document.getElementById('bubble-btns').style.display = 'none';
    charBubble.classList.add('visible');
    isLocked = true;
    setTimeout(() => {
      isLocked = false;
      charBubble.classList.remove('visible');
      // Resume from saved position in same direction
      footerChar.src = 'animation3.gif';
      const screenW = window.innerWidth;
      const target = savedFacingLeft ? -180 : screenW + 20;
      const dist = Math.abs(target - savedLeft);
      const fullDist = screenW + 200;
      const duration = calcDuration(dist);
      const scaleX = savedFacingLeft ? -1 : 1;

      // Inject one-shot keyframe
      const styleId = 'resume-kf';
      document.getElementById(styleId)?.remove();
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `@keyframes resume-run {
          from { left: ${savedLeft}px; transform: scaleX(${scaleX}); }
          to   { left: ${target}px;   transform: scaleX(${scaleX}); }
        }`;
      document.head.appendChild(s);

      footerChar.style.transform = '';
      footerChar.style.left = '';
      footerChar.style.animation = 'none';
      footerChar.offsetHeight; // reflow
      footerChar.style.animation = `resume-run ${duration}ms linear`;

      // After this one-shot, hand back to normal loop
      footerChar.addEventListener('animationend', function onResume() {
        footerChar.removeEventListener('animationend', onResume);
        if (!isIdle) startRun();
      }, { once: true });
    }, 2000); // locked for 2s
  }
}

footerChar.addEventListener('click', toggleChar);
footerChar.addEventListener('touchstart', toggleChar, { passive: false });

// Yes / No button handlers
document.getElementById('btn-yes').addEventListener('click', (e) => {
  e.stopPropagation();
  bubbleText.innerHTML = "Awesome! Let's go! 🔥<br>...just kidding, I'm a GIF 😅";
  document.getElementById('bubble-btns').style.display = 'none';
  setTimeout(() => {
    charBubble.classList.remove('visible');
    isIdle = false;
    footerChar.src = 'animation3.gif';
    startRun();
    scheduleNextQuote();
  }, 2000);
});

document.getElementById('btn-no').addEventListener('click', (e) => {
  e.stopPropagation();
  bubbleText.innerHTML = 'Ugh, you bore me. 😒<br>Stop bothering me!';
  document.getElementById('bubble-btns').style.display = 'none';
  isLocked = true;
  setTimeout(() => {
    isLocked = false;
    charBubble.classList.remove('visible');
    isIdle = false;
    footerChar.src = 'animation3.gif';
    startRun();
    scheduleNextQuote();
  }, 2000);
});

// Random quotes while running
function getRunningQuotes() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return [
    "If I were a recruiter,<br>I'd hire this guy. Pretty solid. 👀",
    isLight
      ? "Switch to Dark Theme,<br>I wanna sleep already... 🌙"
      : "Switch to Light Theme!<br>It's daytime, ya cow! ☀️",
    "I'll fight until I drop. ⚔️",
    "Those goblins are absolutely<br>UNHINGED. 😤",
    "My legs never get tired.<br>I'm built different. 💪",
    "Have you checked out<br>his Google Play game? Go look! 🎮",
    "Unity? C#? He knows his stuff.<br>Trust me, I live here. 🏠",
    "I've been running for so long...<br>WHERE IS THE END?! 😭",
    "Someone give this dev a job.<br>Seriously. NOW. 👇",
    "I once defeated a dragon.<br>NBD. 🐉",
    "My sword is sharper than<br>my wit. ...barely. 😅",
    "Psst. Click the skill tags.<br>They open Google! 🔍",
    "Dark theme = pro mode.<br>Fight me. 😎",
    "Loading awesome content...<br>Oh wait, it's already here. ✅",
  ];
}

let quoteTimer = null;

function scheduleNextQuote() {
  clearTimeout(quoteTimer);
  const delay = 5000;
  quoteTimer = setTimeout(() => {
    if (!isIdle) showRunningQuote();
  }, delay);
}

let bubbleTrackRAF = null;

function trackBubbleToChar() {
  const charRect = footerChar.getBoundingClientRect();
  charBubble.style.left = charRect.left + 'px';
  bubbleTrackRAF = requestAnimationFrame(trackBubbleToChar);
}

function stopBubbleTracking() {
  if (bubbleTrackRAF) {
    cancelAnimationFrame(bubbleTrackRAF);
    bubbleTrackRAF = null;
  }
}

function showRunningQuote() {
  const quotes = getRunningQuotes();
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  bubbleText.innerHTML = quote;
  document.getElementById('bubble-btns').style.display = 'none';
  charBubble.classList.add('visible');
  trackBubbleToChar(); // start following character

  setTimeout(() => {
    charBubble.classList.remove('visible');
    stopBubbleTracking();
    if (!isIdle) scheduleNextQuote();
  }, 3600);
}

// Kick off the first quote after 6s
quoteTimer = setTimeout(() => { if (!isIdle) showRunningQuote(); }, 3600);

// Strength card click toggle
document.querySelectorAll('.strength-card').forEach(card => {
  card.addEventListener('click', () => {
    const wasSelected = card.classList.contains('selected');
    document.querySelectorAll('.strength-card').forEach(c => c.classList.remove('selected'));
    if (!wasSelected) card.classList.add('selected');
  });
});

// Smooth scroll for nav — offset for sticky header + nav
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerH = document.querySelector('header')?.offsetHeight || 70;
        const navH = document.querySelector('nav')?.offsetHeight || 35;
        const offset = headerH + navH + 8;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});