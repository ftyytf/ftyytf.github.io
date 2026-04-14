/* ============================================
   CryptoFlow by Muravsky — Core App Logic
   Header, theme, burger, auth modal, toasts
   ============================================ */
(function(){
  'use strict';

  // --- HEADER SCROLL ---
  var header = document.getElementById('header');
  if(header){
    window.addEventListener('scroll', function(){
      if(window.scrollY > 40){
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- THEME TOGGLE ---
  var themeBtn = document.getElementById('themeToggle');
  var html = document.documentElement;

  function getTheme(){
    return localStorage.getItem('nx-theme') || 'dark';
  }

  function setTheme(t){
    html.setAttribute('data-theme', t);
    localStorage.setItem('nx-theme', t);
    if(themeBtn){
      themeBtn.innerHTML = t === 'dark' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  setTheme(getTheme());

  if(themeBtn){
    themeBtn.addEventListener('click', function(){
      var current = getTheme();
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // --- BURGER MENU ---
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  if(burger && navLinks){
    burger.addEventListener('click', function(){
      burger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        burger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e){
      if(!burger.contains(e.target) && !navLinks.contains(e.target)){
        burger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }

  // --- AUTH MODAL ---
  var authBtn = document.getElementById('authBtn');
  var authModal = document.getElementById('authModal');
  var authClose = document.getElementById('authModalClose');

  function openModal(){
    if(authModal) authModal.classList.add('active');
  }

  function closeModal(){
    if(authModal) authModal.classList.remove('active');
  }

  if(authBtn){
    authBtn.addEventListener('click', openModal);
  }

  if(authClose){
    authClose.addEventListener('click', closeModal);
  }

  if(authModal){
    authModal.addEventListener('click', function(e){
      if(e.target === authModal) closeModal();
    });
  }

  // Auth tabs
  var authTabs = document.querySelectorAll('.auth-tab');
  var loginForm = document.getElementById('loginForm');
  var registerForm = document.getElementById('registerForm');

  authTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      authTabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var which = tab.getAttribute('data-tab');
      if(which === 'login'){
        if(loginForm) loginForm.classList.add('active');
        if(registerForm) registerForm.classList.remove('active');
      } else {
        if(loginForm) loginForm.classList.remove('active');
        if(registerForm) registerForm.classList.add('active');
      }
    });
  });

  // Form submit handlers
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      toast('Вход выполнен успешно!', 'success');
      closeModal();
    });
  }

  if(registerForm){
    registerForm.addEventListener('submit', function(e){
      e.preventDefault();
      toast('Аккаунт создан!', 'success');
      closeModal();
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function toast(message, type){
    var container = document.getElementById('toastContainer');
    if(!container) return;

    var t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');

    var icons = {
      success: '\u2705',
      error: '\u274C',
      info: '\u2139\uFE0F',
      warning: '\u26A0\uFE0F'
    };

    t.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
                  '<span class="toast-msg">' + message + '</span>';

    container.appendChild(t);

    // Trigger animation
    setTimeout(function(){ t.classList.add('show'); }, 10);

    // Auto remove
    setTimeout(function(){
      t.classList.remove('show');
      setTimeout(function(){ t.remove(); }, 300);
    }, 3500);
  }

  // --- SMOOTH SCROLL for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var target = document.querySelector(link.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- SCROLL ANIMATIONS ---
  var animateEls = document.querySelectorAll('.feature-card, .step, .stat-card, .advantage-card, .team-card, .timeline-item, .info-card');

  if(animateEls.length > 0){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animateEls.forEach(function(el){
      el.classList.add('animate-hidden');
      observer.observe(el);
    });
  }

  // --- Expose toast globally ---
  window.NX = { toast: toast };

})();


