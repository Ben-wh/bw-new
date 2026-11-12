// Blinking shell-prompt favicon: ">_" with the cursor toggling every 500ms.
// Browsers don't animate SVG favicons, so we swap between two frames.
(() => {
  const frame = (cursor) => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#0d1117"/>
      <polyline points="8,9 15,16 8,23" fill="none" stroke="#3fb950" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${cursor ? '<rect x="17" y="21" width="9" height="3.5" rx="1" fill="#3fb950"/>' : ''}
    </svg>`;
  const url = (cursor) => 'data:image/svg+xml,' + encodeURIComponent(frame(cursor).trim());
  const on = url(true), off = url(false);

  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = on;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let visible = true;
  setInterval(() => { visible = !visible; link.href = visible ? on : off; }, 500);
})();
