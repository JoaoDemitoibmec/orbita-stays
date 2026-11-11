/* Núcleo: utilidades, rotas, tema, menu móvel, copiar, aviso rápido. */
(function () {
  'use strict';
  var O = window.Orbita = window.Orbita || {};
  var CFG = O.cfg = window.ORBITA_CONFIG || {};
  O.hooks = {};

  var $ = O.$ = function (id) { return document.getElementById(id); };
  O.qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  O.pad = function (n) { return String(n).padStart(2, '0'); };
  O.safe = function (fn) { try { return fn(); } catch (e) { return null; } };
  O.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  O.BRL = function (n) { return fmtBRL.format(Math.round(n)); };
  O.NUM = function (n) { return new Intl.NumberFormat('pt-BR').format(n); };
  O.esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  O.reduceMotion = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  /* ---------- contatos (vêm do config.js) ---------- */
  O.waLink = function (text) {
    return CFG.whatsapp ? 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(text) : '';
  };
  O.siteUrl = function () {
    if (CFG.siteUrl) return CFG.siteUrl.replace(/\/+$/, '') + '/';
    var l = window.location;
    return (l.protocol === 'file:' ? l.href.split('#')[0] : l.origin + l.pathname);
  };
  O.applyContacts = function () {
    O.qsa('[data-needs]').forEach(function (el) {
      var k = el.getAttribute('data-needs');
      el.hidden = !CFG[k];
    });
    O.qsa('[data-wa]').forEach(function (a) {
      if (!CFG.whatsapp) return;
      a.href = O.waLink(a.getAttribute('data-wa'));
      a.target = '_blank'; a.rel = 'noopener';
    });
    O.qsa('[data-ig]').forEach(function (a) {
      if (!CFG.instagram) return;
      a.href = 'https://instagram.com/' + CFG.instagram;
      a.target = '_blank'; a.rel = 'noopener';
      var t = a.querySelector('[data-ig-text]'); if (t) t.textContent = '@' + CFG.instagram;
    });
  };

  /* ---------- aviso rápido e copiar ---------- */
  var toastT;
  O.toast = function (msg) {
    var t = $('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2200);
  };
  O.copy = function (text, btn, fb) {
    var old = btn && btn.textContent;
    var done = function (ok) {
      O.toast(ok ? 'Copiado' : 'Não deu para copiar. Selecione o texto e copie.');
      if (btn && ok) { btn.textContent = 'Copiado'; setTimeout(function () { btn.textContent = old; }, 1800); }
    };
    var legacy = function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { }
      document.body.removeChild(ta);
      if (!ok && fb && fb.select) fb.select();
      done(ok);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    } else legacy();
  };

  /* ---------- tema ---------- */
  var root = document.documentElement;
  O.safe(function () { var s = localStorage.getItem('orbita-tema'); if (s === 'light' || s === 'dark') root.setAttribute('data-theme', s); });
  O.qsa('.js-theme').forEach(function (b) {
    b.addEventListener('click', function () {
      var cur = root.getAttribute('data-theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      O.safe(function () { localStorage.setItem('orbita-tema', next); });
    });
  });

  /* ---------- menu móvel ---------- */
  var menuBtn = $('menu-btn'), menu = $('menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
  }
  O.closeMenu = function () { setMenu(false); };
  menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('#menu') && !e.target.closest('#menu-btn')) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900 && !menu.hidden) setMenu(false); });

  /* ---------- rotas por hash ---------- */
  var VIEWS = { inicio: 'v-inicio', cadastrar: 'v-cadastrar', portal: 'v-portal', imovel: 'v-imovel' };
  var TITLES = {
    inicio: 'Órbita Stays — Seu imóvel rendendo, sem trabalho para você',
    cadastrar: 'Cadastrar meu imóvel — Órbita Stays',
    portal: 'Portal do proprietário — Órbita Stays',
    imovel: 'Imóvel — Órbita Stays'
  };
  var ANCH = { 'como-funciona': 'como-funciona', servicos: 'servicos', simulador: 'simulador', 'sim-card': 'simulador', duvidas: 'duvidas', contato: 'contato' };
  O.parseHash = function () {
    var h = ''; try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { }
    if (ANCH[h]) return { view: 'inicio', anchor: ANCH[h] };
    if (/^imovel-\d+$/.test(h)) return { view: 'imovel', param: h.split('-')[1] };
    if (VIEWS[h]) return { view: h };
    return { view: 'inicio' };
  };
  var first = true;
  function route() {
    var r = O.parseHash();
    Object.keys(VIEWS).forEach(function (v) { $(VIEWS[v]).hidden = (v !== r.view); });
    document.body.setAttribute('data-view', r.view);
    O.qsa('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === r.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = TITLES[r.view];
    if (O.hooks[r.view]) O.hooks[r.view](r.param);
    setMenu(false);
    if (r.anchor) {
      var el = $(r.anchor);
      var go = function () { if (el) el.scrollIntoView({ behavior: (first || O.reduceMotion()) ? 'auto' : 'smooth', block: 'start' }); };
      first ? go() : requestAnimationFrame(go);
    } else if (!(first && !location.hash)) {
      window.scrollTo(0, 0);
      if (!first) {
        var h1 = $(VIEWS[r.view]).querySelector('h1');
        if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      }
    }
    first = false;
    watchCta();
  }
  window.addEventListener('hashchange', route);
  O.route = route;

  /* ---------- barra fixa do celular (só na página inicial) ---------- */
  var mcta = $('mcta'), heroCta = $('hero-cta'), band = $('band'), seen = { hero: true, band: false };
  function watchCta() {
    var on = document.body.getAttribute('data-view') === 'inicio' && !seen.hero && !seen.band;
    mcta.classList.toggle('on', on);
    document.body.classList.toggle('has-mcta', on);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen[e.target === heroCta ? 'hero' : 'band'] = e.isIntersecting; });
      watchCta();
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(heroCta); io.observe(band);
  }

  O.start = function () { O.applyContacts(); route(); };
})();
