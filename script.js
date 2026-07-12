(function () {
  'use strict';

  const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let mouseX = 0, mouseY = 0;

  // ==========================================
  // PAGE LOADER — cinematic entry
  // ==========================================
  const loader = document.getElementById('pageLoader');
  const loaderFill = document.getElementById('loaderFill');

  if (loader) {
    let progress = 0;
    const fillTimer = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18, 90);
      if (loaderFill) loaderFill.style.width = progress + '%';
    }, 80);

    window.addEventListener('load', () => {
      clearInterval(fillTimer);
      if (loaderFill) loaderFill.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
      }, 300);
    });
  } else {
    document.body.classList.remove('is-loading');
  }

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
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
    });

    (function tickCursor() {
      rx += (mouseX - rx) * 0.12; ry += (mouseY - ry) * 0.12;
      cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
      requestAnimationFrame(tickCursor);
    })();

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
    });

    document.querySelectorAll('[data-cursor-label]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('is-label');
        if (cursorLabel) cursorLabel.textContent = el.dataset.cursorLabel;
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('is-label');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });
  }

  // ==========================================
  // HERO CAROUSEL
  // ==========================================
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  if (slides.length) {
    let current = 0;
    let timer = null;

    function goTo(index) {
      slides[current].classList.remove('is-active');
      if (dots[current]) dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    }

    function startAuto() { timer = setInterval(() => goTo(current + 1), 5500); }
    function resetAuto() { clearInterval(timer); startAuto(); }

    const nextBtn = document.getElementById('heroNext');
    const prevBtn = document.getElementById('heroPrev');
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    dots.forEach((dot, i) => { dot.addEventListener('click', () => { goTo(i); resetAuto(); }); });
    startAuto();
  }

  // ==========================================
  // GSAP SCROLL ANIMATIONS
  // ==========================================
  window.addEventListener('load', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Nav hide/show on scroll
    const nav = document.getElementById('nav');
    if (nav) {
      let lastY = 0;
      nav.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.style.transform = (y > 120 && y > lastY) ? 'translateY(-100%)' : 'translateY(0)';
        lastY = y;
      }, { passive: true });
    }

    // ---------- ALL WORD REVEALS ----------
    document.querySelectorAll('.word').forEach((w) => {
      const trigger = w.closest('.line') || w;
      gsap.to(w, {
        y: '0%', duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger, start: 'top 92%' }
      });
    });

    // Hero slide words animate in on load immediately
    document.querySelectorAll('.hero-slide.is-active .sh-word').forEach((w, i) => {
      gsap.fromTo(w, { y: '110%' }, { y: '0%', duration: 1.3, delay: 0.6 + i * 0.15, ease: 'power4.out' });
    });

    // ---------- FADE-UP ----------
    document.querySelectorAll('.fade-up').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.85, ease: 'power2.out',
        delay: (i % 4) * 0.07,
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // ---------- DEV CARDS STAGGER ----------
    gsap.from('.dev-card', {
      opacity: 0, y: 50, duration: 0.7, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.dev-grid', start: 'top 85%' }
    });

    // ---------- GALLERY CARDS ----------
    document.querySelectorAll('.gc, .gallery-card').forEach((el) => {
      gsap.from(el, { opacity: 0, y: 40, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // ---------- TESTIMONIALS ----------
    gsap.from('.testi-card', {
      opacity: 0, y: 40, duration: 0.6, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.testi-grid', start: 'top 85%' }
    });

    // ---------- ABOUT / REGISTER parallax ----------
    const aboutImg = document.querySelector('.about-img img, .register-img img');
    if (aboutImg) {
      gsap.from(aboutImg, { y: 30, scale: 1.06, ease: 'none',
        scrollTrigger: { trigger: aboutImg.closest('section') || aboutImg, start: 'top bottom', end: 'bottom top', scrub: 2 }
      });
    }

    // ---------- COUNT-UP ----------
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count);
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
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

    // ---------- PROPERTY PAGE — unit rows stagger ----------
    gsap.from('.unit-row:not(.unit-row--head)', {
      opacity: 0, y: 20, duration: 0.5, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: '.unit-table', start: 'top 85%' }
    });

    // ---------- PROPERTY PAGE — stats bar ----------
    gsap.from('.ph-stat', {
      opacity: 0, y: 20, duration: 0.5, stagger: 0.07, ease: 'power2.out',
      scrollTrigger: { trigger: '.ph-stats-bar', start: 'top 90%' }
    });

    // ---------- PH GALLERY ----------
    gsap.from('.ph-gimg', {
      opacity: 0, y: 30, duration: 0.6, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.ph-gallery-grid', start: 'top 85%' }
    });

    // ---------- LOCATION FACTS ----------
    gsap.from('.loc-fact', {
      opacity: 0, x: -20, duration: 0.5, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.location-facts', start: 'top 85%' }
    });

    // ---------- FOOTER TITLE ----------
    document.querySelectorAll('.footer-title .word').forEach((w) => {
      gsap.to(w, { y: '0%', duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: '.footer-title', start: 'top 85%' }
      });
    });

  }); // end load

  // ==========================================
  // FORMS — validation + success states
  // ==========================================
  function handleForm(formId, successId, whatsappMsg) {
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);
    if (!form || !success) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]');
      const email = form.querySelector('[name="email"]');

      if (!name || !name.value.trim()) { shake(name); return; }
      if (!email || !email.value.trim() || !email.value.includes('@')) { shake(email); return; }

      // Simulate submission
      const btn = form.querySelector('.form-submit');
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
      setTimeout(() => {
        form.style.display = 'none';
        success.style.display = 'block';
      }, 800);
    });
  }

  function shake(el) {
    if (!el) return;
    el.style.animation = 'none';
    el.style.borderColor = '#c0392b';
    el.style.transition = 'transform 0.08s';
    const moves = ['-6px', '6px', '-4px', '4px', '0px'];
    moves.forEach((m, i) => {
      setTimeout(() => { el.style.transform = `translateX(${m})`; }, i * 80);
    });
    setTimeout(() => { el.style.borderColor = ''; }, 2000);
  }

  handleForm('registerForm', 'formSuccess');
  handleForm('leadForm', 'leadSuccess');
  handleForm('propEnquireForm', 'propEnquireSuccess');

})();
