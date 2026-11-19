/* ===== Navya's Birthday – script ===== */
/* 1) EDIT THESE LISTS to add/replace photos and captions */
const CFG = {
  solo: [
    { src: 'images/solo/solo1.jpg', cap: 'That confident smile ✨' },
    { src: 'images/solo/solo2.jpg', cap: 'Same sparkle, since forever 👍' },
    { src: 'images/solo/solo3.jpg', cap: 'Pure elegance 💗' },
    { src: 'images/solo/solo4.jpg', cap: 'Main character energy 🎬' }
  ],
  wish: 'images/birthday-wish/wish.jpg',
  memories: [
    { src: 'images/memories/m1.png' },
    { src: 'images/memories/m2.jpg' },
    { src: 'images/memories/m3.jpg' },
    { src: 'images/memories/m5.png' },
    { src: 'images/memories/m6.png' },
    { src: 'images/memories/m4.jpg' }
  ],
  reasons: [
    'Because you\'re still in your mini version era. 😂 SMALL ',
    'Because you\'re my first female friend, and I guess that makes you unforgettable..',
    'And somehow, we haven\'t fought or annoyed each other yet. Either we\'re too mature or we\'re both hiding our true personalities. 💀',
    'You\'re my friend, so obviously I\'m smart, because only intelligent people know how to choose the right friends.😎😎',
    'Orrr tum aaj maan he lo ki mere pass bahot jada dimag hai 😁 ',
    'I don\'t know exactly how or why we became friends. It just happened naturally, and I guess some connections are never planned.💖💕💞',
  ]
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 2) AUDIO (synthesised with Web Audio, so no files needed) ---------- */
let ac, musicG, sfxG, soundOn = true, musicOn = true, musicVol = .5, sfxVol = .7, duck = 1, started = false;

function initAudio() {
  if (ac) return;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    musicG = ac.createGain(); sfxG = ac.createGain();
    musicG.gain.value = 0; musicG.connect(ac.destination); sfxG.connect(ac.destination);
  } catch (e) { ac = null; }
}
// Smoothly fade music to the current volume (fade in/out, ducking)
function applyVol() {
  if (!ac) return;
  const t = ac.currentTime, g = musicG.gain;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(soundOn && musicOn && started ? musicVol * .3 * duck : 0, t + 1.2);
  sfxG.gain.value = soundOn ? sfxVol : 0;
}
function tone(f, t, d, v, dest, type = 'sine') {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .02);
  g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(dest); o.start(t); o.stop(t + d + .05);
}
function noise(t, d, v, fq) {
  const n = ac.sampleRate * d, b = ac.createBuffer(1, n, ac.sampleRate), a = b.getChannelData(0);
  for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = b; f.type = 'lowpass'; f.frequency.value = fq; g.gain.value = v;
  s.connect(f).connect(g).connect(sfxG); s.start(t);
}
// Sound effects: pop, click, shutter, open, magic, boom
function sfx(k) {
  if (!ac || !soundOn) return;
  if (ac.state === 'suspended') ac.resume();
  const t = ac.currentTime;
  if (k === 'pop') {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(rnd(450, 900), t); o.frequency.exponentialRampToValueAtTime(120, t + .12);
    g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.001, t + .14);
    o.connect(g).connect(sfxG); o.start(t); o.stop(t + .15); noise(t, .05, .12, 3000);
  } else if (k === 'click') tone(900, t, .06, .22, sfxG, 'triangle');
  else if (k === 'shutter') { noise(t, .04, .35, 5000); noise(t + .08, .06, .25, 4000); tone(2200, t + .12, .3, .08, sfxG); }
  else if (k === 'open' || k === 'magic') [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, t + i * .09, .8, .18, sfxG));
  else if (k === 'boom') { noise(t, .9, .6, 900); tone(70, t, .5, .4, sfxG); for (let i = 0; i < 8; i++) noise(t + .2 + i * .07, .05, .15, 6000); }
}
// Dreamy background music: slow bell/piano-like arpeggios (C – Am – F – G)
const CH = [[261.6, 329.6, 392, 523.3], [220, 261.6, 329.6, 440], [174.6, 220, 261.6, 349.2], [196, 246.9, 293.7, 392]];
let nextT = 0, idx = 0;
function schedule() {
  if (!ac) return;
  if (nextT < ac.currentTime) nextT = ac.currentTime + .1;
  while (nextT < ac.currentTime + 1.5) {
    const ch = CH[Math.floor(idx / 8) % 4], n = [0, 1, 2, 3, 2, 1, 2, 3][idx % 8];
    tone(ch[n], nextT, 2.4, .5, musicG); tone(ch[n] * 2, nextT, 1.2, .08, musicG);
    if (idx % 8 === 0) tone(ch[0] / 2, nextT, 3.4, .6, musicG, 'triangle');
    idx++; nextT += .4;
  }
}
function startMusic() { if (started || !ac) return; started = true; schedule(); setInterval(schedule, 500); applyVol(); }

/* ---------- 3) FIREWORKS / CONFETTI / SPARKLES (one canvas) ---------- */
const cv = $('#fx'), cx = cv.getContext('2d');
let P = [], raf = null;
const COL = ['#ff8fb8', '#c9a7ff', '#ffd6e8', '#ffffff', '#ffe08a', '#9ad0ff'];
function resize() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', resize); resize();
function add(p) { P.push(p); if (!raf) raf = requestAnimationFrame(loop); }
function burst(x, y, n = 28, big) {
  if (reduce) n = Math.min(n, 8);
  for (let i = 0; i < n; i++) {
    const a = rnd(0, 6.28), s = rnd(1, big ? 8 : 4.5);
    add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .06, life: rnd(50, 85), max: 85, c: COL[i % 6], s: rnd(2, 4), t: i % 5 === 0 ? 's' : i % 3 === 0 ? 'f' : 'c' });
  }
}
function confetti(n = 120) {
  if (reduce) n = 20;
  for (let i = 0; i < n; i++) add({ x: rnd(0, innerWidth), y: -10, vx: rnd(-1.5, 1.5), vy: rnd(2, 5), g: .02, life: 170, max: 170, c: COL[i % 6], s: rnd(3, 6), t: 'f' });
}
function show(n) { // fireworks show
  for (let i = 0; i < n; i++) setTimeout(() => { burst(rnd(.1, .9) * innerWidth, rnd(.1, .55) * innerHeight, 55, true); sfx('boom'); }, i * 380);
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  P = P.filter(p => p.life > 0);
  for (const p of P) {
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .99; p.life--;
    cx.globalAlpha = Math.min(1, p.life / p.max * 1.6); cx.fillStyle = p.c;
    if (p.t === 'f') cx.fillRect(p.x, p.y, p.s * 1.6, p.s);
    else if (p.t === 's') { cx.font = p.s * 4 + 'px serif'; cx.fillText('✦', p.x, p.y); }
    else { cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 7); cx.fill(); }
  }
  cx.globalAlpha = 1;
  raf = P.length ? requestAnimationFrame(loop) : null;
  if (!raf) cx.clearRect(0, 0, cv.width, cv.height);
}

/* ---------- 4) GLOBAL INTERACTIONS ---------- */
// Click / tap anywhere: sound + firework burst at the exact spot
document.addEventListener('pointerdown', e => {
  initAudio(); if (ac && ac.state === 'suspended') ac.resume();
  if (!started) { started = false; startMusic(); }
  const t = e.target;
  let k = 'pop';
  if (t.closest('button,.card')) k = 'click';
  if (t.closest('.polaroid,.mem,.frame')) k = 'shutter';
  sfx(k); burst(e.clientX, e.clientY, k === 'click' ? 12 : 26);
});
// Cursor sparkle trail (mouse only)
let lastSp = 0;
document.addEventListener('pointermove', e => {
  if (reduce || e.pointerType !== 'mouse' || Date.now() - lastSp < 45) return;
  lastSp = Date.now();
  add({ x: e.clientX, y: e.clientY, vx: rnd(-.5, .5), vy: rnd(-.3, .6), g: .01, life: 30, max: 30, c: COL[Math.floor(rnd(0, 6))], s: rnd(1.5, 3), t: 's' });
});
// Magnetic buttons
$$('.mag').forEach(b => {
  b.addEventListener('pointermove', e => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
  b.addEventListener('pointerleave', () => b.style.transform = '');
});

/* ---------- 5) BUILD GALLERIES (missing images become friendly placeholders) ---------- */
function img(src, alt) {
  const i = new Image(); i.src = src; i.alt = alt || ''; i.loading = 'lazy';
  i.onerror = () => { const d = document.createElement('div'); d.className = 'empty'; d.textContent = '📷 Add photo: ' + src; i.replaceWith(d); };
  return i;
}
CFG.solo.forEach((p, n) => {
  const d = document.createElement('figure'); d.className = 'polaroid rv';
  d.style.transform = `rotate(${[-3, 2, -1.5, 3][n % 4]}deg)`; d.style.transitionDelay = n * .1 + 's';
  const w = document.createElement('div'); w.className = 'ph'; w.append(img(p.src, p.cap)); d.append(w);
  if (p.cap) d.insertAdjacentHTML('beforeend', `<p>${p.cap}</p>`);
  $('#soloGrid').append(d);
});
$('#wishFrame').append(img(CFG.wish, 'Birthday wish from last year'));
CFG.memories.forEach(m => { const d = document.createElement('div'); d.className = 'mem rv'; d.append(img(m.src)); $('#memGrid').append(d); });
CFG.reasons.forEach(r => {
  const c = document.createElement('div'); c.className = 'card rv';
  c.innerHTML = `<div class="f">Tap to reveal 💗</div><div class="b">${r}</div>`;
  c.onclick = () => { c.classList.toggle('on'); sfx('magic'); };
  $('#cards').append(c);
});
// Lightbox
const lb = $('#lb');
document.addEventListener('click', e => {
  const im = e.target.closest('.polaroid img,.mem img,.frame img');
  if (im) { $('img', lb).src = im.src; lb.classList.add('show'); }
  else if (e.target.closest('#lb')) lb.classList.remove('show');
});
addEventListener('keydown', e => e.key === 'Escape' && lb.classList.remove('show'));

/* ---------- 6) SCROLL EFFECTS ---------- */
// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
$$('.rv').forEach(el => io.observe(el));
// Typewriter for the birthday message
const msg = $('#msg'), full = msg.textContent; let typed = false;
if (!reduce) msg.textContent = '';
new IntersectionObserver((es, o) => {
  if (es[0].isIntersecting && !typed && !reduce) {
    typed = true; let i = 0;
    const tick = () => { msg.textContent = full.slice(0, i += 2); if (i < full.length) setTimeout(tick, 22); else msg.textContent = full; };
    tick();
  }
}, { threshold: .3 }).observe($('#message'));
// Lower the music during last year's wish (emotional moment)
new IntersectionObserver(es => { duck = es[0].isIntersecting ? .4 : 1; applyVol(); }, { threshold: .5 }).observe($('#wish'));
// Progress bar, back-to-top
const prog = $("#prog"), toTopBtn = $("#toTop");
addEventListener('scroll', () => {
  const h = document.documentElement;
  prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  toTopBtn.classList.toggle('show', h.scrollTop > 600);
}, { passive: true });
toTopBtn.onclick = () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
// Floating hearts & stars
if (!reduce) for (let i = 0; i < 16; i++) {
  const s = document.createElement('span'); s.className = 'fl';
  s.textContent = ['💗', '✦', '💜', '✨', '🤍'][i % 5];
  s.style.cssText = `left:${rnd(0, 100)}%;font-size:${rnd(14, 30)}px;animation-duration:${rnd(10, 22)}s;animation-delay:${rnd(-20, 0)}s`;
  $('#hearts').append(s);
}

/* ---------- 7) BUTTONS ---------- */
// Hero envelope
$('#openBtn').onclick = e => {
  $('#env').classList.add('open'); $('#hbd').classList.add('show');
  e.target.textContent = 'Surprise! 🎉'; sfx('open'); confetti(180); show(2);
};
// Birthday cake
$('#wishBtn').onclick = () => {
  $('#cakeSvg').classList.add('out'); $('#wishMsg').classList.add('show');
  sfx('magic'); confetti(200); show(4);
  if (ac) { const t = ac.currentTime;[523, 659, 784, 1047].forEach((f, i) => tone(f, t + .4 + i * .15, 1.4, .25, sfxG)); }
};
// Final surprise
$('#lastBtn').onclick = () => {
  $('#lastMsg').classList.add('show'); sfx('magic'); confetti(250); show(8);
  if (ac) { const t = ac.currentTime + .3;[392, 523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .2, 2.5, .3, sfxG)); }
};

/* ---------- 8) SOUND CONTROLS ---------- */
$('#bMute').onclick = e => { soundOn = !soundOn; e.target.textContent = soundOn ? '🔊' : '🔇'; applyVol(); };
$('#bMusic').onclick = e => { musicOn = !musicOn; e.target.style.opacity = musicOn ? 1 : .5; applyVol(); };
$('#bVol').onclick = () => $('#panel').classList.toggle('show');
$('#vMusic').oninput = e => { musicVol = +e.target.value; applyVol(); };
$('#vSfx').oninput = e => { sfxVol = +e.target.value; applyVol(); };
