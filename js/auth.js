/* ===== AUTH.JS v6 — CryptoFlow — Email Code via EmailJS ===== */
var Auth = (function () {
  "use strict";

  /* ---------- EMAILJS CONFIG ---------- */
  var EMAILJS_SERVICE  = "service_aaej67z";
  var EMAILJS_TEMPLATE = "template_5hm86pz";
  var EMAILJS_KEY      = "7jemebYTHs7y_ACJ8";

  /* ---------- STATE ---------- */
  var currentUser = null;
  var authToken = localStorage.getItem("cf_token") || null;
  var currentEmail = "";
  var currentCode = "";
  var codeExpiry = 0;
  var currentName = "";
  var modal = null;
  var emailjsReady = false;

  /* ---------- INIT ---------- */
  function init() {
    loadEmailJS();
    createModal();
    injectStyles();
    checkAuth();
    console.log("[Auth] v6 ready");
  }

  /* Load EmailJS SDK */
  function loadEmailJS() {
    if (typeof emailjs !== "undefined") {
      emailjs.init(EMAILJS_KEY);
      emailjsReady = true;
      return;
    }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = function () {
      emailjs.init(EMAILJS_KEY);
      emailjsReady = true;
      console.log("[Auth] EmailJS SDK loaded");
    };
    s.onerror = function () { console.error("[Auth] Failed to load EmailJS SDK"); };
    document.head.appendChild(s);
  }

  /* ---------- STYLES ---------- */
  function injectStyles() {
    if (document.getElementById("auth-styles-v6")) return;
    var style = document.createElement("style");
    style.id = "auth-styles-v6";
    style.textContent = [
      ".auth-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);backdrop-filter:blur(12px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .35s ease}",
      ".auth-overlay.open{opacity:1;pointer-events:all}",
      ".auth-modal{background:#13111c;border:1px solid rgba(139,92,246,.25);border-radius:24px;padding:40px 36px;width:94%;max-width:420px;position:relative;transform:translateY(30px) scale(.96);transition:transform .4s cubic-bezier(.2,.9,.3,1.2);box-shadow:0 25px 60px rgba(0,0,0,.5),0 0 40px rgba(139,92,246,.12)}",
      ".auth-overlay.open .auth-modal{transform:translateY(0) scale(1)}",
      ".auth-close{position:absolute;top:16px;right:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#fff;width:36px;height:36px;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}",
      ".auth-close:hover{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.4);transform:rotate(90deg)}",
      ".auth-title{text-align:center;font-size:1.65rem;font-weight:700;color:#fff;margin-bottom:6px}",
      ".auth-subtitle{text-align:center;color:rgba(255,255,255,.5);font-size:.92rem;margin-bottom:28px;line-height:1.5}",
      ".auth-subtitle strong{color:#a78bfa}",
      ".auth-label{display:block;color:rgba(255,255,255,.55);font-size:.75rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;margin-top:18px}",
      ".auth-input{width:100%;padding:14px 16px;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);border-radius:14px;color:#fff;font-size:1rem;outline:none;transition:border-color .25s,box-shadow .25s;box-sizing:border-box}",
      ".auth-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.15)}",
      ".auth-input::placeholder{color:rgba(255,255,255,.25)}",
      ".auth-btn{width:100%;padding:15px;border-radius:14px;font-size:1rem;font-weight:600;cursor:pointer;border:none;margin-top:18px;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:8px}",
      ".auth-btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);color:#fff;box-shadow:0 4px 20px rgba(139,92,246,.35)}",
      ".auth-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,92,246,.5)}",
      ".auth-btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none}",
      ".auth-btn-outline{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.12)}",
      ".auth-btn-outline:hover{border-color:#8b5cf6;background:rgba(139,92,246,.06)}",
      ".auth-error{color:#f87171;font-size:.85rem;margin-top:8px;display:none;text-align:center;padding:8px;background:rgba(239,68,68,.08);border-radius:10px}",
      ".auth-footer{text-align:center;margin-top:22px;color:rgba(255,255,255,.45);font-size:.88rem}",
      ".auth-footer a{color:#a78bfa;text-decoration:none;font-weight:500;cursor:pointer;transition:color .2s}",
      ".auth-footer a:hover{color:#c4b5fd}",
      ".code-inputs{display:flex;gap:10px;justify-content:center;margin:18px 0}",
      ".code-box{width:48px;height:56px;text-align:center;font-size:1.5rem;font-weight:700;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.12);border-radius:14px;color:#fff;outline:none;transition:all .25s}",
      ".code-box:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.2);background:rgba(139,92,246,.06)}",
      ".timer-text{text-align:center;color:rgba(255,255,255,.4);font-size:.82rem;margin-top:12px}",
      ".spinner{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:auth-spin .6s linear infinite;display:inline-block}",
      "@keyframes auth-spin{to{transform:rotate(360deg)}}",
      /* User menu — FIXED */
      ".user-menu-wrap{position:relative;display:inline-flex;align-items:center}",
      ".user-menu-btn{display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 14px;border-radius:12px;transition:background .2s;background:none;border:none;color:inherit;font-family:inherit}",
      ".user-menu-btn:hover{background:rgba(255,255,255,.05)}",
      ".user-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.95rem;color:#fff;flex-shrink:0}",
      ".user-name{color:#fff;font-weight:500;font-size:.92rem}",
      ".user-dropdown{position:absolute;top:calc(100% + 8px);right:0;background:#1e1b2e;border:1px solid rgba(139,92,246,.2);border-radius:16px;padding:8px;min-width:220px;opacity:0;visibility:hidden;transform:translateY(-10px);transition:all .25s;z-index:99999;box-shadow:0 15px 40px rgba(0,0,0,.4)}",
      ".user-dropdown.open{opacity:1;visibility:visible;transform:translateY(0)}",
      ".user-dropdown-item{display:flex;align-items:center;gap:10px;padding:12px 16px;color:#ccc;text-decoration:none;border-radius:10px;font-size:.9rem;transition:all .2s;border:none;background:none;width:100%;cursor:pointer;font-family:inherit;box-sizing:border-box}",
      ".user-dropdown-item:hover{background:rgba(139,92,246,.1);color:#fff}",
      ".user-dropdown-item.danger{color:#f87171}",
      ".user-dropdown-item.danger:hover{background:rgba(239,68,68,.1)}",
      ".user-dropdown-divider{height:1px;background:rgba(255,255,255,.06);margin:6px 0}",
      ".success-checkmark{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:auth-popIn .5s cubic-bezier(.2,.9,.3,1.2)}",
      "@keyframes auth-popIn{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}",
      ".auth-trigger:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(139,92,246,.4)}"
    ].join("\n");
    document.head.appendChild(style);
  }

  /* ---------- MODAL ---------- */
  function createModal() {
    if (document.getElementById("authModal")) {
      modal = document.getElementById("authModal");
      return;
    }
    modal = document.createElement("div");
    modal.id = "authModal";
    modal.className = "auth-overlay";
    modal.innerHTML = '<div class="auth-modal"><button class="auth-close" id="authClose">&times;</button><div id="authContent"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.getElementById("authClose").addEventListener("click", closeModal);
  }

  function openModal() { modal.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }

  /* ---------- SCREENS ---------- */
  function showMain() {
    var c = getContent();
    c.innerHTML =
      '<div style="text-align:center;margin-bottom:24px"><div style="font-size:3.5rem">&#128640;</div></div>' +
      '<div class="auth-title">Добро пожаловать</div>' +
      '<div class="auth-subtitle">Войдите или создайте аккаунт CryptoFlow</div>' +
      '<button class="auth-btn auth-btn-primary" id="goLogin">Войти</button>' +
      '<button class="auth-btn auth-btn-outline" id="goRegister">Создать аккаунт</button>';
    openModal();
    q("goLogin").addEventListener("click", showLogin);
    q("goRegister").addEventListener("click", showRegister);
  }

  function showLogin() {
    var c = getContent();
    c.innerHTML =
      '<div style="text-align:center;margin-bottom:20px"><div style="font-size:3rem">&#128274;</div></div>' +
      '<div class="auth-title">Вход</div>' +
      '<div class="auth-subtitle">Введите email для получения кода</div>' +
      '<label class="auth-label">EMAIL</label>' +
      '<input class="auth-input" type="email" id="loginEmail" placeholder="your@email.com">' +
      '<div class="auth-error" id="loginError"></div>' +
      '<button class="auth-btn auth-btn-primary" id="loginSubmit">Получить код</button>' +
      '<div class="auth-footer">Нет аккаунта? <a href="#" id="toReg">Регистрация</a> | <a href="#" id="toMain">Назад</a></div>';
    q("loginSubmit").addEventListener("click", function () {
      var email = q("loginEmail").value.trim();
      if (!validEmail(email)) return showError("loginError", "Введите корректный email");
      currentEmail = email;
      currentName = "";
      sendCode(email, "login");
    });
    q("loginEmail").addEventListener("keydown", function (e) { if (e.key === "Enter") q("loginSubmit").click(); });
    q("toReg").addEventListener("click", function (e) { e.preventDefault(); showRegister(); });
    q("toMain").addEventListener("click", function (e) { e.preventDefault(); showMain(); });
  }

  function showRegister() {
    var c = getContent();
    c.innerHTML =
      '<div style="text-align:center;margin-bottom:20px"><div style="font-size:3rem">&#128640;</div></div>' +
      '<div class="auth-title">Регистрация</div>' +
      '<div class="auth-subtitle">Создайте аккаунт за минуту</div>' +
      '<label class="auth-label">ИМЯ</label>' +
      '<input class="auth-input" type="text" id="regName" placeholder="Ваше имя">' +
      '<label class="auth-label">EMAIL</label>' +
      '<input class="auth-input" type="email" id="regEmail" placeholder="your@email.com">' +
      '<div class="auth-error" id="regError"></div>' +
      '<button class="auth-btn auth-btn-primary" id="regSubmit">Отправить код</button>' +
      '<div class="auth-footer">Есть аккаунт? <a href="#" id="toLog">Войти</a> | <a href="#" id="toMain2">Назад</a></div>';
    q("regSubmit").addEventListener("click", function () {
      var name = q("regName").value.trim();
      var email = q("regEmail").value.trim();
      if (!name) return showError("regError", "Введите имя");
      if (!validEmail(email)) return showError("regError", "Введите корректный email");
      currentEmail = email;
      currentName = name;
      sendCode(email, "register");
    });
    q("regEmail").addEventListener("keydown", function (e) { if (e.key === "Enter") q("regSubmit").click(); });
    q("toLog").addEventListener("click", function (e) { e.preventDefault(); showLogin(); });
    q("toMain2").addEventListener("click", function (e) { e.preventDefault(); showMain(); });
  }

  function showCodeScreen(type) {
    var c = getContent();
    c.innerHTML =
      '<div style="text-align:center;margin-bottom:20px"><div style="font-size:3rem">&#128231;</div></div>' +
      '<div class="auth-title">Проверьте почту</div>' +
      '<div class="auth-subtitle">Код отправлен на <strong>' + currentEmail + '</strong></div>' +
      '<label class="auth-label">КОД ПОДТВЕРЖДЕНИЯ</label>' +
      '<div class="code-inputs" id="codeInputs">' +
        '<input class="code-box" type="text" maxlength="1" inputmode="numeric">' +
        '<input class="code-box" type="text" maxlength="1" inputmode="numeric">' +
        '<input class="code-box" type="text" maxlength="1" inputmode="numeric">' +
        '<input class="code-box" type="text" maxlength="1" inputmode="numeric">' +
        '<input class="code-box" type="text" maxlength="1" inputmode="numeric">' +
        '<input class="code-box" type="text" maxlength="1" inputmode="numeric">' +
      '</div>' +
      '<div class="auth-error" id="codeError"></div>' +
      '<button class="auth-btn auth-btn-primary" id="codeSubmit">Подтвердить</button>' +
      '<div class="auth-footer"><a href="#" id="resendCode">Отправить повторно</a> | <a href="#" id="backFromCode">Назад</a></div>' +
      '<div class="timer-text" id="timerText"></div>';

    var boxes = document.querySelectorAll(".code-box");
    boxes.forEach(function (box, i) {
      box.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        if (this.value && i < boxes.length - 1) boxes[i + 1].focus();
      });
      box.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !this.value && i > 0) boxes[i - 1].focus();
        if (e.key === "Enter") q("codeSubmit").click();
      });
      box.addEventListener("paste", function (e) {
        e.preventDefault();
        var paste = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        for (var j = 0; j < boxes.length && j < paste.length; j++) boxes[j].value = paste[j];
        if (paste.length >= boxes.length) q("codeSubmit").click();
      });
    });
    boxes[0].focus();
    startTimer();

    q("codeSubmit").addEventListener("click", function () {
      var code = "";
      boxes.forEach(function (b) { code += b.value; });
      if (code.length < 6) return showError("codeError", "Введите 6-значный код");
      if (Date.now() > codeExpiry) return showError("codeError", "Код истёк. Запросите новый.");
      if (code !== currentCode) return showError("codeError", "Неверный код");
      completeAuth(type);
    });

    q("resendCode").addEventListener("click", function (e) { e.preventDefault(); sendCode(currentEmail, type); });
    q("backFromCode").addEventListener("click", function (e) { e.preventDefault(); type === "register" ? showRegister() : showLogin(); });
  }

  /* ---------- SEND CODE ---------- */
  function sendCode(email, type) {
    currentCode = String(Math.floor(100000 + Math.random() * 900000));
    codeExpiry = Date.now() + 5 * 60 * 1000;

    var btn = document.querySelector("#authContent .auth-btn-primary");
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Отправка...'; }

    if (!emailjsReady || typeof emailjs === "undefined") {
      setTimeout(function () {
        if (emailjsReady && typeof emailjs !== "undefined") {
          doSend(email, type);
        } else {
          alert("Ваш код: " + currentCode);
          showCodeScreen(type);
        }
      }, 1500);
      return;
    }
    doSend(email, type);
  }

  function doSend(email, type) {
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      email: email,
      name: currentName || email.split("@")[0],
      code: currentCode
    }).then(function () {
      console.log("[Auth] Code sent to " + email);
      showCodeScreen(type);
    }).catch(function (err) {
      console.error("[Auth] EmailJS error:", err);
      alert("Код: " + currentCode + "\n(Email не отправился)");
      showCodeScreen(type);
    });
  }

  /* ---------- TIMER ---------- */
  function startTimer() {
    var seconds = 300;
    var el = q("timerText");
    if (!el) return;
    el.textContent = "Код действителен: 5:00";
    var iv = setInterval(function () {
      seconds--;
      if (seconds <= 0) { clearInterval(iv); if (el) el.textContent = "Код истёк"; return; }
      var m = Math.floor(seconds / 60), s = seconds % 60;
      if (el) el.textContent = "Код действителен: " + m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
  }

  /* ---------- AUTH COMPLETE ---------- */
  function completeAuth(type) {
    currentUser = { name: currentName || currentEmail.split("@")[0], email: currentEmail };
    authToken = "cf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("cf_token", authToken);
    localStorage.setItem("cf_user", JSON.stringify(currentUser));

    var c = getContent();
    c.innerHTML =
      '<div style="text-align:center;padding:20px 0">' +
      '<div class="success-checkmark"><svg width="40" height="40" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div>' +
      '<div class="auth-title">Добро пожаловать!</div>' +
      '<div class="auth-subtitle">Вы вошли как <strong>' + (currentUser.name || currentUser.email) + '</strong></div>' +
      '<button class="auth-btn auth-btn-primary" id="successClose">Продолжить</button></div>';
    q("successClose").addEventListener("click", function () { closeModal(); updateHeader(); });
    setTimeout(function () { closeModal(); updateHeader(); }, 3500);

    var guard = document.getElementById("auth-guard");
    if (guard) guard.remove();
  }

  /* ---------- HEADER — FIXED DROPDOWN ---------- */
  function checkAuth() {
    var saved = localStorage.getItem("cf_user");
    if (authToken && saved) {
      try { currentUser = JSON.parse(saved); } catch (e) { currentUser = null; }
      if (currentUser) {
                /* SYNC all keys on page load */
                localStorage.setItem("cf_user", JSON.stringify(currentUser));
                localStorage.setItem("nxUser", JSON.stringify(currentUser));
                localStorage.setItem("nx_user", JSON.stringify(currentUser));
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                updateHeader();
            }
    }
  }

  function updateHeader() {
    var container = document.getElementById("authContainer");
    if (!container || !currentUser) return;

    var ini = (currentUser.name || currentUser.email || "U").charAt(0).toUpperCase();

    /* Build HTML — button toggles, links are separate and clickable */
    container.innerHTML =
      '<div class="user-menu-wrap">' +
        '<button type="button" class="user-menu-btn" id="userToggleBtn">' +
          '<div class="user-avatar">' + ini + '</div>' +
          '<span class="user-name">' + (currentUser.name || currentUser.email) + '</span>' +
          '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>' +
        '</button>' +
        '<div class="user-dropdown" id="userDropdown">' +
          '<a href="dashboard.html" class="user-dropdown-item">&#128100; Личный кабинет</a>' +
          '<a href="settings.html" class="user-dropdown-item">&#9881;&#65039; Настройки</a>' +
          '<div class="user-dropdown-divider"></div>' +
          '<button type="button" class="user-dropdown-item danger" id="logoutBtn">&#128682; Выйти</button>' +
        '</div>' +
      '</div>';

    /* Toggle dropdown on button click ONLY */
    var toggleBtn = document.getElementById("userToggleBtn");
    var dropdown = document.getElementById("userDropdown");

    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });

    /* Links inside dropdown — let them navigate normally, just close dropdown */
    dropdown.querySelectorAll("a.user-dropdown-item").forEach(function (link) {
      link.addEventListener("click", function (e) {
        /* Don't stop propagation — let the <a> navigate */
        dropdown.classList.remove("open");
        console.log("[Auth] Navigating to: " + link.href);
      });
    });

    /* Logout button */
    document.getElementById("logoutBtn").addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.remove("open");
      logout();
    });

    /* Close dropdown when clicking anywhere else */
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });

    /* Mobile button */
    var mb = document.getElementById("open-auth-mobile");
    if (mb && currentUser) {
      mb.textContent = currentUser.name || currentUser.email;
      mb.style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)";
      mb.style.color = "#fff";
      mb.onclick = function (e) {
        e.preventDefault();
        if (confirm("Выйти из аккаунта?")) logout();
      };
    }

    console.log("[Auth] Header updated — dropdown fixed");
  }

  function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem("cf_token");
    localStorage.removeItem("cf_user");
    location.reload();
  }

  /* ---------- HELPERS ---------- */
  function getContent() { return document.getElementById("authContent"); }
  function q(id) { return document.getElementById(id); }
  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = "block"; setTimeout(function () { el.style.display = "none"; }, 4000); }
  }

  return {
    init: init,
    show: showMain,
    showMain: showMain,
    close: closeModal,
    logout: logout,
    getUser: function () { return currentUser; },
    getToken: function () { return authToken; },
    isAuth: function () { return !!authToken; }
  };
})();

document.addEventListener("DOMContentLoaded", function () { Auth.init(); });

