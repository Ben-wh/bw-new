// Site footer, styled like a terminal sign-off plus a tmux status bar.
// Shared by every page: include this script at the end of <body>.
// Links come from contact.js (window.CONTACT) if that script is on the page.
(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cfg = window.CONTACT || {};
  const links = [
    cfg.email && { label: 'email', url: `mailto:${cfg.email}` },
    ...(cfg.links || []),
  ].filter(Boolean);
  const isHome = !!document.querySelector('main > header');

  // Icons for known link labels (anything else falls back to its text label).
  const ICONS = {
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3,7 12,13 21,7"/></svg>',
    github: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
  };
  const top = isHome ? '#' : 'index.html';

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="foot-main">
      <div>
        <p class="foot-cmd"><span class="prompt">$</span> logout<span class="cursor">█</span></p>
        <p class="foot-note">thanks for visiting — connection closed.</p>
      </div>
      <p class="foot-links">
        ${links.map((l) => {
          const icon = ICONS[l.label.toLowerCase()];
          const ext = l.url.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
          return `<a href="${esc(l.url)}"${ext} aria-label="${esc(l.label)}" title="${esc(l.label)}"${icon ? ' class="foot-icon"' : ''}>${icon || esc(l.label)}</a>`;
        }).join('')}
        ${cfg.coffee ? `<a href="${esc(cfg.coffee)}" target="_blank" rel="noopener" class="btn foot-coffee" aria-label="Buy me a coffee">./buy-me-a-coffee <span aria-hidden="true">☕</span></a>` : ''}
        <a href="${top}" class="foot-top">cd ~ ↑</a>
      </p>
    </div>
    <div class="statusbar">
      <span class="seg seg-host">ben@portfolio</span>
      <span class="seg seg-window">0:<span class="win-name">${isHome ? 'home' : 'projects'}</span>*</span>
      <span class="spacer"></span>
      <span class="seg seg-copy">© ${new Date().getFullYear()} Ben Whitrow</span>
      <span class="seg seg-clock"></span>
    </div>`;
  document.body.appendChild(footer);

  // Live clock, like tmux's status-right.
  const clock = footer.querySelector('.seg-clock');
  const tick = () => {
    const d = new Date();
    clock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' +
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  };
  tick();
  setInterval(tick, 15000);

  // On the home page the "window" name follows the section you're looking at.
  if (isHome) {
    const name = footer.querySelector('.win-name');
    const sections = [...document.querySelectorAll('main > header, main > section')];
    const update = () => {
      const mid = innerHeight / 2;
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= mid) current = s;
      name.textContent = current.id || 'home';
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }
})();
