/* ==========================================================
   肖德辉 · AIGC新媒体运营作品集 — 交互脚本
   ========================================================== */
(function () {
  'use strict';

  /* ---------- 1. 主题（暗色模式）---------- */
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('xd-theme'); } catch (e) {}
  if (saved) root.setAttribute('data-theme', saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }

  function syncThemeBtn() {
    var dark = root.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.textContent = dark ? '☀️' : '🌙';
      b.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
    });
  }

  /* ---------- 2. 导航：移动端展开 + 当前页高亮 ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });
    }
    var page = document.body.getAttribute('data-page') || '';
    document.querySelectorAll('.nav-links a[data-page]').forEach(function (a) {
      if (a.getAttribute('data-page') === page) a.classList.add('active');
    });
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('xd-theme', next); } catch (e) {}
        syncThemeBtn();
      });
    });
    syncThemeBtn();
  }

  /* ---------- 3. 顶部阅读进度 ---------- */
  function initProgress() {
    var bar = document.getElementById('read-progress');
    if (!bar) return;
    var tick = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ---------- 4. 滚动入场动画 ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. 数字滚动 ---------- */
  function initCount() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-dec') | 0);
      var dur = 1500, t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = to.toFixed(dec);
      }
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. 横向条形图动画 ---------- */
  function initBars() {
    var groups = document.querySelectorAll('[data-bars]');
    if (!groups.length) return;
    var fill = function (g) {
      g.querySelectorAll('.bar-fill[data-w]').forEach(function (b) {
        b.style.width = b.getAttribute('data-w') + '%';
      });
    };
    if (!('IntersectionObserver' in window)) { groups.forEach(fill); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 12% 0px' });
    groups.forEach(function (g) { io.observe(g); });
  }

  /* ---------- 7. 作品筛选 ---------- */
  function initFilters() {
    var bar = document.querySelector('.filters');
    if (!bar) return;
    var cards = document.querySelectorAll('[data-cat]');
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      bar.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-filter');
      cards.forEach(function (c) {
        var show = cat === 'all' || c.getAttribute('data-cat') === cat;
        c.style.display = show ? '' : 'none';
      });
    });
  }

  /* ---------- 8. 案例详情侧边目录（滚动联动）---------- */
  function initSpy() {
    var nav = document.querySelector('.side-nav');
    if (!nav) return;
    var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
    var blocks = links.map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);
    if (!blocks.length) return;
    var tick = function () {
      var cur = blocks[0].id, fromTop = window.scrollY + 160;
      blocks.forEach(function (b) { if (b.offsetTop <= fromTop) cur = b.id; });
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
      });
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ---------- 9. 图片灯箱 ---------- */
  function initLightbox() {
    var frames = document.querySelectorAll('.shot .frame');
    if (!frames.length) return;
    var box = document.createElement('div');
    box.id = 'lightbox';
    box.innerHTML = '<img alt=""><div class="cap"></div>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('.cap');

    frames.forEach(function (f) {
      f.addEventListener('click', function () {
        var src = f.querySelector('img');
        if (!src) return;
        img.src = src.getAttribute('src');
        img.alt = src.getAttribute('alt') || '';
        var fig = f.closest('.shot') && f.closest('.shot').querySelector('figcaption');
        cap.textContent = fig ? fig.innerText.replace(/\s+/g, ' ').trim() : (src.getAttribute('alt') || '');
        box.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    function close() { box.classList.remove('open'); document.body.style.overflow = ''; }
    box.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------- 10. 年份 ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function boot() {
    initNav();
    initProgress();
    initReveal();
    initCount();
    initBars();
    initFilters();
    initSpy();
    initLightbox();
    initYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
