/* ================================================================
   dashboard.js — Dashboard page logic
   Canvas charts, portfolio, transactions, notifications
   ================================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ============================================================
     1. PORTFOLIO DONUT CHART
     ============================================================ */
  const drawPortfolioChart = () => {
    const canvas = $('#portfolio-chart');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const data = [
      { label: 'BTC',   value: 45, color: '#f7931a' },
      { label: 'ETH',   value: 25, color: '#627eea' },
      { label: 'USDT',  value: 15, color: '#26a17b' },
      { label: 'SOL',   value: 10, color: '#9945ff' },
      { label: 'Другое', value: 5,  color: '#6366f1' }
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 8;
    const innerR = outerR * 0.65;
    const gap = 0.03;

    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg').trim() || '#0a0a1a';
    const textBright = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-bright').trim() || '#ffffff';
    const textDim = getComputedStyle(document.documentElement)
      .getPropertyValue('--text3').trim() || '#888888';

    let startAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle - gap;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      startAngle = startAngle + sliceAngle;
    });

    // Центральный текст
    ctx.fillStyle = textBright;
    ctx.font = 'bold ' + Math.round(size * 0.1) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$12,450', cx, cy - 6);

    ctx.fillStyle = textDim;
    ctx.font = Math.round(size * 0.055) + 'px system-ui, sans-serif';
    ctx.fillText('Портфель', cx, cy + size * 0.07);
  };

  drawPortfolioChart();
  window.addEventListener('resize', drawPortfolioChart);

  /* ============================================================
     2. BALANCE SPARKLINE CHART (7 дней)
     ============================================================ */
  const drawBalanceChart = () => {
    const canvas = $('#balance-chart');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const data = [11200, 11800, 11600, 12100, 12400, 12050, 12450];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    const pad = 10;

    const points = data.map((val, i) => ({
      x: i * step,
      y: h - pad - ((val - min) / range) * (h - pad * 2)
    }));

    // Градиентная заливка
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(99,102,241,0.25)');
    gradient.addColorStop(1, 'rgba(99,102,241,0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Линия
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Точки
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  };

  drawBalanceChart();
  window.addEventListener('resize', drawBalanceChart);

  /* ============================================================
     3. MINI SPARKLINE CHARTS (для карточек активов)
     ============================================================ */
  const drawMiniChart = (canvas, data, color) => {
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '00');

    const points = data.map((val, i) => ({
      x: i * step,
      y: h - ((val - min) / range) * h * 0.8 - h * 0.1
    }));

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, h);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  $$('.mini-chart').forEach((canvas) => {
    const count = 20;
    const trend = canvas.dataset.trend === 'down' ? -1 : 1;
    const data = [];
    let val = 50 + Math.random() * 50;
    for (let i = 0; i < count; i++) {
      val += (Math.random() - 0.45) * 8 + trend * 1.5;
      val = Math.max(10, Math.min(150, val));
      data.push(val);
    }
    const color = canvas.dataset.color || '#6366f1';
    drawMiniChart(canvas, data, color);
  });

  /* ============================================================
     4. PERIOD SWITCHER (1D, 1W, 1M, 3M, 1Y, ALL)
     ============================================================ */
  $$('.period-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.period-switcher') || document;
      $$('.period-btn', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Перерисовываем график с новыми данными
      const periods = {
        '1D': 24, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, 'ALL': 730
      };
      const count = periods[btn.textContent.trim()] || 30;
      const data = [];
      let val = 10000 + Math.random() * 3000;
      for (let i = 0; i < count; i++) {
        val += (Math.random() - 0.47) * 200;
        val = Math.max(5000, val);
        data.push(val);
      }

      // Рисуем обновлённый график
      const canvas = $('#balance-chart');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const step = w / (data.length - 1);
        const pad = 10;

        const points = data.map((v, i) => ({
          x: i * step,
          y: h - pad - ((v - min) / range) * (h - pad * 2)
        }));

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(99,102,241,0.25)');
        gradient.addColorStop(1, 'rgba(99,102,241,0)');

        ctx.beginPath();
        ctx.moveTo(0, h);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });
  });

  /* ============================================================
     5. TRANSACTIONS LIST — Фильтрация
     ============================================================ */
  $$('.tx-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.tx-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      $$('.tx-row').forEach((row) => {
        if (filter === 'all') {
          row.style.display = '';
        } else {
          row.style.display = row.dataset.type === filter ? '' : 'none';
        }
      });
    });
  });

  /* ============================================================
     6. NOTIFICATIONS — Mark as read
     ============================================================ */
  $$('.notif-item').forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.remove('unread');
      item.classList.add('read');

      // Обновляем счётчик
      const badge = $('.notif-badge');
      if (badge) {
        const current = parseInt(badge.textContent) || 0;
        if (current > 1) {
          badge.textContent = current - 1;
        } else {
          badge.style.display = 'none';
        }
      }
    });
  });

  /* ============================================================
     7. QUICK ACTIONS
     ============================================================ */
  $$('.quick-action').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      switch (action) {
        case 'deposit':
          if (typeof Toast !== 'undefined') Toast.show('Адрес для пополнения скопирован', 'success');
          break;
        case 'withdraw':
          if (typeof Toast !== 'undefined') Toast.show('Открываем форму вывода...', 'info');
          break;
        case 'exchange':
          window.location.href = 'exchange.html';
          break;
        case 'transfer':
          if (typeof Toast !== 'undefined') Toast.show('Переводы скоро будут доступны', 'info');
          break;
        default:
          break;
      }
    });
  });

  /* ============================================================
     8. REAL-TIME BALANCE ANIMATION
     ============================================================ */
  const balanceEl = $('#total-balance');
  if (balanceEl) {
    let currentBalance = 12450;

    setInterval(() => {
      const change = (Math.random() - 0.48) * 50;
      currentBalance += change;
      currentBalance = Math.max(10000, currentBalance);

      const formatted = '$' + currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      balanceEl.textContent = formatted;

      // Мигание цвета
      balanceEl.style.transition = 'color 0.3s ease';
      balanceEl.style.color = change > 0 ? '#22c55e' : '#ef4444';
      setTimeout(() => { balanceEl.style.color = ''; }, 500);
    }, 5000);
  }

  /* ============================================================
     9. PROFIT/LOSS INDICATOR
     ============================================================ */
  const profitEl = $('#daily-profit');
  if (profitEl) {
    setInterval(() => {
      const pnl = (Math.random() * 600 - 200).toFixed(2);
      const isPositive = parseFloat(pnl) >= 0;
      const sign = isPositive ? '+' : '';
      profitEl.textContent = sign + '$' + Math.abs(parseFloat(pnl)).toFixed(2);
      profitEl.className = 'dash-stat-value ' + (isPositive ? 'positive' : 'negative');
    }, 7000);
  }

  /* ============================================================
     10. ASSET CARDS — Hover interactivity
     ============================================================ */
  $$('.dash-asset-card').forEach((card) => {
    card.addEventListener('click', () => {
      const symbol = card.dataset.symbol || 'BTC';
      if (typeof Toast !== 'undefined') {
        Toast.show('Подробности ' + symbol + ' — скоро', 'info');
      }
    });
  });

  /* ============================================================
     11. SIDEBAR COLLAPSE (Desktop)
     ============================================================ */
  const collapseBtn = $('#sidebar-collapse');
  const sidebar = $('.dash-sidebar');
  const main = $('.dash-main');

  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      if (main) main.classList.toggle('expanded');

      const isCollapsed = sidebar.classList.contains('collapsed');
      collapseBtn.textContent = isCollapsed ? '→' : '←';
      localStorage.setItem('sidebar-collapsed', isCollapsed);
    });

    // Восстанавливаем состояние
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      sidebar.classList.add('collapsed');
      if (main) main.classList.add('expanded');
      collapseBtn.textContent = '→';
    }
  }

  /* ============================================================
     12. DASHBOARD TABS (Overview / Assets / History)
     ============================================================ */
  $$('.dash-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.panel;
      if (!target) return;

      $$('.dash-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      $$('.dash-panel').forEach(p => {
        p.classList.toggle('active', p.id === target);
      });
    });
  });

  console.log('%c Dashboard %c Ready ', 
    'background:#6366f1;color:#fff;padding:3px 6px;border-radius:3px 0 0 3px;font-weight:bold',
    'background:#22c55e;color:#fff;padding:3px 6px;border-radius:0 3px 3px 0'
  );

});
