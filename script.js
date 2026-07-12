(function () {
  'use strict';

  const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let mouseX = 0, mouseY = 0;

  // ==========================================
  // CUSTOM CURSOR
  // ==========================================
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');

  if (isFine && cursor && cursorRing) {
    document.body.classList.add('has-cursor');
    let rx = 0, ry = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    function tickCursor() {
      rx += (mouseX - rx) * 0.12;
      ry += (mouseY - ry) * 0.12;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top = ry + 'px';
      requestAnimationFrame(tickCursor);
    }
    tickCursor();

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
    });

    document.querySelectorAll('[data-cursor-label]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('is-label');
        cursorLabel.textContent = el.dataset.cursorLabel;
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('is-label');
        cursorLabel.textContent = '';
      });
    });
  }

  // ==========================================
  // HERO CAROUSEL
  // ==========================================
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  let current = 0;
  let timer = null;

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  document.getElementById('heroNext').addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  document.getElementById('heroPrev').addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  dots.forEach((dot, i) => { dot.addEventListener('click', () => { goTo(i); resetAuto(); }); });
  startAuto();

  // ==========================================
  // GSAP ANIMATIONS
  // ==========================================
  window.addEventListener('load', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ---------- ALL WORD REVEALS ----------
    document.querySelectorAll('.word').forEach((w) => {
      gsap.to(w, {
        y: '0%', duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: w.closest('.line'), start: 'top 90%' }
      });
    });

    // ---------- FADE-UP ELEMENTS ----------
    document.querySelectorAll('.fade-up').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        delay: i % 4 * 0.06,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // ---------- TYPE CARDS ----------
    gsap.from('.type-card', {
      opacity: 0, y: 50, duration: 0.7, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.types-grid', start: 'top 85%' }
    });

    // ---------- GALLERY CARDS ----------
    document.querySelectorAll('.gallery-card').forEach((card) => {
      gsap.from(card, {
        opacity: 0, y: 40, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%' }
      });
    });

    // ---------- ABOUT IMAGE PARALLAX ----------
    gsap.from('.about-img img', {
      y: 40, scale: 1.08, ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 2 }
    });

    // ---------- COUNT-UP STATS ----------
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count);
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          const dur = 1400, st = performance.now();
          function tick(now) {
            const p = Math.min((now - st) / dur, 1);
            el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      });
    });

    // ---------- FOOTER TITLE ----------
    document.querySelectorAll('.footer-title .word').forEach((w) => {
      gsap.to(w, {
        y: '0%', duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: '.footer-cta', start: 'top 85%' }
      });
    });

  }); // end load

})();
