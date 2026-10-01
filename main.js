(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  /* ---------- loader (boot sequence) ---------- */
  const loader = $('#loader'), lt = $('#loaderText');
  const boot = 'booting portfolio.jar … OK';
  let bi = 0;
  const bootTick = () => {
    lt.textContent = boot.slice(0, ++bi) + '▍';
    if (bi < boot.length) setTimeout(bootTick, reduce ? 0 : 35);
    else setTimeout(() => { loader.classList.add('done'); startTyping(); }, reduce ? 0 : 350);
  };
  bootTick();

  /* ---------- typing roles ---------- */
  const role = 'AI Orchestrator | Full Stack Engineer';
  const typed = $('#typed');
  function startTyping() {
    if (reduce) { typed.textContent = role; return; }
    let c = 0;
    (function tick() {
      typed.textContent = role.slice(0, ++c);
      if (c < role.length) setTimeout(tick, 75);
    })();
  }

  /* ---------- scroll progress + reveal + counters ---------- */
  const prog = $('#progress');
  const onScroll = () => {
    const h = document.documentElement;
    prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
    updateTimeline();
  };
  addEventListener('scroll', onScroll, { passive: true });

  const countUp = el => {
    const target = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suf; return; }
    const t0 = performance.now(), dur = 1400;
    (function f(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

  /* ---------- timeline: a "request packet" travels down as you scroll ---------- */
  const tl = $('#timeline'), fill = $('#lineFill'), packet = $('#packet');
  function updateTimeline() {
    const r = tl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
    const y = p * r.height;
    fill.style.height = y + 'px';
    packet.style.transform = `translateY(${y - 6}px)`;
  }
  updateTimeline();

  /* ---------- skill chips: stagger index for the pop / wave animations ---------- */
  $$('.chips').forEach(g => $$('i', g).forEach((c, i) => c.style.setProperty('--i', i)));

  /* ---------- touch: highlight whichever card is centred (replaces hover) ---------- */
  if (matchMedia('(hover: none)').matches) {
    const fio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('focus', e.isIntersecting)),
      { rootMargin: '-40% 0px -40% 0px' });
    $$('.node, .stat, .skill-group').forEach(el => fio.observe(el));
  }

  /* ---------- 3D tilt cards ---------- */
  if (!reduce) $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const b = card.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      card.style.transition = 'border-color .3s, box-shadow .3s';
      card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = '';
      card.style.transform = '';
    });
  });

  /* ---------- magnetic buttons ---------- */
  if (!reduce) $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const b = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * .25}px,${(e.clientY - b.top - b.height / 2) * .35}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  /* ---------- cursor glow ---------- */
  const cur = $('#cursor');
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  // touch: the glow and the network follow your finger
  const touch = e => { const p = e.touches[0]; if (!p) return; mouse.x = p.clientX; mouse.y = p.clientY; cur.classList.add('on'); };
  addEventListener('touchstart', touch, { passive: true });
  addEventListener('touchmove', touch, { passive: true });
  addEventListener('touchend', () => setTimeout(() => cur.classList.remove('on'), 600), { passive: true });
  (function glow() {
    cur.style.transform = `translate(${mouse.x}px,${mouse.y}px)`;
    requestAnimationFrame(glow);
  })();

  /* ---------- background: living node network (a nod to microservices) ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, nodes = [];
  const resize = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    W /= d; H /= d;
    const n = Math.round(Math.min(90, (W * H) / 16000));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35
    }));
  };
  // mobile browsers fire resize when the address bar hides on scroll: only rebuild if the width changed
  let lastW = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; resize(); } });
  resize();
  const LINK = 140;
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const a of nodes) {
      if (!reduce) { a.x += a.vx; a.y += a.vy; }
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      const dx = a.x - mouse.x, dy = a.y - mouse.y, dm = Math.hypot(dx, dy);
      if (!reduce && dm < 120) { a.x += dx / dm * 1.2; a.y += dy / dm * 1.2; }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      ctx.fillStyle = 'rgba(92,255,176,.7)';
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(77,184,255,${(1 - d / LINK) * .28})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 170) {
        ctx.strokeStyle = `rgba(92,255,176,${(1 - dm / 170) * .5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!reduce) requestAnimationFrame(draw);
  })();
})();
