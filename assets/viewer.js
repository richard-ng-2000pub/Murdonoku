/* MURDONOKU SVG solution viewer: pure client-side, GitHub Pages compatible. */
(() => {
  'use strict';

  const config = window.MURDONOKU_CONFIG || {};
  const refW = Number(config.referenceWidth) || 1600;
  const refH = Number(config.referenceHeight) || 900;
  const regions = config.regions || {};
  const validViews = new Set(['overview', 'sudoku', 'nonogram', 'murderer']);
  const $ = (id) => document.getElementById(id);
  const screen = $('screen');
  const viewport = $('imageViewport');
  const img = $('solutionImage');
  const tabs = $('viewTabs');
  const guard = $('guardBackdrop');
  let currentView = 'overview';
  let loaded = false;
  let currentFilename = '';
  let renderQueued = false;

  // Paths are relative to this repository's root. Nested solutions folders work too.
  // Invalid paths never reach a URL. No HTML/SVG content is inserted into the DOM.
  function normaliseFilename(raw) {
    if (typeof raw !== 'string') throw new Error('Invalid filename.');
    let name = raw.trim().normalize('NFC');
    if (!name || name.length > 240 || /[\\?#\u0000-\u001f\u007f]/u.test(name) || name.startsWith('/')) {
      throw new Error('Invalid filename. Enter an SVG file from the solutions folder.');
    }
    const pieces = name.split('/');
    if (pieces.some(part => !part || part === '.' || part === '..' || part.trim() !== part || part.startsWith('.'))) {
      throw new Error('Invalid file path.');
    }
    if (!name.toLowerCase().endsWith('.svg')) name += '.svg';
    if (name.length > 240) throw new Error('Filename is too long.');
    return name;
  }

  function fileUrl(name) {
    return 'solutions/' + name.split('/').map(encodeURIComponent).join('/');
  }

  function showError(message) {
    loaded = false;
    img.removeAttribute('src');
    viewport.hidden = true;
    $('loading').hidden = true;
    $('welcome').hidden = true;
    $('errorState').hidden = false;
    document.body.classList.add('no-solution');
    tabs.hidden = true;
    $('errorMessage').textContent = message;
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; renderImage(); });
  }

  function resetInline() {
    viewport.style.cssText = '';
    img.style.cssText = '';
  }

  function renderImage() {
    if (!loaded) return;
    const W = screen.clientWidth;
    const H = screen.clientHeight;
    if (!W || !H) return;
    resetInline();

    if (currentView === 'overview' || !regions[currentView]) {
      viewport.style.inset = '0';
      viewport.style.width = '100%';
      viewport.style.height = '100%';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      return;
    }

    const r = regions[currentView];
    const naturalW = img.naturalWidth || refW;
    const naturalH = img.naturalHeight || refH;
    const x = Number(r.x) * naturalW / refW;
    const y = Number(r.y) * naturalH / refH;
    const w = Number(r.w) * naturalW / refW;
    const h = Number(r.h) * naturalH / refH;
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0 || x < 0 || y < 0 || x + w > naturalW || y + h > naturalH) {
      currentView = 'overview';
      updateTabs();
      renderImage();
      return;
    }

    // Fit the selected card inside the available viewport. Never scroll or cut it.
    const margin = 10;
    const scale = Math.min(Math.max(1, W - margin * 2) / w, Math.max(1, H - margin * 2) / h);
    const cropW = w * scale;
    const cropH = h * scale;
    viewport.style.left = ((W - cropW) / 2) + 'px';
    viewport.style.top = ((H - cropH) / 2) + 'px';
    viewport.style.width = cropW + 'px';
    viewport.style.height = cropH + 'px';

    img.style.position = 'absolute';
    img.style.width = (naturalW * scale) + 'px';
    img.style.height = (naturalH * scale) + 'px';
    img.style.left = (-x * scale) + 'px';
    img.style.top = (-y * scale) + 'px';
    img.style.objectFit = 'fill';
  }

  function updateTabs() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      const active = btn.dataset.view === currentView;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function setView(view) {
    if (!loaded || !validViews.has(view)) return;
    currentView = view;
    updateTabs();
    queueRender();
  }

  function showInspectionWarning() {
    if (!config.discourageInspection) return;
    guard.hidden = false;
    $('guardClose').focus();
  }

  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  $('guardClose').addEventListener('click', () => { guard.hidden = true; });
  document.addEventListener('contextmenu', event => {
    if (!config.discourageInspection) return;
    // Limit to solution surface; keep browser context menus on other UI elements.
    if (event.target === img || event.target === viewport || event.target === screen) {
      event.preventDefault();
      showInspectionWarning();
    }
  });
  img.addEventListener('dragstart', event => event.preventDefault());

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !guard.hidden) { guard.hidden = true; return; }
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const inspect = event.key === 'F12' ||
      (ctrl && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) ||
      (ctrl && ['u', 's'].includes(key));
    if (inspect && config.discourageInspection) {
      event.preventDefault();
      event.stopPropagation();
      showInspectionWarning();
      return;
    }
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || !loaded || !guard.hidden) return;
    if (['1', '2', '3', '4'].includes(key) && !event.altKey && !ctrl) {
      setView({ '1': 'overview', '2': 'sudoku', '3': 'nonogram', '4': 'murderer' }[key]);
    }
  }, true);

  async function enterFullscreen() {
    if (screen.requestFullscreen) {
      try {
        await screen.requestFullscreen();
        queueRender();
        return;
      } catch (e) { /* iOS Safari etc.: fallback below. */ }
    }
    document.body.classList.add('immersive');
    queueRender();
  }

  async function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (e) { /* fallback below */ }
    }
    document.body.classList.remove('immersive');
    queueRender();
  }

  $('fullscreenBtn').addEventListener('click', enterFullscreen);
  $('exitFullscreen').addEventListener('click', exitFullscreen);
  document.addEventListener('fullscreenchange', queueRender);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(queueRender).observe(screen);
  window.addEventListener('resize', queueRender);
  window.addEventListener('orientationchange', queueRender);

  $('openForm').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const name = normaliseFilename($('fileInput').value);
      const url = new URL('viewer.html', location.href);
      url.search = new URLSearchParams({ f: name }).toString();
      window.location.href = url.href;
    } catch (error) {
      $('fileInput').setCustomValidity(error.message);
      $('fileInput').reportValidity();
    }
  });
  $('fileInput').addEventListener('input', () => $('fileInput').setCustomValidity(''));

  // Existing QR code contract: viewer.html?f=NAME.svg. Alias: ?file=NAME.svg.
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('f') || params.get('file');
  if (!raw) {
    $('welcome').hidden = false;
    $('loading').hidden = true;
    $('errorState').hidden = true;
    viewport.hidden = true;
    tabs.hidden = true;
    document.body.classList.add('no-solution');
  } else {
    try {
      currentFilename = normaliseFilename(raw);
      $('welcome').hidden = true;
      $('errorState').hidden = true;
      $('loading').hidden = false;
      img.alt = 'Murdonoku full solution';
      img.addEventListener('load', () => {
        loaded = true;
        $('loading').hidden = true;
        $('errorState').hidden = true;
        viewport.hidden = false;
        tabs.hidden = false;
        document.body.classList.remove('no-solution');
        currentView = 'overview';
        updateTabs();
        queueRender();
      }, { once: true });
      img.addEventListener('error', () => {
        showError('The solution could not be loaded. Check the filename, letter case, the solutions folder, and your GitHub Pages deployment.');
      }, { once: true });
      img.src = fileUrl(currentFilename);
    } catch (error) { showError(error.message); }
  }
})();
