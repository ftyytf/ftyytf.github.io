/* ============================================
   CryptoFlow by Muravsky — Rates Page Logic
   ============================================ */
(function(){
  'use strict';

  var CURRENCIES = { crypto:[], fiat:[] };
  var ALL = [];
  var currentFilter = 'all';
  var currentView = 'table';

  function enrichCurrency(c, i, type){
    var change = Math.random() * 27 - 12;
    var cap = c.price * (Math.random() * 5e10 + 1e6);
    var chart = [];
    var val = c.price;
    for(var j = 0; j < 14; j++){
      val = val * (1 + (Math.random() * 0.12 - 0.06));
      chart.push(Math.max(val, 0.0001));
    }
    return {
      code: c.code,
      name: c.name,
      color: c.color,
      price: c.price,
      rank: i + 1,
      change24h: change,
      marketCap: cap,
      chartData: chart,
      type: type
    };
  }

  function load(){
    fetch('data/currencies.json')
      .then(function(res){ return res.json(); })
      .then(function(data){
        CURRENCIES = data;
        ALL = [];
        var idx = 0;
        CURRENCIES.crypto.forEach(function(c){
          ALL.push(enrichCurrency(c, idx, 'crypto'));
          idx++;
        });
        CURRENCIES.fiat.forEach(function(c){
          ALL.push(enrichCurrency(c, idx, 'fiat'));
          idx++;
        });
        updateStats();
        render();
        setupEvents();
      })
      .catch(function(e){
        console.error('Failed to load currencies', e);
      });
  }

  function updateStats(){
    var total = ALL.length;
    var crypto = 0;
    var fiat = 0;
    ALL.forEach(function(c){
      if(c.type === 'crypto') crypto++;
      else fiat++;
    });
    setText('statTotal', total);
    setText('statCrypto', crypto);
    setText('statFiat', fiat);
    var now = new Date();
    setText('statUpdated', now.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}));
  }

  function setText(id, val){
    var el = document.getElementById(id);
    if(el) el.textContent = val;
  }

  function getFiltered(){
    var items = ALL.slice();
    if(currentFilter === 'crypto'){
      items = items.filter(function(c){ return c.type === 'crypto'; });
    }
    if(currentFilter === 'fiat'){
      items = items.filter(function(c){ return c.type === 'fiat'; });
    }
    var searchEl = document.getElementById('ratesSearch');
    var q = searchEl ? searchEl.value.toLowerCase().trim() : '';
    if(q){
      items = items.filter(function(c){
        return c.code.toLowerCase().indexOf(q) !== -1 ||
               c.name.toLowerCase().indexOf(q) !== -1;
      });
    }
    return items;
  }

  function formatPrice(p){
    if(p >= 1000) return '$' + p.toLocaleString('en-US', {maximumFractionDigits:2});
    if(p >= 1) return '$' + p.toFixed(2);
    if(p >= 0.01) return '$' + p.toFixed(4);
    return '$' + p.toFixed(8);
  }

  function formatCap(n){
    if(n >= 1e12) return '$' + (n/1e12).toFixed(2) + 'T';
    if(n >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
    if(n >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M';
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function miniChart(data, isUp, maxH){
    var max = -Infinity, min = Infinity;
    for(var i = 0; i < data.length; i++){
      if(data[i] > max) max = data[i];
      if(data[i] < min) min = data[i];
    }
    var range = max - min || 1;
    var color = isUp ? '#22c55e' : '#ef4444';
    var html = '';
    for(var j = 0; j < data.length; j++){
      var h = Math.max(((data[j] - min) / range) * maxH, 3);
      html += '<div class="bar" style="height:' + h + 'px;background:' + color + ';opacity:.7"></div>';
    }
    return html;
  }

  function renderTable(items){
    var tbody = document.getElementById('ratesTableBody');
    if(!tbody) return;

    if(items.length === 0){
      tbody.innerHTML = '<tr><td colspan="7">' +
        '<div class="rates-empty">' +
        '<div class="rates-empty-icon">&#128269;</div>' +
        '<div class="rates-empty-text">Ничего не найдено</div>' +
        '</div></td></tr>';
      return;
    }

    var html = '';
    for(var i = 0; i < items.length; i++){
      var c = items[i];
      var isUp = c.change24h >= 0;
      var cls = isUp ? 'up' : 'down';
      var sign = isUp ? '+' : '';
      var chart = miniChart(c.chartData, isUp, 32);
      var badge = c.type === 'fiat' ? ' &middot; Фиат' : '';

      html += '<tr>' +
        '<td class="rate-num">' + (i + 1) + '</td>' +
        '<td><div class="rate-name-cell">' +
          '<span class="rate-icon" style="background:' + c.color + '">' + c.code[0] + '</span>' +
          '<div class="rate-name-info">' +
            '<span class="rate-name">' + c.name + '</span>' +
            '<span class="rate-code">' + c.code + badge + '</span>' +
          '</div>' +
        '</div></td>' +
        '<td class="rate-price">' + formatPrice(c.price) + '</td>' +
        '<td><span class="rate-change ' + cls + '">' + sign + c.change24h.toFixed(2) + '%</span></td>' +
        '<td class="rate-cap td-cap">' + formatCap(c.marketCap) + '</td>' +
        '<td class="td-chart"><div class="rate-mini-chart">' + chart + '</div></td>' +
        '<td><a href="exchange.html" class="rate-trade-btn">Обменять</a></td>' +
      '</tr>';
    }
    tbody.innerHTML = html;
  }

  function renderGrid(items){
    var grid = document.getElementById('gridView');
    if(!grid) return;

    if(items.length === 0){
      grid.innerHTML = '<div class="rates-empty">' +
        '<div class="rates-empty-icon">&#128269;</div>' +
        '<div class="rates-empty-text">Ничего не найдено</div></div>';
      return;
    }

    var html = '';
    for(var i = 0; i < items.length; i++){
      var c = items[i];
      var isUp = c.change24h >= 0;
      var cls = isUp ? 'up' : 'down';
      var sign = isUp ? '+' : '';
      var chart = miniChart(c.chartData, isUp, 48);

      html += '<div class="rate-card">' +
        '<div class="rate-card-top">' +
          '<div class="rate-card-left">' +
            '<span class="rate-card-icon" style="background:' + c.color + '">' + c.code[0] + '</span>' +
            '<div>' +
              '<div class="rate-card-name">' + c.code + '</div>' +
              '<div class="rate-card-code">' + c.name + '</div>' +
            '</div>' +
          '</div>' +
          '<span class="rate-card-change ' + cls + '">' + sign + c.change24h.toFixed(2) + '%</span>' +
        '</div>' +
        '<div class="rate-card-chart">' + chart + '</div>' +
        '<div class="rate-card-bottom">' +
          '<div class="rate-card-price">' + formatPrice(c.price) + '</div>' +
          '<div class="rate-card-cap">Cap: ' + formatCap(c.marketCap) + '</div>' +
        '</div>' +
      '</div>';
    }
    grid.innerHTML = html;

    // Add click handlers
    grid.querySelectorAll('.rate-card').forEach(function(card){
      card.addEventListener('click', function(){
        window.location.href = 'exchange.html';
      });
    });
  }

  function render(){
    var items = getFiltered();
    var tableWrap = document.getElementById('tableView');
    var gridWrap = document.getElementById('gridView');

    if(currentView === 'table'){
      if(tableWrap) tableWrap.style.display = '';
      if(gridWrap) gridWrap.style.display = 'none';
      renderTable(items);
    } else {
      if(tableWrap) tableWrap.style.display = 'none';
      if(gridWrap) gridWrap.style.display = '';
      renderGrid(items);
    }
  }

  function setupEvents(){
    // Search input
    var search = document.getElementById('ratesSearch');
    if(search){
      search.addEventListener('input', function(){
        render();
      });
    }

    // Filter tabs
    var filters = document.querySelectorAll('.rates-filter');
    filters.forEach(function(btn){
      btn.addEventListener('click', function(){
        filters.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        render();
      });
    });

    // View toggle
    var views = document.querySelectorAll('.view-btn');
    views.forEach(function(btn){
      btn.addEventListener('click', function(){
        views.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        currentView = btn.getAttribute('data-view');
        render();
      });
    });
  }

  // Start
  document.addEventListener('DOMContentLoaded', load);

})();

