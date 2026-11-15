/**
 * THE JITESH CHRONICLE — INTERACTIVE ENGINE v2.1 (HIGH-PERFORMANCE)
 * Inspired by Niccolò Miranda's Tactile Print Experience
 * Optimized for 60fps silky smooth scrolling, instant interaction, zero lag
 */

(function () {
  'use strict';

  // ==========================================
  // 00. LIVING FIELD CANVAS (Optimized with IntersectionObserver)
  //     Only renders when in viewport — saves 100% idle CPU/GPU
  // ==========================================
  (function initFieldCanvas() {
    const canvas = document.getElementById('livingFieldCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth || 320;
    let H = canvas.offsetHeight || 180;
    canvas.width = W;
    canvas.height = H;

    const STALK_COUNT = 20;
    const stalks = [];
    const droplets = [];
    let rainActive = false;
    let rainTimer = null;
    let animId = null;
    let isVisible = false;

    // Build crop stalks
    function buildStalks() {
      stalks.length = 0;
      for (let i = 0; i < STALK_COUNT; i++) {
        stalks.push({
          x: (W / STALK_COUNT) * i + (W / STALK_COUNT) * 0.5,
          baseY: H,
          height: 55 + Math.random() * 45,
          sway: 0,
          vel: 0,
          phase: Math.random() * Math.PI * 2,
          leafSide: Math.random() > 0.5 ? 1 : -1,
          leafPos: 0.45 + Math.random() * 0.2,
          hue: 100 + Math.random() * 40,
          moisture: 0.5,
        });
      }
    }
    buildStalks();

    // Water pulse — irrigate stalks
    window.triggerFieldWater = function () {
      stalks.forEach((s, i) => {
        setTimeout(() => {
          s.moisture = Math.min(1, s.moisture + 0.5);
          s.vel += (Math.random() - 0.5) * 2;
          for (let d = 0; d < 3; d++) {
            droplets.push({
              x: s.x + (Math.random() - 0.5) * 14,
              y: H - 2,
              vy: -(1.5 + Math.random() * 2),
              vx: (Math.random() - 0.5) * 1.5,
              life: 1,
              r: 2 + Math.random() * 3,
              type: 'water',
            });
          }
        }, i * 25);
      });
      if (!isVisible) {
        isVisible = true;
        renderLoop(performance.now());
      }
    };

    // Rainstorm
    window.triggerFieldRain = function () {
      if (rainActive) return;
      rainActive = true;
      clearTimeout(rainTimer);
      const spawnRain = () => {
        if (!rainActive) return;
        for (let i = 0; i < 4; i++) {
          droplets.push({
            x: Math.random() * W,
            y: 0,
            vy: 3 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 0.8,
            life: 1,
            r: 1 + Math.random() * 1.5,
            type: 'rain',
          });
        }
        stalks.forEach(s => { s.vel += (Math.random() - 0.5) * 0.5; });
      };
      const rainInterval = setInterval(spawnRain, 70);
      rainTimer = setTimeout(() => {
        rainActive = false;
        clearInterval(rainInterval);
        stalks.forEach(s => { s.moisture = Math.min(1, s.moisture + 0.3); });
      }, 3500);

      if (!isVisible) {
        isVisible = true;
        renderLoop(performance.now());
      }
    };

    window.LivingField = {
      triggerWaterPulse: window.triggerFieldWater,
      triggerRainstorm: window.triggerFieldRain,
    };

    function drawGround() {
      const grad = ctx.createLinearGradient(0, H * 0.78, 0, H);
      grad.addColorStop(0, '#5a3e1b');
      grad.addColorStop(1, '#3a2008');
      ctx.fillStyle = grad;
      ctx.fillRect(0, H * 0.78, W, H * 0.22);
    }

    function drawSky() {
      const grad = ctx.createLinearGradient(0, 0, 0, H * 0.78);
      grad.addColorStop(0, '#1a2a1a');
      grad.addColorStop(1, '#2d4a2d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H * 0.78);
    }

    function drawStalk(s, t) {
      const wind = Math.sin(t * 0.0012 + s.phase) * 0.6;
      s.vel += (wind - s.sway) * 0.04;
      s.vel *= 0.88;
      s.sway += s.vel;

      const tipX = s.x + s.sway * (s.height / 55);
      const tipY = s.baseY - s.height;
      const midX = s.x + s.sway * 0.5;
      const midY = s.baseY - s.height * 0.5;

      const bright = 25 + s.moisture * 35;
      ctx.strokeStyle = `hsl(${s.hue}, 65%, ${bright}%)`;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(s.x, s.baseY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();

      const leafY = s.baseY - s.height * s.leafPos;
      const leafX = s.x + s.sway * s.leafPos;
      ctx.beginPath();
      ctx.moveTo(leafX, leafY);
      ctx.quadraticCurveTo(
        leafX + s.leafSide * 18,
        leafY - 12,
        leafX + s.leafSide * 28,
        leafY + 2
      );
      ctx.quadraticCurveTo(leafX + s.leafSide * 10, leafY + 6, leafX, leafY);
      ctx.fillStyle = `hsl(${s.hue + 15}, 60%, ${bright - 5}%)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(50, 70%, 60%)`;
      ctx.fill();

      s.moisture = Math.max(0.3, s.moisture - 0.0001);
    }

    function drawDroplets() {
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        ctx.beginPath();
        if (d.type === 'rain') {
          ctx.strokeStyle = `rgba(100,160,255,${d.life * 0.6})`;
          ctx.lineWidth = 1;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.vx * 2, d.y - d.vy * 2);
          ctx.stroke();
        } else {
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80,180,255,${d.life * 0.8})`;
          ctx.fill();
        }
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.08;
        d.life -= 0.025;
        if (d.life <= 0 || d.y > H + 10) droplets.splice(i, 1);
      }
    }

    function renderLoop(t) {
      if (!isVisible) return;
      ctx.clearRect(0, 0, W, H);
      drawSky();
      drawGround();
      stalks.forEach(s => drawStalk(s, t));
      drawDroplets();
      animId = requestAnimationFrame(renderLoop);
    }

    // Only run canvas loop when in viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              animId = requestAnimationFrame(renderLoop);
            }
          } else {
            isVisible = false;
            if (animId) cancelAnimationFrame(animId);
          }
        });
      }, { threshold: 0.05 });
      observer.observe(canvas);
    } else {
      isVisible = true;
      requestAnimationFrame(renderLoop);
    }

    window.addEventListener('resize', () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      buildStalks();
    }, { passive: true });
  })();

  // ==========================================
  // 01. SOUND SYNTHESIZER (Web Audio API)
  // ==========================================
  class AudioEngine {
    constructor() {
      this.enabled = false;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    toggle() {
      this.init();
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playClick() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {}
    }

    playStamp() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {}
    }

    playPaperSlide() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const bufferSize = Math.ceil(this.ctx.sampleRate * 0.04);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(1.5, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        whiteNoise.start(now);
      } catch (e) {}
    }
  }

  const audio = new AudioEngine();

  // ==========================================
  // 02. AUDIO & THEME TOGGLES
  // ==========================================
  const audioBtn = document.getElementById('audioToggle');
  const audioStatus = document.getElementById('audioStatus');

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isEnabled = audio.toggle();
      if (isEnabled) {
        audioBtn.classList.add('audio-active');
        if (audioStatus) audioStatus.textContent = 'AUDIO ON';
        audio.playStamp();
      } else {
        audioBtn.classList.remove('audio-active');
        if (audioStatus) audioStatus.textContent = 'AUDIO OFF';
      }
    });
  }

  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('jitesh_chronicle_theme') || 'newsprint';
  htmlEl.setAttribute('data-theme', savedTheme);
  if (themeLabel) {
    themeLabel.textContent = savedTheme === 'charcoal' ? 'NEWSPRINT' : 'CHARCOAL';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') || 'newsprint';
      const next = current === 'newsprint' ? 'charcoal' : 'newsprint';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('jitesh_chronicle_theme', next);
      if (themeLabel) themeLabel.textContent = next === 'charcoal' ? 'NEWSPRINT' : 'CHARCOAL';
      audio.playClick();
    });
  }

  // ==========================================
  // 03. LIVE TELEMETRY & CLOCK
  // ==========================================
  const liveClock = document.getElementById('liveClock');
  const liveDate = document.getElementById('liveDate');

  function updateClock() {
    const now = new Date();
    if (liveClock) {
      liveClock.textContent = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    }
    if (liveDate) {
      liveDate.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ==========================================
  // 04. PRELOADER — Rotary Press Sequence
  // ==========================================
  function runPreloader() {
    const preloader = document.getElementById('pressPreloader');
    const bar = document.getElementById('preloaderBar');
    const num = document.getElementById('preloaderNum');
    const seal = document.getElementById('preloaderSeal');

    if (!preloader) return;

    let progress = 0;
    const duration = 1600;
    const interval = 20;
    const step = 100 / (duration / interval);

    const ticker = setInterval(() => {
      progress = Math.min(100, progress + step + Math.random() * step * 0.4);
      if (bar) bar.style.width = `${progress}%`;
      if (num) num.textContent = `${Math.floor(progress)}%`;

      if (progress >= 90 && seal) seal.classList.add('visible');

      if (progress >= 100) {
        clearInterval(ticker);
        if (num) num.textContent = '100%';
        setTimeout(() => {
          preloader.classList.add('exit');
          setTimeout(() => {
            preloader.style.display = 'none';
            revealMastheadChars();
          }, 700);
        }, 200);
      }
    }, interval);
  }

  // ==========================================
  // 05. MASTHEAD CHARACTER REVEAL
  // ==========================================
  function revealMastheadChars() {
    const title = document.querySelector('.masthead-title');
    if (!title) return;

    const text = title.textContent;
    title.innerHTML = '';
    title.style.visibility = 'visible';

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${i * 35}ms`;
      title.appendChild(span);
    });

    if (window.gsap) {
      gsap.from('.masthead-subtitle, .masthead-date-box, .masthead-ornament', {
        opacity: 0,
        y: 16,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: (text.length * 35) / 1000 + 0.2,
      });
    }
  }

  // ==========================================
  // 06. OPTIMIZED SCROLL PROGRESS & SPY
  //     Zero forced reflows during scroll
  // ==========================================
  const scrollTracker = document.getElementById('scrollTracker');
  const navLinks = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id], header[id]');

  let lastScrollY = window.scrollY;
  let scrollSoundThrottle = 0;
  let scrollTicking = false;
  let sectionPositions = [];

  function updateSectionPositions() {
    sectionPositions = Array.from(sections).map(sec => ({
      id: sec.getAttribute('id'),
      top: sec.offsetTop,
      bottom: sec.offsetTop + sec.offsetHeight
    }));
  }
  updateSectionPositions();
  window.addEventListener('resize', updateSectionPositions, { passive: true });

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        if (scrollTracker) scrollTracker.style.width = `${progress}%`;

        // Throttled sound
        const now = Date.now();
        if (Math.abs(window.scrollY - lastScrollY) > 90 && now - scrollSoundThrottle > 450) {
          audio.playPaperSlide();
          scrollSoundThrottle = now;
          lastScrollY = window.scrollY;
        }

        // Fast spy using cached positions
        const scrollPos = window.scrollY + 220;
        const current = sectionPositions.find(s => scrollPos >= s.top && scrollPos < s.bottom);
        if (current && current.id) {
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${current.id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }

        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ==========================================
  // 07. GSAP SCROLL-TRIGGER ANIMATIONS (Fast & Smooth)
  // ==========================================
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) {
      document.querySelectorAll('.gsap-reveal, .gsap-reveal-left, .gsap-reveal-right, .gsap-reveal-scale').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.gsap-reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 35 },
        {
          opacity: 1, y: 0, duration: 0.75, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    gsap.utils.toArray('.gsap-reveal-left').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.75, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    gsap.utils.toArray('.gsap-reveal-right').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0, duration: 0.75, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    gsap.utils.toArray('.gsap-reveal-scale').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    document.querySelectorAll('.section-head-banner').forEach(banner => {
      ScrollTrigger.create({
        trigger: banner,
        start: 'top 85%',
        once: true,
        onEnter: () => banner.classList.add('in-view'),
      });
    });

    const projectBroadsheets = gsap.utils.toArray('.project-broadsheet');
    if (projectBroadsheets.length) {
      gsap.fromTo(projectBroadsheets,
        { opacity: 0, y: 45 },
        {
          opacity: 1, y: 0, duration: 0.75, ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.projects-grid', start: 'top 85%', once: true }
        }
      );
    }

    const strengthCards = gsap.utils.toArray('.strength-card');
    if (strengthCards.length) {
      gsap.fromTo(strengthCards,
        { opacity: 0, y: 25 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.strengths-grid', start: 'top 85%', once: true }
        }
      );
    }
  }

  // ==========================================
  // 08. ANIMATED METRIC COUNTERS
  // ==========================================
  function initMetricCounters() {
    const metricNums = document.querySelectorAll('.metric-num, .sheet-metric-value');
    if (!metricNums.length) return;

    const countUp = (el, target, duration) => {
      const start = Date.now();
      const isFloat = target % 1 !== 0;
      const run = () => {
        const elapsed = Date.now() - start;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = eased * target;
        el.textContent = isFloat
          ? val.toFixed(1)
          : Math.round(val).toLocaleString();
        if (t < 1) requestAnimationFrame(run);
        else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
      };
      requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.getAttribute('data-count') || el.textContent.replace(/,/g, '');
        const target = parseFloat(raw);
        if (!isNaN(target) && target > 0) {
          countUp(el, target, 1500);
          el.setAttribute('data-count', raw);
        }
        observer.unobserve(el);
      });
    }, { threshold: 0.3 });

    metricNums.forEach(el => {
      const raw = el.textContent.replace(/,/g, '');
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 1) {
        el.setAttribute('data-count', raw);
        el.textContent = '0';
        observer.observe(el);
      }
    });
  }

  // ==========================================
  // 09. HARDWARE-ACCELERATED MAGNETIC CURSOR (High FPS)
  //     Sleeps when mouse stops, 0 CPU overhead
  // ==========================================
  const cursor = document.getElementById('cursor');
  const cursorLabel = document.getElementById('cursorLabel');
  let mouseX = -100;
  let mouseY = -100;
  let currentX = -100;
  let currentY = -100;
  let cursorMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!cursorMoving) {
      cursorMoving = true;
      requestAnimationFrame(renderCursor);
    }
  }, { passive: true });

  function renderCursor() {
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;
    currentX += dx * 0.3;
    currentY += dy * 0.3;

    if (cursor) {
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }

    if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
      requestAnimationFrame(renderCursor);
    } else {
      cursorMoving = false;
    }
  }

  function setupCursorHover() {
    const hoverEls = document.querySelectorAll('a, button, .inspect-btn, .project-broadsheet, .index-item');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        if (cursorLabel) {
          if (el.classList.contains('inspect-btn') || el.classList.contains('project-broadsheet')) {
            cursorLabel.textContent = 'INSPECT';
          } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
            cursorLabel.textContent = 'OPEN';
          } else {
            cursorLabel.textContent = 'READ';
          }
        }
        audio.playClick();
      });
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.querySelectorAll('[data-drag]').forEach(st => {
      st.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-drag');
        if (cursorLabel) cursorLabel.textContent = 'DRAG';
      });
      st.addEventListener('mouseleave', () => document.body.classList.remove('cursor-drag'));
    });
  }
  setupCursorHover();

  // ==========================================
  // 10. DRAGGABLE STICKERS (WITH BOUNDS)
  // ==========================================
  function initDraggableStickers() {
    document.querySelectorAll('[data-drag]').forEach(sticker => {
      let isDragging = false;
      let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

      const onDown = (e) => {
        isDragging = true;
        const rect = sticker.getBoundingClientRect();
        const parentRect = sticker.parentElement.getBoundingClientRect();
        startX = e.clientX || (e.touches && e.touches[0].clientX);
        startY = e.clientY || (e.touches && e.touches[0].clientY);
        initialLeft = rect.left - parentRect.left;
        initialTop = rect.top - parentRect.top;
        sticker.style.zIndex = 50;
        sticker.style.transition = 'none';
        audio.playClick();
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const dX = clientX - startX;
        const dY = clientY - startY;
        const parentRect = sticker.parentElement.getBoundingClientRect();
        const boundedLeft = Math.max(-35, Math.min(parentRect.width - sticker.offsetWidth + 35, initialLeft + dX));
        const boundedTop = Math.max(-35, Math.min(parentRect.height - sticker.offsetHeight + 35, initialTop + dY));
        sticker.style.left = `${boundedLeft}px`;
        sticker.style.top = `${boundedTop}px`;
      };

      const onUp = () => {
        if (!isDragging) return;
        isDragging = false;
        sticker.style.zIndex = 10;
        sticker.style.transition = 'transform 0.15s ease-out';
        audio.playStamp();
        const rect = sticker.getBoundingClientRect();
        burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      sticker.addEventListener('pointerdown', onDown);
    });

    document.querySelectorAll('.index-item[data-project]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const projId = item.getAttribute('data-project');
        if (projId && window.openCaseStudy) {
          const targetCard = document.querySelector(`.project-broadsheet[data-id="${projId}"]`);
          if (targetCard) targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => window.openCaseStudy(projId), 350);
        }
      });
    });
  }
  initDraggableStickers();

  // ==========================================
  // 11. CONFETTI BURST (Lightweight)
  // ==========================================
  function burstConfetti(x, y) {
    const colors = ['#D12F24', '#C07D1C', '#1C3B78', '#1F6B42', '#151413'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      const angle = (i / 14) * 360;
      const dist = 45 + Math.random() * 70;
      const tx = Math.cos(angle * Math.PI / 180) * dist;
      const ty = Math.sin(angle * Math.PI / 180) * dist;
      const rot = Math.random() * 540;
      p.style.cssText = `
        position:fixed;
        left:${x}px;top:${y}px;
        width:${5 + Math.random() * 5}px;
        height:${3 + Math.random() * 3}px;
        background:${colors[i % colors.length]};
        pointer-events:none;z-index:20000;
        border-radius:${Math.random() > 0.5 ? '50%' : '1px'};
        --tx:${tx}px;--ty:${ty}px;--rot:${rot}deg;
      `;
      document.body.appendChild(p);
      p.style.animation = 'confettiBurst 0.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards';
      setTimeout(() => p.remove(), 950);
    }
  }

  (function addConfettiKeyframe() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiBurst {
        0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
        100% { transform: translate(var(--tx),var(--ty)) rotate(var(--rot)); opacity:0; }
      }
    `;
    document.head.appendChild(style);
  })();

  // ==========================================
  // 12. 3D CARD TILT EFFECT (Optimized: Cached Rect, Zero Reflow)
  // ==========================================
  function initCardTilt() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      let rect = null;
      let rafId = null;

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        card.style.transition = 'none';
      }, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(800px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateZ(8px)`;
          rafId = null;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        rect = null;
        card.style.transition = 'transform 0.35s cubic-bezier(0.19,1,0.22,1)';
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      }, { passive: true });
    });
  }
  initCardTilt();

  // ==========================================
  // 13. TEXT SCRAMBLE EFFECT ON TITLES
  // ==========================================
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789■▪';

  function scrambleText(el, finalText, speed) {
    let iter = 0;
    clearInterval(el._scrambleInterval);
    el._scrambleInterval = setInterval(() => {
      el.textContent = finalText.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < iter) return c;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');
      iter += (speed || 2);
      if (iter >= finalText.length) {
        clearInterval(el._scrambleInterval);
        el.textContent = finalText;
      }
    }, 30);
  }

  function initScrambleTitles() {
    document.querySelectorAll('.sheet-title, .strength-title').forEach(el => {
      const original = el.textContent.trim();
      el.addEventListener('mouseenter', () => scrambleText(el, original, 2.5));
      el.addEventListener('mouseleave', () => {
        clearInterval(el._scrambleInterval);
        el.textContent = original;
      });
    });
  }
  initScrambleTitles();

  // ==========================================
  // 14. FLOATING BLUEPRINT TOOLTIP (Cached)
  // ==========================================
  function initBlueprintTooltip() {
    const blueprint = document.getElementById('floatingBlueprint');
    const bpTitle = document.getElementById('bpTitle');
    const bpTag = document.getElementById('bpTag');
    const bpMeta = document.getElementById('bpMeta');

    if (!blueprint) return;

    document.querySelectorAll('.index-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const title = item.querySelector('.index-title') || item;
        const tag = item.querySelector('.index-cat') || item;
        const meta = item.querySelector('.index-year') || item;
        if (bpTitle) bpTitle.textContent = item.dataset.bpTitle || title.textContent || 'PROJECT';
        if (bpTag) bpTag.textContent = item.dataset.bpTag || tag.textContent || '';
        if (bpMeta) bpMeta.textContent = item.dataset.bpMeta || meta.textContent || '';
        blueprint.classList.add('visible');
      });
      item.addEventListener('mouseleave', () => blueprint.classList.remove('visible'));
      item.addEventListener('mousemove', (e) => {
        let lx = e.clientX + 20;
        let ly = e.clientY - 55;
        if (lx + 220 > window.innerWidth - 10) lx = e.clientX - 235;
        if (ly < 10) ly = e.clientY + 20;
        blueprint.style.left = `${lx}px`;
        blueprint.style.top = `${ly}px`;
      }, { passive: true });
    });
  }
  initBlueprintTooltip();

  // ==========================================
  // 15. CATALOGUE TAB FILTERING
  // ==========================================
  const catTabs = document.querySelectorAll('.cat-tab');
  const projectCards = document.querySelectorAll('.project-broadsheet');

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const filter = tab.getAttribute('data-filter');
      audio.playClick();

      let visibleCount = 0;
      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translate(0, 0)';
          }, visibleCount * 50 + 10);
          visibleCount++;
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // ==========================================
  // 16. CASE STUDY MODAL SYSTEM
  // ==========================================
  const caseStudiesData = {
    festos: {
      number: 'DISPATCH NO. 01',
      title: 'FestOS — Festival Operations Control Portal',
      subtitle: 'Centralized Operational Command for Mega-Scale University Cultural Festivals',
      status: 'PROTOTYPE // SUBMITTED',
      event: 'Aarohan 2026 • IIM Indore',
      metrics: [
        { label: 'COORDINATION LOAD', value: '2,836' },
        { label: 'DELEGATION SCOPE', value: '38 Contingents' },
        { label: 'EVENTS & CONTESTS', value: '31 Simultaneous' },
        { label: 'ACCOMMODATION', value: '1,450 Beds' },
        { label: 'VENDOR ACCOUNTS', value: '15 Active' },
        { label: 'ORGANIZER CADRE', value: '48 over 3 Shifts' }
      ],
      problem: `At Tier-1 collegiate festivals such as Aarohan at IIM Indore, organizers manage thousands of visitors arriving over a 72-hour window. Traditional logistics break down because information is fragmented across WhatsApp groups, Google Sheets, and physical paper rosters. Miscommunications lead to double-booked accommodation beds, delayed event judging, and unaccounted vendor supplies.`,
      architecture: `FestOS centralizes all operational data into a role-scoped control portal. The system models three primary operational axes:\n1. Accommodation & Bed Ledger: Instant check-in/check-out with contingent verification to prevent overbooking.\n2. Venue & Stage Slotting: Live delay-propagation engine recalculating competition start times without judge schedule conflicts.\n3. Organizer Shift Handovers: Shift logging ensuring that critical updates pass seamlessly across morning, evening, and night shifts.`,
      stack: ['Operational Control Engine', 'Resource Ledger Models', 'Responsive Web Portal', 'Role-Based Authentication', 'Shift Telemetry State'],
      outcomes: 'Submitted hackathon architecture at Aarohan 2026, IIM Indore. Proved capability to unify operational command into a single, cohesive operator interface.'
    },
    farming: {
      number: 'DISPATCH NO. 02',
      title: 'Smart Farming Assistant — AI + IoT Agritech',
      subtitle: 'Field-Oriented Agronomy Intelligence & Automated Irrigation for Marginal Farmers',
      status: 'AI + HARDWARE CONCEPT',
      event: 'Smart India Hackathon (SIH) Track',
      metrics: [
        { label: 'MICROCONTROLLER', value: 'ESP8266 Wi-Fi' },
        { label: 'SOIL SENSING', value: 'Capacitive Moisture' },
        { label: 'CLIMATE SENSING', value: 'DHT22 Temp & RH' },
        { label: 'ACTUATION', value: 'Optocoupled 5V Relay' },
        { label: 'BANDWIDTH', value: '2G / USSD / Offline' },
        { label: 'DECISION MODEL', value: 'Crop Advisory Tree' }
      ],
      problem: `Marginalized farmers in rural India face extreme climate uncertainty and volatile market conditions. Existing precision agriculture systems are exorbitantly expensive, require enterprise 4G/5G broadband, and assume high literacy levels and high-end smartphones.`,
      architecture: `The Smart Farming Assistant is built on a ruggedized, affordable hardware node:\n1. Edge Telemetry: An ESP8266 microcontroller gathers real-time capacitive soil moisture and DHT22 temperature/humidity readings.\n2. Local Automated Actuation: When moisture dips below the crop-specific critical threshold, the onboard relay triggers irrigation pumps autonomously, preventing crop withering even without an active internet connection.\n3. Multi-Channel Advisory: For farmers without smartphones, recommendations and alerts are engineered to deliver via low-bandwidth channels (SMS/USSD) and communal village kiosk touchpoints.`,
      stack: ['ESP8266 Microcontroller', 'DHT22 Environmental Sensor', 'Capacitive Soil Probe', '5V Relay Pump Circuit', 'Crop Advisory Algorithm', 'Low-Bandwidth Channels'],
      outcomes: 'Developed as part of the Smart India Hackathon problem-solving track. Prototyped hardware circuit and recommendation flow designed specifically around rural accessibility constraints.'
    },
    trustmesh: {
      number: 'DISPATCH NO. 03',
      title: 'TRUSTMESH — Proof-of-Reality Protocol',
      subtitle: 'Decentralized Zero-Knowledge Verification of Real-World Incidents',
      status: 'PROTOTYPE SPEC',
      event: 'Privacy & Cryptography Architecture',
      metrics: [
        { label: 'CORE TENET', value: 'Trust Event, Not ID' },
        { label: 'CLIENT NODE', value: 'React Native / Expo' },
        { label: 'LANGUAGE', value: 'TypeScript' },
        { label: 'TEST SCENARIO', value: 'Municipal Flood' },
        { label: 'PRIVACY LEVEL', value: 'Zero PII Leakage' },
        { label: 'ADMIN VIEW', value: 'Web Console' }
      ],
      problem: `When citizens report disaster events, existing emergency services demand identity disclosures, mobile phone verification, and tracking data. Witnesses often hesitate to report due to fears of surveillance, harassment, or bureaucratic backlash.`,
      architecture: `TRUSTMESH introduces a zero-knowledge Proof-of-Reality model:\n1. Mobile Node Proofs: Built with React Native and Expo, the witness app generates cryptographic proofs attesting that an observation occurred at specific spatial and temporal coordinates without revealing the witness's identity.\n2. Consensus Verification: Multiple nearby peer nodes corroborate environmental signatures to certify event authenticity.\n3. Municipal Administration Interface: City authorities receive a validated heatmap of critical events without holding a single line of citizen PII.`,
      stack: ['React Native', 'Expo Mobile Framework', 'TypeScript', 'Zero-Knowledge Proof Concepts', 'Web Admin Console', 'Geospatial Heatmaps'],
      outcomes: 'Architectural prototype and design specification demonstrating that truth and civic privacy can be simultaneously preserved in crisis reporting.'
    },
    exchequer: {
      number: 'DISPATCH NO. 04',
      title: 'Exchequer / ApexTreasury',
      subtitle: 'Cross-Border Multi-Currency Treasury Management & Automated EEFC Ring-Fencing',
      status: 'FINANCIAL SYSTEM SPEC',
      event: 'Fintech & SaaS Infrastructure',
      metrics: [
        { label: 'CLOUD PLATFORM', value: 'Supabase Serverless' },
        { label: 'DATABASE RAILS', value: 'PostgreSQL + RLS' },
        { label: 'EDGE LOGIC', value: 'Deno / Edge Functions' },
        { label: 'SECURITY', value: 'HMAC-SHA256 Signatures' },
        { label: 'REGULATORY', value: 'RBI EEFC Compliant' },
        { label: 'FX PROTECTION', value: 'Multi-Currency Ring' }
      ],
      problem: `Indian technology companies and independent software exporters billing global clients lose significant revenue to unnecessary currency conversion fees. When inbound USD or EUR payments arrive, standard bank accounts convert funds automatically into INR at unfavorable retail spreads.`,
      architecture: `Exchequer automates management of Exchange Earners' Foreign Currency (EEFC) accounts under RBI guidelines:\n1. Webhook Authentication: Inbound payments trigger serverless Edge Functions authenticated via HMAC-SHA256.\n2. Dynamic Ring-Fencing: The platform calculates upcoming foreign-currency SaaS obligations and automatically isolates the required foreign reserves.\n3. Row-Level Security (RLS): Multi-tenant PostgreSQL policies guarantee that financial records remain strictly isolated across corporate accounts.`,
      stack: ['Supabase Cloud', 'PostgreSQL Row-Level Security', 'Serverless Edge Functions', 'HMAC-SHA256 Authentication', 'Webhook State Machines', 'RBI EEFC Rails'],
      outcomes: 'Engineered complete technical specification and database schema for automated treasury routing, mitigating foreign exchange slippage for Indian software exporters.'
    },
    offlinepay: {
      number: 'DISPATCH NO. 05',
      title: 'OfflinePay — Payment-Continuity Architecture',
      subtitle: 'Cryptographic Peer-to-Peer Transaction Fallback for Disconnected Environments',
      status: 'PROTOCOL EXPLORATION',
      event: 'Distributed Systems & Network Resilience',
      metrics: [
        { label: 'TRANSPORT', value: 'BLE & Dynamic QR' },
        { label: 'SECURITY', value: 'Asymmetric Key Pairs' },
        { label: 'REPLAY DEFENSE', value: 'Sliding Nonce Windows' },
        { label: 'SPEND BOUNDS', value: 'Cryptographic Caps' },
        { label: 'SETTLEMENT', value: 'Eventual Reconciliation' },
        { label: 'TARGET', value: 'Remote / Blackout Areas' }
      ],
      problem: `Modern economies rely entirely on uninterrupted digital payment gateways. When cell towers crash due to severe weather, high network density at festivals, or rural dead-zones, economic activity halts immediately.`,
      architecture: `OfflinePay implements a resilient peer-to-peer transaction continuity protocol:\n1. Pre-Signed Cryptographic Vouchers: Users lock a bounded credit sum while online, generating verifiable time-bound cryptographic credentials.\n2. Local Mesh Exchange: Transactions are transmitted via Bluetooth Low Energy (BLE) or dynamic camera-scanned QR tokens.\n3. Double-Spend & Replay Protection: Employs signed monotonic transaction counters and nonce deduplication registers.\n4. Eventual Ledger Reconciliation: When either device regains internet access, the queued transaction bundle syncs upstream.`,
      stack: ['Asymmetric Cryptography', 'Dynamic QR Payloads', 'Bluetooth Low Energy (BLE)', 'Sliding Nonce Buffers', 'Eventual Consistency Protocols', 'Offline State Engines'],
      outcomes: 'Exploratory protocol architecture addressing digital payment fragility in mission-critical and connectivity-deprived situations.'
    }
  };

  const caseStudyModal = document.getElementById('caseStudyModal');
  const modalContent = document.getElementById('modalContent');

  window.openCaseStudy = function (projectId) {
    const data = caseStudiesData[projectId];
    if (!data || !modalContent) return;

    modalContent.innerHTML = `
      <div class="cs-header">
        <div class="cs-meta-strip">
          <span class="badge-tag hackathon">${data.number}</span>
          <span class="badge-tag venue">${data.event}</span>
          <span class="status-stamp status-prototype">${data.status}</span>
        </div>
        <h2 class="cs-title">${data.title}</h2>
        <p class="cs-subtitle">${data.subtitle}</p>
      </div>
      <div class="cs-specs-grid">
        ${data.metrics.map(m => `
          <div class="cs-spec-item">
            <span class="cs-spec-label">${m.label}</span>
            <span class="cs-spec-value">${m.value}</span>
          </div>
        `).join('')}
      </div>
      <div class="cs-section">
        <h4 class="cs-sec-head">I. THE OPERATIONAL PROBLEM STATEMENT</h4>
        <p class="cs-text">${data.problem}</p>
      </div>
      <div class="cs-section">
        <h4 class="cs-sec-head">II. SYSTEM ARCHITECTURE &amp; METHODOLOGY</h4>
        <p class="cs-text" style="white-space:pre-line">${data.architecture}</p>
      </div>
      <div class="cs-section">
        <h4 class="cs-sec-head">III. CORE TECHNICAL COMPONENTS</h4>
        <ul class="cs-list">
          ${data.stack.map(s => `<li><strong>${s}</strong></li>`).join('')}
        </ul>
      </div>
      <div class="cs-section">
        <h4 class="cs-sec-head">IV. VERIFIED STATUS &amp; OUTCOMES</h4>
        <p class="cs-text"><em>${data.outcomes}</em></p>
      </div>
    `;

    if (caseStudyModal) {
      caseStudyModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      audio.playStamp();
    }
  };

  window.closeCaseStudy = function () {
    if (caseStudyModal) {
      caseStudyModal.classList.remove('open');
      document.body.style.overflow = '';
      audio.playClick();
    }
  };

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      if (e.target === caseStudyModal) window.closeCaseStudy();
    });
  }

  // Dossier Modal
  const dossierModal = document.getElementById('dossierModal');
  const dossierModalBtn = document.getElementById('dossierModalBtn');

  if (dossierModalBtn && dossierModal) {
    dossierModalBtn.addEventListener('click', () => {
      dossierModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      audio.playStamp();
      const rect = dossierModalBtn.getBoundingClientRect();
      burstConfetti(rect.left + rect.width / 2, rect.top);
    });
  }

  window.closeDossierModal = function () {
    if (dossierModal) {
      dossierModal.classList.remove('open');
      document.body.style.overflow = '';
      audio.playClick();
    }
  };

  if (dossierModal) {
    dossierModal.addEventListener('click', (e) => {
      if (e.target === dossierModal) window.closeDossierModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeCaseStudy();
      window.closeDossierModal();
    }
  });

  // ==========================================
  // 17. TELEGRAM FORM DISPATCH
  // ==========================================
  window.handleTelegramSubmit = function (e) {
    e.preventDefault();
    const sender = document.getElementById('senderName').value;
    const email = document.getElementById('senderEmail').value;
    const nature = document.getElementById('queryNature').value;
    const body = document.getElementById('telegramBody').value;
    const statusMsg = document.getElementById('tgStatus');
    const submitBtn = document.getElementById('tgSubmitBtn');

    audio.playStamp();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>TRANSMITTING...</span>`;
    }

    const rect = submitBtn ? submitBtn.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };
    burstConfetti(rect.left + rect.width / 2, rect.top);

    setTimeout(() => {
      if (statusMsg) {
        statusMsg.innerHTML = `<span style="color:var(--stamp-green);font-weight:700;">★ TELEGRAM STAMPED & RECORDED! OPENING MAIL...</span>`;
      }
      if (submitBtn) submitBtn.innerHTML = `<span>TRANSMITTED ✓</span>`;

      const subject = encodeURIComponent(`[GAZETTE TELEGRAM] ${nature.toUpperCase()} - from ${sender}`);
      const mailBody = encodeURIComponent(`Transmitter: ${sender}\nReturn Address: ${email}\nTransmission Type: ${nature}\n\nDispatch:\n${body}`);
      window.location.href = `mailto:jiteshkumarreddy.work@gmail.com?subject=${subject}&body=${mailBody}`;

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span class="btn-stamp-text">STAMP &amp; TRANSMIT TELEGRAM</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          `;
        }
      }, 3500);
    }, 600);
  };

  // ==========================================
  // 18. CLIPBOARD COPY & TOAST NOTIFICATIONS
  // ==========================================
  window.copyToClipboard = function (text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        audio.playStamp();
        showNotification(`${label} copied to clipboard!`);
      });
    } else {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      audio.playStamp();
      showNotification(`${label} copied!`);
    }
  };

  function showNotification(msg) {
    let toast = document.getElementById('gazetteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gazetteToast';
      toast.style.cssText = `
        position:fixed;bottom:24px;right:24px;
        background-color:var(--ink-color);color:var(--paper-color);
        padding:9px 18px;font-family:var(--font-mono);font-size:11px;
        font-weight:700;letter-spacing:1px;border:1.5px solid var(--stamp-red);
        z-index:10005;box-shadow:0 4px 12px rgba(0,0,0,0.25);
        transform:translateY(20px);opacity:0;
        transition:all 0.25s cubic-bezier(0.19,1,0.22,1);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = `★ ${msg.toUpperCase()}`;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
    }, 2800);
  }

  window.scrollToTop = function () {
    audio.playPaperSlide();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smooth local anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        audio.playPaperSlide();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Stamp click burst
  document.querySelectorAll('.status-stamp, .edition-stamp, .wax-seal').forEach(stamp => {
    stamp.addEventListener('click', () => {
      audio.playStamp();
      const rect = stamp.getBoundingClientRect();
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  });

  // Inspect buttons
  document.querySelectorAll('.inspect-btn').forEach(btn => {
    const card = btn.closest('.project-broadsheet');
    if (!card) return;
    btn.addEventListener('click', () => {
      const pid = card.getAttribute('data-id');
      if (pid && window.openCaseStudy) window.openCaseStudy(pid);
    });
  });

  // Init all
  function onReady() {
    runPreloader();
    setTimeout(initGSAP, 80);
    setTimeout(initMetricCounters, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  console.log(
    '%cTHE JITESH CHRONICLE %c\nVol. MMXXVI • High-Performance Engine\nJitesh Kumar Reddy',
    'font-family:serif;font-size:18px;font-weight:bold;color:#D12F24;',
    'font-family:monospace;font-size:11px;color:#555;'
  );
})();
