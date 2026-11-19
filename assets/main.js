(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  const saved = store.get('theme');
  if (saved) root.dataset.theme = saved;
  $('#themeToggle').addEventListener('click', () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- hero: Conway's Life ---------- */
  const canvas = $('#life');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SIZE = 12;
  let cols, rows, grid, heat, raf, last = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(width / SIZE); rows = Math.ceil(height / SIZE);
    grid = new Uint8Array(cols * rows);
    heat = new Float32Array(cols * rows);
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.13 ? 1 : 0;
  }
  function step() {
    const next = new Uint8Array(grid.length);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx || dy) n += grid[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)];
      }
      const i = y * cols + x;
      next[i] = (n === 3 || (n === 2 && grid[i])) ? 1 : 0;
    }
    grid = next;
  }
  function draw() {
    const cs = getComputedStyle(root);
    const cell = cs.getPropertyValue('--cell'), hot = cs.getPropertyValue('--cell-hot');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < grid.length; i++) {
      if (!grid[i]) { heat[i] *= 0.9; continue; }
      const x = (i % cols) * SIZE, y = Math.floor(i / cols) * SIZE;
      ctx.fillStyle = heat[i] > 0.05 ? hot : cell;
      ctx.fillRect(x + 1, y + 1, SIZE - 2, SIZE - 2);
      heat[i] *= 0.9;
    }
  }
  function loop(t) {
    if (t - last > 140) { step(); draw(); last = t; }
    raf = requestAnimationFrame(loop);
  }
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const cx = Math.floor((e.clientX - r.left) / SIZE), cy = Math.floor((e.clientY - r.top) / SIZE);
    for (let k = 0; k < 5; k++) {
      const x = (cx + Math.round(Math.random() * 4 - 2) + cols) % cols;
      const y = (cy + Math.round(Math.random() * 4 - 2) + rows) % rows;
      grid[y * cols + x] = 1; heat[y * cols + x] = 1;
    }
    if (reduce) draw();
  });
  resize(); draw();
  if (!reduce) {
    raf = requestAnimationFrame(loop);
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); draw(); }, 200); });

  /* ---------- lab ---------- */
  const sims = [
    { v: 'v6', t: 'Biosphere', s: 'Sky, land and sea', src: 'demos/cellular-life/v6.html',
      d: 'A whole world, side on — day and night, tides and wind. Life starts as lone cells in the sea and spreads to reefs, vents, land and air.' },
    { v: 'v5', t: 'Thalassa', s: 'A living ocean', src: 'demos/cellular-life/v5.html',
      d: 'Surface to seabed. Shape decides how a creature swims, feeds and fights; nine ways of life emerge from lone cells.' },
    { v: 'v4', t: 'Pelagic', s: 'Soft bodies in currents', src: 'demos/cellular-life/v4.html',
      d: 'Soft-bodied creatures grow from single cells, drift in currents or swim with evolved gaits — grazing, hunting, schooling and mating.' },
    { v: 'v3', t: 'Emergence', s: 'Life from single pixels', src: 'demos/cellular-life/v3.html',
      d: 'Organisms grow along an evolving body plan and, over minutes, become colonies, swimmers, hunters and multicellular forms.' },
    { v: 'v2', t: 'Petri Dish', s: 'Agent-based bacteria', src: 'demos/cellular-life/v2.html',
      d: 'Bacteria that eat, divide, swim, join into colonies, merge, devour each other and evolve.' },
    { v: 'v1', t: 'Cellular Life', s: 'The original automaton', src: 'demos/cellular-life/v1.html',
      d: "Where it started: a grid automaton running Conway's Life and other B/S rule sets." },
    { v: 'Q1', t: 'Quine', s: 'Evolving Code', src: 'demos/evolving-code/v1.html',
      d: 'Digital organisms whose genome is a program. They run their own code to move, eat and copy themselves — with copying errors. Click one to read its code live.' },
  ];
  const list = $('#labList'), frame = $('#stageFrame'), poster = $('#stagePoster');
  let current = sims[0];
  function select(sim) {
    current = sim;
    list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === sim.v)));
    $('#stageTitle').textContent = `${sim.t} · ${sim.v}`;
    $('#stageDesc').textContent = sim.d;
    $('#stageOpen').href = sim.src;
    frame.querySelector('iframe')?.remove();
    poster.hidden = false;
    $('#stageLoad').hidden = false;
  }
  sims.forEach((sim) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" data-v="${sim.v}"><span class="v">${sim.v}</span><span class="t">${sim.t}</span><span class="s">${sim.s}</span></button>`;
    li.firstChild.addEventListener('click', () => select(sim));
    list.append(li);
  });
  $('#stageLoad').addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = current.src; f.title = `${current.t} simulation`; f.loading = 'lazy';
    frame.append(f); poster.hidden = true; $('#stageLoad').hidden = true;
  });
  select(sims[0]);

  /* ---------- project index ---------- */
  const GH = 'https://github.com/MattBanham/';
  const projects = [
    { n: 'JevTrade', c: 'Markets', y: '2026', d: 'AI-assisted Binance research workstation testing whether an external model adds predictive signal across 30s–4h horizons. Paper-first, fail-closed risk gating, local TA.', t: ['TypeScript', 'Vite', 'Vitest'] },
    { n: 'NULLWALL', c: 'Games', y: '2026', d: 'Cyberpunk hacking RPG: observe a system, route through it, make moral choices, get out before your identity burns — all against fully synthetic infrastructure.', t: ['React', 'TypeScript'] },
    { n: 'Voxel Pirates', c: 'Games', y: '2026', d: 'First-person co-op voxel pirate game in Godot 4 — code-authored voxels with greedy meshing, a shared wave/wind model and a sailing brig. Aimed at Steam.', t: ['Godot 4', 'GDScript'] },
    { n: 'Still Home', c: 'Native', y: '2026', d: 'Replacement home launcher for LG webOS TVs with rollback-safe overlays, checksum-pinned recovery and native recommendation bridging.', t: ['webOS', 'JavaScript', 'Shell'] },
    { n: 'Gesture Control', c: 'Native', y: '2026', d: 'SwiftUI menu-bar app for hand-gesture control, with webcam attention gating and gaze-targeted window routing via Accessibility hit-testing.', t: ['Swift', 'Vision', 'AppKit'] },
    { n: 'Omniview', c: 'AI', y: '2026', d: 'Local-first desktop intelligence map: globe navigation, network overlays and agent tooling in an Electron monorepo.', t: ['Electron', 'WebGL', 'pnpm'] },
    { n: 'Orchestrator', c: 'AI', y: '2025', d: 'Enterprise AI automation platform: Rust microservices, multi-agent conversations and canvas-based workflows behind a React/Electron UI.', t: ['Rust', 'Kafka', 'PostgreSQL', 'React'] },
    { n: 'Virtual Assistant', c: 'AI', y: '2025', d: 'A face rendered as a point cloud in Three.js, lip-synced through morph-target visemes and driven by a local LLM and TTS.', t: ['Three.js', 'GLTF', 'TTS'] },
    { n: 'UltraTrade', c: 'Markets', y: '2025', d: 'Trading platform pairing a multithreaded Rust backend with an Electron UI, scriptable in Python or Lua for backtests and live strategies.', t: ['Rust', 'Electron', 'Python', 'Lua'] },
    { n: 'Singularity', c: 'Markets', y: '2024', d: 'Long-running AI trading research for crypto and FX: neural-net training modules and a self-organising Binance data loader.', t: ['Python', 'PyTorch'] },
    { n: 'Life Simulator', c: 'Simulation', y: '2025', d: 'Browser ecosystem of plants and animals with diploid trait genetics, herbivore/carnivore/omnivore diets, predation, weather and mutation events.', t: ['React', 'TypeScript', 'Vite'], href: GH + 'Life-Simulator' },
    { n: 'MatrixCam', c: 'Graphics', y: '2024', d: 'Your webcam as falling Matrix code. Many iterations from p5.js sketches to a reusable React component.', t: ['p5.js', 'React', 'WebRTC'], href: GH + 'MatrixCam' },
    { n: 'GLaDOS', c: 'Hardware', y: '2024', d: 'An animatronic desk robot: servo-driven eye, RGB lighting and fans on a microcontroller, controlled over WebSockets.', t: ['C++', 'PlatformIO'] },
    { n: 'HiveMind', c: 'AI', y: '2024', d: 'YOLOv8 object-detection experiments paired with a React front end for viewing detections.', t: ['Python', 'YOLOv8', 'React'] },
    { n: 'Void Empire', c: 'Games', y: '2024', d: 'Unity prototype exploring icosphere worlds, character selection and nav-mesh driven units.', t: ['Unity', 'C#'] },
    { n: 'ASCII Lab', c: 'Graphics', y: '2024', d: 'Spinning ASCII cube and donut, a terminal game and Game of Life — rendering maths with nothing but characters.', t: ['Python', 'JavaScript'] },
    { n: 'Colour Match', c: 'Graphics', y: '2026', d: 'Frame- and sprite-matching scripts that colour-correct footage and game art against a reference.', t: ['Python', 'OpenCV'] },
  ];
  const cats = ['All', ...new Set(projects.map((p) => p.c))];
  const filters = $('#filters'), gridEl = $('#indexGrid');
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  gridEl.innerHTML = projects.map((p) => `
    <article class="card reveal" data-c="${p.c}">
      <div class="card-top"><span>${p.c}</span><span>${p.y}</span></div>
      <h3>${esc(p.n)}</h3>
      <p>${esc(p.d)}</p>
      <div class="tags">${p.t.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
      ${p.href ? `<a href="${p.href}" target="_blank" rel="noopener">View repo ↗</a>` : ''}
    </article>`).join('');
  cats.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0));
    const count = c === 'All' ? projects.length : projects.filter((p) => p.c === c).length;
    b.innerHTML = `${c}<sup>${count}</sup>`;
    b.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      gridEl.querySelectorAll('.card').forEach((card) => { card.hidden = c !== 'All' && card.dataset.c !== c; });
    });
    filters.append(b);
  });

  /* ---------- reveal on scroll ---------- */
  document.querySelectorAll('.feature, .sec-head, .stack > div').forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();
