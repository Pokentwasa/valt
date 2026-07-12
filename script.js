(function () {
  'use strict';

  const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let mouseX = 0, mouseY = 0;

  // ==========================================
  // CUSTOM CURSOR
  // ==========================================
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

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
  }

  // ==========================================
  // THREE.JS — ARCHITECTURAL WIREFRAME
  // ==========================================
  const canvas = document.getElementById('webglCanvas');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x121213, 0.018);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 18, 0);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ===== WIREFRAME ARCHITECTURAL GRID =====
  const group = new THREE.Group();
  scene.add(group);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });

  // Ground grid plane — the technical floor plan
  const gridSize = 24;
  const gridDivisions = 24;
  const step = gridSize / gridDivisions;

  for (let i = 0; i <= gridDivisions; i++) {
    const pos = -gridSize / 2 + i * step;
    const xLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(pos, 0, -gridSize / 2),
      new THREE.Vector3(pos, 0, gridSize / 2)
    ]);
    const zLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-gridSize / 2, 0, pos),
      new THREE.Vector3(gridSize / 2, 0, pos)
    ]);
    const lx = new THREE.Line(xLine, lineMat);
    const lz = new THREE.Line(zLine, lineMat);
    lx.userData.gridLine = true;
    lz.userData.gridLine = true;
    group.add(lx, lz);
  }

  // Architectural structures — wireframe box forms at key intersections
  const buildingMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });

  function addBuilding(x, z, w, d, h) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const edges = new THREE.EdgesGeometry(geo);
    const mesh = new THREE.LineSegments(edges, buildingMat);
    mesh.position.set(x, h / 2, z);
    group.add(mesh);
  }

  addBuilding(0, 0, 4, 3, 6);
  addBuilding(-6, -4, 2, 2, 4);
  addBuilding(5, 3, 3, 2, 8);
  addBuilding(-3, 5, 1.5, 1.5, 3);
  addBuilding(7, -5, 2, 3, 5);
  addBuilding(-7, 2, 2.5, 2, 7);
  addBuilding(2, -7, 3, 2, 4);
  addBuilding(8, 6, 1.5, 1.5, 3);
  addBuilding(-8, -7, 2, 2, 5);

  // Accent cross-hairs at key points
  const accentMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
  const crossPoints = [[0, 0], [6, 4], [-5, -3], [3, -6], [-7, 5]];
  crossPoints.forEach(([x, z]) => {
    const h = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x - 1, 0.01, z), new THREE.Vector3(x + 1, 0.01, z)]);
    const v = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.01, z - 1), new THREE.Vector3(x, 0.01, z + 1)]);
    group.add(new THREE.Line(h, accentMat), new THREE.Line(v, accentMat));
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Render loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    // Subtle slow rotation to keep it feeling alive
    group.rotation.y = t * 0.008;
    renderer.render(scene, camera);
  }
  animate();

  // ==========================================
  // GSAP + SCROLLTRIGGER
  // ==========================================
  window.addEventListener('load', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ---------- HERO TITLE REVEAL ----------
    document.querySelectorAll('.hero-title .word').forEach((w, i) => {
      gsap.to(w, { y: '0%', duration: 1.2, delay: 0.2 + i * 0.1, ease: 'power4.out' });
    });

    gsap.from('.hero-tag', { opacity: 0, y: 12, duration: 0.7, delay: 0.1, ease: 'power2.out' });
    gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 0.8, delay: 0.7, ease: 'power2.out' });
    gsap.from('.hero-actions', { opacity: 0, y: 16, duration: 0.7, delay: 0.9, ease: 'power2.out' });
    gsap.from('.hero-img-frame', { opacity: 0, x: 40, duration: 1, delay: 0.4, ease: 'power3.out' });

    // ---------- CAMERA SCROLL ROTATION — top-down to isometric ----------
    // Hero: camera above looking straight down
    gsap.to(camera.position, {
      y: 6, x: 12, z: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '.ledger',
        start: 'top bottom',
        end: 'top top',
        scrub: 2,
        onUpdate: () => { camera.lookAt(0, 0, 0); }
      }
    });

    // Ledger → Projects: orbit around
    gsap.to(camera.position, {
      y: 8, x: -10, z: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: '.projects',
        start: 'top bottom',
        end: 'center center',
        scrub: 2,
        onUpdate: () => { camera.lookAt(0, 0, 0); }
      }
    });

    // Projects → Approach: pull back wide
    gsap.to(camera.position, {
      y: 10, x: 6, z: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.approach',
        start: 'top bottom',
        end: 'center center',
        scrub: 2,
        onUpdate: () => { camera.lookAt(0, 0, 0); }
      }
    });

    // Footer: final dramatic angle
    gsap.to(camera.position, {
      y: 4, x: -14, z: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.footer',
        start: 'top bottom',
        end: 'top top',
        scrub: 2,
        onUpdate: () => { camera.lookAt(0, 0, 0); }
      }
    });

    // ---------- SECTION WORD REVEALS ----------
    document.querySelectorAll('section:not(.hero) .word, footer .word').forEach((w) => {
      gsap.to(w, {
        y: '0%', duration: 1, ease: 'power4.out',
        scrollTrigger: { trigger: w.closest('.line'), start: 'top 90%' }
      });
    });

    // ---------- FADE-UP ELEMENTS ----------
    document.querySelectorAll('.fade-up').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        delay: i % 3 * 0.06,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // ---------- LEDGER ROWS STAGGER ----------
    gsap.from('.ledger-row:not(.ledger-row--head)', {
      opacity: 0, y: 20, duration: 0.5, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: '.ledger-table', start: 'top 85%' }
    });

    // ---------- PROJECT CARDS ----------
    document.querySelectorAll('.project-card').forEach((card) => {
      gsap.from(card, {
        opacity: 0, y: 40, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 85%' }
      });
    });

    // ---------- APPROACH ITEMS ----------
    gsap.from('.approach-item', {
      opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.approach-right', start: 'top 85%' }
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
