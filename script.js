// Git-style squares that grow in from the edges of the landing page (left/right on
// desktop, top/bottom on mobile): one solid wall that thins out as it heads inward.
(() => {
  const canvas = document.getElementById('tree');
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CLEAR = 460;       // empty width kept in the middle for the text (desktop)
  const CLEAR_V = 220;     // empty height kept in the middle for the text (mobile)
  const REACH = 0.55;      // how far into each side the tree can reach (0–1)
  const FALLOFF = 0.6;     // higher = fizzles out sooner
  const STEP_MS = 90;      // time between columns appearing
  const FADE_MS = 400;     // fade-in per square
  const OPACITY = 0.55;    // final opacity of each square
  const COLORS = ['#0e4429', '#006d32', '#26a641', '#39d353'];

  const SOLID = 1;         // mobile: extra solid rows at each tree's outer edge
  const FADE_INTO_MOBILE = 0.07; // mobile: length of the bottom fade (fraction of screen height)
  const FADE_INTO = 0.3;   // how far (as a fraction of screen height) the squares fade into the next section
  let cells = [], W, H, TH, EXTRA, CY, start, CELL, GAP;

  // Column 0 is completely filled. Each later column can only grow from a filled
  // neighbour in the previous column, and gets sparser the further in it is.
  // `solid` adds that many fully-filled columns before the thinning starts.
  function grow(cols, rows, solid = 0) {
    const out = [];
    let prev = new Array(rows).fill(true);
    for (let c = 0; c < cols + solid; c++) {
      if (c < solid) {
        for (let r = 0; r < rows; r++) out.push({ c, r, step: c * 0.5 + Math.random() * 0.8, color: COLORS[Math.floor(Math.random() ** 1.5 * COLORS.length)] });
        continue;
      }
      const density = Math.pow(1 - (c - solid) / cols, FALLOFF);
      const cur = new Array(rows).fill(false);
      for (let r = 0; r < rows; r++) {
        const support = prev[r] ? 1 : (prev[r - 1] || prev[r + 1]) ? 0.45 : 0;
        if (c === solid || Math.random() < density * support) {
          cur[r] = true;
          out.push({
            c, r,
            step: solid * 0.5 + (c - solid) + Math.random() * 0.8,   // jitter so columns don't pop in as a block
            color: COLORS[Math.floor(Math.random() ** 1.5 * COLORS.length)],
          });
        }
      }
      if (!cur.some(Boolean)) break;
      prev = cur;
    }
    return out;
  }

  function setup() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    // Measure the landing section itself so the trees are centred on the text
    // (on phones 100vh/innerHeight don't match the section's real height).
    W = document.documentElement.clientWidth;
    H = document.querySelector('main > header').offsetHeight;
    const sideways = W > 820;   // wide screens: trees on left/right. Narrow: top/bottom.

    // The canvas runs past the bottom of the landing page and is masked to fade out,
    // so the squares dissolve into the next section instead of stopping dead.
    // Mobile: trees sit flush against the nav and the bottom edge. The nav height is
    // shared with the CSS so the text is centred in the space below the nav, keeping
    // the two trees mirrored around it.
    const inset = sideways ? 0 : document.querySelector('nav').offsetHeight;
    document.documentElement.style.setProperty('--nav-h', inset + 'px');
    CY = sideways ? H / 2 : (inset + H) / 2;   // vertical centre of the text
    // Mobile keeps everything inside the landing page so the two trees can mirror exactly.
    EXTRA = Math.round(H * (sideways ? FADE_INTO : FADE_INTO_MOBILE));
    // Shared with the CSS so the About section on mobile starts below the fade.
    document.documentElement.style.setProperty('--fade-h', EXTRA + 'px');
    TH = H + EXTRA;
    canvas.width = W * dpr; canvas.height = TH * dpr;
    canvas.style.height = TH + 'px';
    // Desktop: fade out into the next section. Mobile: fully visible down to the bottom
    // edge, then the bottom tree's base fades out below it.
    const mask = sideways
      ? `linear-gradient(to bottom, black ${Math.round(H * 0.7)}px, transparent ${TH}px)`
      : `linear-gradient(to bottom, black ${H}px, transparent ${TH}px)`;
    canvas.style.maskImage = canvas.style.webkitMaskImage = mask;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cells = [];
    CELL = sideways ? 28 : 20;
    GAP = sideways ? 6 : 4;
    const PITCH = CELL + GAP;

    if (sideways) {
      const depth = Math.floor((((W - CLEAR) / 2) * REACH) / PITCH);
      const breadth = Math.floor(TH / PITCH);
      const off = (TH - breadth * PITCH + GAP) / 2;
      for (const cell of grow(depth, breadth)) cells.push({ ...cell, x: GAP + cell.c * PITCH, y: off + cell.r * PITCH });
      for (const cell of grow(depth, breadth)) cells.push({ ...cell, x: W - GAP - CELL - cell.c * PITCH, y: off + cell.r * PITCH });
    } else {
      // Two identical trees mirrored around the text: one hanging from the nav,
      // one rising from the bottom edge of the screen.
      const depth = Math.max(2, Math.floor((((H - inset - CLEAR_V) / 2) * REACH) / PITCH) - SOLID);
      const breadth = Math.floor(W / PITCH);
      const off = (W - breadth * PITCH + GAP) / 2;
      for (const cell of grow(depth, breadth, SOLID)) cells.push({ ...cell, x: off + cell.r * PITCH, y: inset + cell.c * PITCH });
      // Bottom tree gets extra solid rows below the screen edge, which the mask fades out.
      const below = Math.ceil(EXTRA / PITCH);
      for (const cell of grow(depth, breadth, SOLID + below)) cells.push({ ...cell, x: off + cell.r * PITCH, y: H - CELL + (below - cell.c) * PITCH });
    }
  }

  // Pulse: a single soft brightening ring that travels from the screen centre out to the edges.
  const PULSE_TRAVEL = 1100; // ms for a ring to reach the corners
  const PULSE_WIDTH = 90;    // px thickness of the ring
  const PULSE_BOOST = 1.2;   // how much brighter squares get as the ring passes
  let pulseStart = null;

  // The ring starts at the innermost square rather than the empty screen centre,
  // so it's visible immediately.
  let minD = 0, maxD = 0, lastStep = 0;
  function measure() {
    minD = Infinity; maxD = 0; lastStep = 0;
    for (const cell of cells) {
      cell.d = Math.hypot(cell.x + CELL / 2 - W / 2, cell.y + CELL / 2 - CY);
      minD = Math.min(minD, cell.d);
      maxD = Math.max(maxD, cell.d);
      lastStep = Math.max(lastStep, cell.step);
    }
  }

  function pulseAt(cell) {
    if (pulseStart === null) return 0;
    const p = (performance.now() - pulseStart) / PULSE_TRAVEL;
    const from = minD - PULSE_WIDTH, to = maxD + PULSE_WIDTH;
    const radius = from + p * (to - from);
    return Math.exp(-(((cell.d - radius) / PULSE_WIDTH) ** 2));
  }

  function draw(elapsed) {
    ctx.clearRect(0, 0, W, TH);
    let done = true;
    for (const cell of cells) {
      const age = elapsed - cell.step * STEP_MS;
      if (age <= 0) { done = false; continue; }
      const a = Math.min(1, age / FADE_MS);
      if (a < 1) done = false;
      ctx.globalAlpha = Math.min(1, a * OPACITY * (1 + PULSE_BOOST * pulseAt(cell)));
      ctx.fillStyle = cell.color;
      ctx.beginPath();
      ctx.roundRect(cell.x, cell.y, CELL, CELL, 4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return done;
  }

  // Grow the squares, then run a single pulse once they've all appeared.
  function frame(now) {
    const elapsed = now - start;
    draw(elapsed);
    // Fire as the last square appears, without waiting for its fade to finish.
    if (pulseStart === null && elapsed >= lastStep * STEP_MS + FADE_MS * 0.4) pulseStart = performance.now();
    const pulseDone = pulseStart !== null && performance.now() - pulseStart > PULSE_TRAVEL;
    if (!pulseDone) requestAnimationFrame(frame);
    else { pulseStart = null; draw(Infinity); }   // final clean frame with no pulse
  }

  // Type out the name, then fade in the subtext.
  const typed = document.getElementById('typed');
  const untyped = document.getElementById('untyped');
  const subtext = document.getElementById('subtext');
  const name = typed.textContent;
  if (reduceMotion) {
    subtext.classList.add('show');
  } else {
    let i = 0;
    const type = () => {
      typed.textContent = name.slice(0, i);
      untyped.textContent = name.slice(i);
      if (i++ < name.length) setTimeout(type, 45 + Math.random() * 50);
      else setTimeout(() => subtext.classList.add('show'), 150);
    };
    typed.textContent = '';
    untyped.textContent = name;
    type();
  }

  setup(); measure();
  if (reduceMotion) draw(Infinity);
  else requestAnimationFrame((now) => { start = now; frame(now); });

  // On resize, rebuild and show the finished tree without replaying the animation.
  let t;
  addEventListener('resize', () => {
    clearTimeout(t);
    // Rebuild only if the landing section's size actually changed. Its height uses svh,
    // so the mobile address bar showing/hiding while scrolling doesn't trigger this.
    t = setTimeout(() => {
      const w = document.documentElement.clientWidth, h = document.querySelector('main > header').offsetHeight;
      if (w !== W || h !== H) { setup(); measure(); draw(Infinity); }
    }, 150);
  });
})();

// Highlight the nav link for the section currently on screen.
(() => {
  const links = new Map([...document.querySelectorAll('nav .links a')].map((a) => [a.hash.slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((a) => a.classList.remove('active'));
      links.get(e.target.id)?.classList.add('active');
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll('main > header, main > section').forEach((s) => observer.observe(s));
})();

// Mobile hamburger menu.
(() => {
  const nav = document.querySelector('nav');
  const toggle = nav.querySelector('.menu-toggle');
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();

// Clifton bridge: add hangers under the main chain, then draw it in when scrolled to.
(() => {
  const svg = document.querySelector('.bridge');
  if (!svg) return;
  const g = svg.querySelector('.hangers');
  const NS = 'http://www.w3.org/2000/svg';
  // Points on the chain curve M90 42 Q260 188 430 42 (x is linear in t because the control point is centred).
  const steps = 26;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = 90 + 340 * t;
    const y = (1 - t) ** 2 * 42 + 2 * t * (1 - t) * 188 + t ** 2 * 42;
    if (120 - y < 3) continue;   // too short near the middle
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x); line.setAttribute('x2', x);
    line.setAttribute('y1', y); line.setAttribute('y2', 120);
    // stagger outward from the centre, after the chain has drawn
    line.style.transitionDelay = `${1.4 + Math.abs(t - 0.5) * 1.2}s`;
    g.appendChild(line);
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { svg.classList.add('in'); observer.disconnect(); }
  }, { threshold: 0.4 });
  observer.observe(svg);
})();

// Timelines (experience, education): grow the line and bring in the cards when scrolled to.
(() => {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
    }
  }, { threshold: 0.2 });
  document.querySelectorAll('.timeline').forEach((t) => observer.observe(t));
})();

// Projects: render the featured projects (max 3) from projects.js as cards.
(() => {
  const grid = document.getElementById('project-grid');
  if (!grid) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const all = window.PROJECTS || [];
  const featured = all.filter((p) => p.featured);
  const shown = (featured.length ? featured : all).slice(0, 3);

  grid.innerHTML = shown.map((p) => `
    <a class="project-card" href="project.html?id=${encodeURIComponent(p.id)}">
      <span class="crumb">~/projects/${esc(p.id)}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.summary)}</p>
      <span class="tags">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>
      <span class="open">open <span class="accent">→</span></span>
    </a>`).join('');

  // Bring the cards in when scrolled to, like the timelines.
  const observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { grid.classList.add('in'); observer.disconnect(); }
  }, { threshold: 0.2 });
  observer.observe(grid);
})();

// Skills terminal: types `ls ~/skills`, prints each folder with its icons,
// then prints a note for whichever skill is hovered/tapped.
(() => {
  const term = document.getElementById('skills-term');
  if (!term) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Simple Icons CDN serves each logo in its brand colour (or the colour given).
  const iconUrl = (s) => s.icon.includes('/') ? s.icon : `https://cdn.simpleicons.org/${s.icon}${s.color ? '/' + s.color : ''}`;
  const groups = window.SKILLS || [];

  const cmd = term.querySelector('.term-cmd');
  const cursor = term.querySelector('.cursor');
  const output = term.querySelector('.term-output');
  const status = term.querySelector('.term-status');
  const IDLE = '# hover or tap a skill';

  output.innerHTML = groups.map((g) => `
    <div class="term-group">
      <p class="term-dir">./${esc(g.dir)}/</p>
      <div class="skill-grid">
        ${g.items.map((s, i) => `
          <button class="skill" type="button" style="--i:${i}" data-name="${esc(s.name)}" data-note="${esc(s.note || '')}">
            ${s.icon
              ? `<span class="skill-icon">
                   <img class="glow" src="${esc(iconUrl(s))}" alt="" loading="lazy" />
                   <img src="${esc(iconUrl(s))}" alt="" loading="lazy" />
                 </span>`
              : `<span class="skill-icon skill-icon-text"${s.color ? ` style="--brand:#${esc(s.color)}"` : ''}>${esc(s.name.slice(0, 2))}</span>`}
            <span class="skill-name">${esc(s.name)}</span>
          </button>`).join('')}
      </div>
    </div>`).join('');

  // Print a line into the status bar, typed quickly. A newer call cancels an older one.
  let typing = 0;
  function print(text) {
    const id = ++typing;
    if (reduceMotion) { status.textContent = text; return; }
    let i = 0;
    const step = () => {
      if (id !== typing) return;
      status.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 12);
    };
    step();
  }

  term.querySelectorAll('.skill').forEach((btn) => {
    const show = () => {
      term.querySelectorAll('.skill.active').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      print(`> ${btn.dataset.name.toLowerCase()}: ${btn.dataset.note}`);
    };
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('focus', show);
    btn.addEventListener('click', show);
  });
  term.addEventListener('mouseleave', () => {
    term.querySelectorAll('.skill.active').forEach((b) => b.classList.remove('active'));
    print(IDLE);
  });

  function run() {
    const groupsEls = [...output.querySelectorAll('.term-group')];
    const finish = () => { cursor.remove(); status.textContent = IDLE; term.classList.add('done'); };
    if (reduceMotion) {
      cmd.textContent = 'ls ~/skills';
      groupsEls.forEach((g) => g.classList.add('shown'));
      return finish();
    }
    const text = 'ls ~/skills';
    let i = 0;
    const type = () => {
      cmd.textContent = text.slice(0, ++i);
      if (i < text.length) return setTimeout(type, 55);
      // then print each folder in turn
      groupsEls.forEach((g, n) => setTimeout(() => g.classList.add('shown'), 250 + n * 350));
      setTimeout(finish, 250 + groupsEls.length * 350);
    };
    setTimeout(type, 300);
  }

  const observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { run(); observer.disconnect(); }
  }, { threshold: 0.3 });
  observer.observe(term);
})();

// Contact: fake SSH connection that reveals a form; sending "encrypts" the message
// (purely visual), shows a transfer bar, then delivers it via Formspree or mailto.
(() => {
  const term = document.getElementById('contact-term');
  if (!term) return;
  const cfg = window.CONTACT || {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
  const OK = '<span class="ok">[ OK ]</span>';
  const FAIL = '<span class="fail">[ FAIL ]</span>';

  const log = term.querySelector('.ssh-log');
  const form = term.querySelector('.ssh-form');
  const sendOut = term.querySelector('.ssh-send');
  const errorEl = term.querySelector('.ssh-error');
  const linksEl = term.querySelector('.ssh-links');

  linksEl.innerHTML = [
    cfg.email && `<a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>`,
    ...(cfg.links || []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`),
  ].filter(Boolean).join('<span class="sep">·</span>');

  const line = (html, parent = log) => {
    const p = document.createElement('p');
    p.className = 'ssh-line';
    p.innerHTML = html;
    parent.appendChild(p);
    return p;
  };

  async function typeInto(el, text, speed = 45) {
    if (reduceMotion) { el.textContent = text; return; }
    for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(speed); }
  }

  // All connection lines exist from the start (invisible) so the terminal is already
  // full size; they're revealed one by one instead of being added.
  const cmdLine = line('<span class="prompt">$</span> <span class="cmd">&nbsp;</span><span class="cursor">█</span>');
  const steps = [
    `resolving host… ${OK}`,
    `key exchange: curve25519-sha256 ${OK}`,
    `host key verified ${OK}`,
    'connected. leave a message below — it\'ll reach me directly.',
  ].map((html) => { const p = line(html); p.classList.add('pending'); return p; });

  async function connect() {
    await wait(300);
    await typeInto(cmdLine.querySelector('.cmd'), 'ssh contact@ben');
    cmdLine.querySelector('.cursor').remove();
    await wait(250);
    for (const p of steps) { p.classList.remove('pending'); await wait(220); }
    term.classList.add('connected');
  }

  // Random base64-looking text to "encrypt" into.
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const randomB64 = (n) => Array.from({ length: n }, () => B64[Math.floor(Math.random() * 64)]).join('') + '==';

  function scramble(el, from, to, duration = 1300) {
    return new Promise((resolve) => {
      if (reduceMotion) { el.textContent = to; return resolve(); }
      const start = performance.now();
      const len = Math.max(from.length, to.length);
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        let out = '';
        for (let i = 0; i < len; i++) {
          const settle = (i / len) * 0.8;           // left-to-right sweep
          if (t >= settle + 0.2) out += to[i] ?? '';
          else if (t >= settle) out += B64[Math.floor(Math.random() * 64)];
          else out += from[i] ?? '';
        }
        el.textContent = out;
        if (t < 1) requestAnimationFrame(frame); else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  async function progress(el, duration = 1000) {
    const W = 24;
    const steps = reduceMotion ? 1 : 20;
    for (let s = 1; s <= steps; s++) {
      const pct = Math.round((s / steps) * 100);
      const filled = Math.round((pct / 100) * W);
      el.textContent = `[${'#'.repeat(filled)}${'-'.repeat(W - filled)}] ${pct}%`;
      await wait(duration / steps);
    }
  }

  async function deliver(data) {
    if (cfg.formEndpoint) {
      // Send the values captured before the form was disabled — disabled fields are
      // left out of FormData, which made the request arrive empty.
      const res = await fetch(cfg.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, message: data.message, _replyto: data.email }),
      });
      if (!res.ok) {
        // Formspree explains failures as { errors: [{ message }] } — surface that.
        let reason = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          const msgs = (body.errors || []).map((x) => x.message).filter(Boolean);
          if (msgs.length) reason += `: ${msgs.join('; ')}`;
          else if (body.error) reason += `: ${body.error}`;
        } catch {}
        console.error('Form submission failed:', reason);
        throw new Error(reason);
      }
      return 'delivered';
    }
    const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
    const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
    location.href = `mailto:${cfg.email}?subject=${subject}&body=${body}`;
    return 'mailto';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    for (const k of ['name', 'email', 'message']) data[k] = (data[k] || '').trim();
    if (!data.name || !data.message || !/^\S+@\S+\.\S+$/.test(data.email)) {
      errorEl.textContent = 'error: name, a valid email and a message are required';
      return;
    }
    errorEl.textContent = '';
    form.querySelectorAll('input, textarea, button').forEach((el) => (el.disabled = true));
    sendOut.innerHTML = '';

    line('<span class="prompt">$</span> ./send --encrypt', sendOut);
    await wait(200);
    line('encrypting payload…', sendOut);
    const cipher = line('', sendOut);
    cipher.classList.add('cipher');
    const plain = data.message.slice(0, 220);
    await scramble(cipher, plain, randomB64(Math.min(220, Math.max(32, Math.round(plain.length * 1.35)))));
    line(`payload encrypted ${OK}`, sendOut);
    await wait(200);
    line('transmitting to ben…', sendOut);
    const bar = line('', sendOut);
    await progress(bar);

    try {
      const how = await deliver(data);
      if (how === 'mailto') line(`${OK} handing off to your mail client — just hit send there.`, sendOut);
      else line(`${OK} message delivered. thanks, ${esc(data.name)} — I'll be in touch.`, sendOut);
      await wait(300);
      line('<span class="muted">connection to ben closed.</span>', sendOut);
      const again = line('<button type="button" class="link-btn">$ reconnect</button>', sendOut);
      again.querySelector('button').addEventListener('click', () => {
        form.reset();
        form.querySelectorAll('input, textarea, button').forEach((el) => (el.disabled = false));
        sendOut.innerHTML = '';
        form.querySelector('input').focus();
      });
    } catch (err) {
      line(`${FAIL} transmission failed (${esc(err.message)}). email me directly: <a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>`, sendOut);
      form.querySelectorAll('input, textarea, button').forEach((el) => (el.disabled = false));
    }
  });

  const observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { connect(); observer.disconnect(); }
  }, { threshold: 0.3 });
  observer.observe(term);
})();
