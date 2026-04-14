/* ================================================================
   COMPONENTS.JS v5 — Header, Footer, Theme, Toast
   Auth delegated to auth.js
   ================================================================ */
(function() {
  'use strict';

  /* --- Determine current page --- */
  var currentPage = location.pathname.split('/').pop().replace('.html','') || 'index';
  function navA(p) { return currentPage === p ? 'nav-link active' : 'nav-link'; }
  function mobA(p) { return currentPage === p ? 'mobile-nav-link active' : 'mobile-nav-link'; }

  /* ---------- HEADER HTML ---------- */
  var headerHTML = '<a href="#main-content" class="skip-to-content">Перейти к содержимому</a>' +
    '<header role="banner" class="header" id="site-header"><div class="container header-inner">' +
    '<a href="index.html" class="logo"><span class="logo-icon">&#9672;</span>' +
    '<span class="logo-text">CryptoFlow by Muravsky</span></a>' +
    '<nav aria-label="Основная навигация" class="nav" id="main-nav">' +
      '<a href="index.html" class="' + navA('index') + '">Главная</a>' +
      '<a href="exchange.html" class="' + navA('exchange') + '">Обмен</a>' +
      '<a href="rates.html" class="' + navA('rates') + '">Курсы</a>' +
      '<a href="markets.html" class="' + navA('markets') + '">Рынки</a>' +
      '<a href="about.html" class="' + navA('about') + '">О нас</a>' +
      '<a href="faq.html" class="' + navA('faq') + '">FAQ</a>' +
      '<a href="contacts.html" class="' + navA('contacts') + '">Контакты</a>' +
    '</nav>' +
    '<div class="header-actions">' +
      '<button class="theme-toggle" id="theme-toggle" aria-label="Тема">' +
        '<span class="theme-icon">☀️</span></button>' +
      '<div id="authContainer">' +
        '<button class="auth-trigger" id="open-auth-btn" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:10px 22px;border-radius:12px;font-weight:600;font-size:0.88rem;cursor:pointer;transition:all 0.3s;white-space:nowrap;">Войти</button>' +
      '</div>' +
    '</div>' +
    '<button class="burger" id="burger-btn" aria-label="Меню">' +
      '<span></span><span></span><span></span>' +
    '</button>' +
    '</div></header>' +
    '<div class="mobile-overlay" id="mobile-overlay"></div>' +
    '<nav aria-label="Мобильное меню" class="mobile-nav" id="mobile-nav" role="dialog">' +
      '<a href="index.html" class="' + mobA('index') + '">Главная</a>' +
      '<a href="exchange.html" class="' + mobA('exchange') + '">Обмен</a>' +
      '<a href="rates.html" class="' + mobA('rates') + '">Курсы</a>' +
      '<a href="markets.html" class="' + mobA('markets') + '">Рынки</a>' +
      '<a href="about.html" class="' + mobA('about') + '">О нас</a>' +
      '<a href="faq.html" class="' + mobA('faq') + '">FAQ</a>' +
      '<a href="contacts.html" class="' + mobA('contacts') + '">Контакты</a>' +
      '<div class="mobile-nav-divider"></div>' +
      '<a href="dashboard.html" class="' + mobA('dashboard') + '">Личный кабинет</a>' +
      '<a href="settings.html" class="' + mobA('settings') + '">Настройки</a>' +
      '<button class="btn btn-primary btn-block" id="open-auth-mobile">Войти</button>' +
    '</nav>';

  /* ---------- FOOTER HTML ---------- */
  var footerHTML = '<footer role="contentinfo" class="footer"><div class="container"><div class="footer-grid">' +
    '<div class="footer-brand"><a href="index.html" class="logo"><span class="logo-icon">&#9672;</span>' +
    '<span class="logo-text">CryptoFlow by Muravsky</span></a>' +
    '<p class="footer-desc">Надёжная платформа для обмена криптовалют. Лучшие курсы, мгновенные сделки, безопасность на первом месте.</p>' +
    '<div class="footer-socials">' +
      '<a href="https://t.me/CryptoFlow" class="footer-social" title="Telegram" target="_blank">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>' +
      '<a href="#" class="footer-social" title="Twitter" target="_blank">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>' +
    '</div></div>' +
    '<div class="footer-col"><h4 class="footer-heading">Платформа</h4>' +
      '<a href="exchange.html" class="footer-link">Обмен валют</a>' +
      '<a href="rates.html" class="footer-link">Курсы криптовалют</a>' +
      '<a href="markets.html" class="footer-link">Рынки</a>' +
      '<a href="dashboard.html" class="footer-link">Личный кабинет</a></div>' +
    '<div class="footer-col"><h4 class="footer-heading">Информация</h4>' +
      '<a href="about.html" class="footer-link">О компании</a>' +
      '<a href="faq.html" class="footer-link">Частые вопросы</a>' +
      '<a href="legal.html" class="footer-link">Правовые документы</a>' +
      '<a href="contacts.html" class="footer-link">Контакты</a></div>' +
    '<div class="footer-col"><h4 class="footer-heading">Контакты</h4>' +
      '<a href="mailto:support@cryptoflow.io" class="footer-link">📧 support@cryptoflow.io</a>' +
      '<a href="https://t.me/CryptoFlow" class="footer-link" target="_blank">💬 Telegram</a>' +
      '<a href="tel:+78001234567" class="footer-link">📞 8 (800) 123-45-67</a>' +
      '<span class="footer-link footer-status-online">🟢 Поддержка 24/7</span></div>' +
    '</div>' +
    '<div class="footer-bottom"><p>&copy; 2026 CryptoFlow by Muravsky. Все права защищены.</p>' +
    '<div class="footer-bottom-links">' +
      '<a href="legal.html">Политика конфиденциальности</a>' +
      '<a href="legal.html">Условия использования</a>' +
      '<a href="legal.html">AML/KYC</a>' +
    '</div></div></div></footer>';

  var extraHTML = '<button class="back-to-top" id="back-to-top" aria-label="Наверх">&uarr;</button>' +
    '<div class="toast-container" id="toast-container"></div>';

  /* ---------- CLEANUP ---------- */
  ['header.header','footer.footer','#auth-modal','#mobile-overlay','#mobile-nav','#back-to-top','#toast-container'].forEach(function(s) {
    var el = document.querySelector(s); if (el) el.remove();
  });

  /* ---------- INSERT ---------- */
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
  document.body.insertAdjacentHTML('beforeend', extraHTML);

  /* ==========================================================
     AUTH BUTTON CLICKS
     IMPORTANT: Skip clicks inside user dropdown / user menu
     so that "Личный кабинет", "Настройки", "Выйти" work!
     ========================================================== */
  function initAuthButtons() {
    document.addEventListener('click', function(e) {
      /* === FIX: полностью игнорируем всё внутри #authContainer если юзер залогинен === */
      var authContainer = document.getElementById('authContainer');
      if (authContainer && authContainer.querySelector('.user-menu-wrap')) {
        /* Юзер залогинен — user-menu активен */
        if (authContainer.contains(e.target)) {
          console.log('[Components] Click inside authContainer — ignoring for auth trigger');
          return; /* НЕ перехватываем, пусть браузер обработает <a> и <button> */
        }
      }

      var btn = e.target.closest('#open-auth-btn, #open-auth-mobile, #guard-auth-btn, [data-auth-trigger]');
      if (!btn) return;
      e.preventDefault();

      /* Close mobile menu if open */
      var nav = document.getElementById('mobile-nav');
      var overlay = document.getElementById('mobile-overlay');
      var burger = document.getElementById('burger-btn');
      if (nav) nav.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      if (burger) burger.classList.remove('active');
      document.body.style.overflow = '';

      if (typeof Auth !== 'undefined' && Auth.showMain) {
        Auth.showMain();
      } else {
        console.error('[Components] Auth module not loaded!');
      }
    });
  }

  /* ---------- BURGER ---------- */
  function initBurger() {
    var burger = document.getElementById('burger-btn');
    var nav = document.getElementById('mobile-nav');
    var overlay = document.getElementById('mobile-overlay');
    if (!burger || !nav) return;
    function toggle() {
      var isOpen = nav.classList.toggle('active');
      if (overlay) overlay.classList.toggle('active', isOpen);
      burger.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    function close() {
      nav.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      burger.classList.remove('active');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', toggle);
    if (overlay) overlay.addEventListener('click', close);
    nav.querySelectorAll('.mobile-nav-link').forEach(function(l) { l.addEventListener('click', close); });
  }

  /* ---------- HEADER SCROLL ---------- */
  function initHeaderScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() { header.classList.toggle('scrolled', window.scrollY > 50); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- BACK TO TOP ---------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function() { btn.classList.toggle('visible', window.scrollY > 500); }, { passive: true });
    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- TOAST ---------- */
  window.showToast = function(message, type, duration) {
    type = type || 'info'; duration = duration || 3500;
    var container = document.getElementById('toast-container');
    if (!container) return;
    var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span><span class="toast-msg">' + message + '</span><button class="toast-close">&times;</button>';
    container.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('show'); });
    toast.querySelector('.toast-close').addEventListener('click', function() { rmToast(toast); });
    setTimeout(function() { rmToast(toast); }, duration);
  };
  function rmToast(t) { t.classList.remove('show'); t.classList.add('hide'); setTimeout(function() { t.remove(); }, 400); }

  /* ---------- THEME ---------- */
  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var saved = localStorage.getItem('nx-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updIcon(saved);
    btn.addEventListener('click', function() {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('nx-theme', next);
      updIcon(next);
    });
  }
  function updIcon(th) { var i = document.querySelector('#theme-toggle .theme-icon'); if (i) i.textContent = th === 'dark' ? '☀️' : '🌙'; }

  /* ==========================================================
     DASHBOARD GUARD — checks AFTER a short delay
     so auth.js has time to load and restore session
     ========================================================== */
  function initDashboardGuard() {
    if (currentPage !== 'dashboard' && currentPage !== 'settings') return;

    /* Wait 300ms for auth.js to init and restore token */
    setTimeout(function() {
      var hasToken = localStorage.getItem('cf_token');
      if (hasToken) {
        /* Remove guard if it exists from a previous state */
        var oldGuard = document.getElementById('auth-guard');
        if (oldGuard) oldGuard.remove();
        return;
      }

      /* No token — show guard */
      if (document.getElementById('auth-guard')) return;
      var guard = document.createElement('div');
      guard.id = 'auth-guard';
      guard.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:2rem;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:var(--bg1,#0a0e1a)';
      guard.innerHTML = '<h2 style="font-size:1.6rem;font-weight:800;color:var(--text-bright,#f1f5f9);margin-bottom:1rem">Необходимо войти в аккаунт</h2><p style="color:var(--text3,#64748b);margin-bottom:1.5rem">Для доступа к личному кабинету авторизуйтесь</p><button class="btn btn-primary btn-lg" id="guard-auth-btn">Войти</button>';
      document.body.appendChild(guard);
    }, 300);
  }

  /* ---------- INIT ALL ---------- */
  function initAll() {
    initAuthButtons();
    initBurger();
    initHeaderScroll();
    initBackToTop();
    initTheme();
    initDashboardGuard();
    console.log('[Components] v5 ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
