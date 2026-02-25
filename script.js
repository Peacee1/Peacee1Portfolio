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
const RUN_DURATION = 8000; // ms to cross screen
let runningRight = true;

function startRun() {
  footerChar.style.animation = 'none';
  footerChar.offsetHeight; // reflow
  if (runningRight) {
    footerChar.style.animation = `run-right ${RUN_DURATION}ms linear`;
  } else {
    footerChar.style.animation = `run-left ${RUN_DURATION}ms linear`;
  }
  runningRight = !runningRight;
}

footerChar.addEventListener('animationend', () => { if (!isIdle) startRun(); });
startRun(); // kick off

// Click to toggle idle / run
let isIdle = false;
let savedLeft = null;
let savedFacingLeft = false;

function toggleChar(e) {
  e.preventDefault();
  isIdle = !isIdle;
  if (isIdle) {
    // Freeze at current position
    savedLeft = footerChar.getBoundingClientRect().left;
    savedFacingLeft = !runningRight;
    footerChar.style.animation = 'none';
    footerChar.style.left = savedLeft + 'px';
    footerChar.style.transform = savedFacingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    footerChar.src = 'animation1.gif';
  } else {
    // Resume from saved position in same direction
    footerChar.src = 'animation3.gif';
    const screenW = window.innerWidth;
    const target = savedFacingLeft ? -180 : screenW + 20;
    const dist = Math.abs(target - savedLeft);
    const fullDist = screenW + 200;
    const duration = Math.round(RUN_DURATION * dist / fullDist);
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
  }
}

footerChar.addEventListener('click', toggleChar);
footerChar.addEventListener('touchstart', toggleChar, { passive: false });

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