/* ============================================
   CryptoFlow by Muravsky — Markets Page Logic
   v2.1 — Cache + Throttle + CORS fallback
   ============================================ */
(function(){
  'use strict';

  /* ── Coin definitions ── */
  var coins = [
    {id:'bitcoin',         code:'BTC',  name:'Bitcoin',   icon:'\u20BF', color:'#F7931A'},
    {id:'ethereum',        code:'ETH',  name:'Ethereum',  icon:'\u039E', color:'#627EEA'},
    {id:'tether',          code:'USDT', name:'Tether',    icon:'\u20AE', color:'#26A17B'},
    {id:'binancecoin',     code:'BNB',  name:'BNB',       icon:'\u25C6', color:'#F3BA2F'},
    {id:'solana',          code:'SOL',  name:'Solana',    icon:'\u25CE', color:'#9945FF'},
    {id:'ripple',          code:'XRP',  name:'Ripple',    icon:'\u2715', color:'#00AAE4'},
    {id:'cardano',         code:'ADA',  name:'Cardano',   icon:'\u25C7', color:'#0033AD'},
    {id:'dogecoin',        code:'DOGE', name:'Dogecoin',  icon:'\u00D0', color:'#C2A633'},
    {id:'polkadot',        code:'DOT',  name:'Polkadot',  icon:'\u25CF', color:'#E6007A'},
    {id:'the-open-network',code:'TON',  name:'Toncoin',   icon:'\u25C8', color:'#0098EA'},
    {id:'litecoin',        code:'LTC',  name:'Litecoin',  icon:'\u0141', color:'#BFBBBB'},
    {id:'avalanche-2',     code:'AVAX', name:'Avalanche', icon:'\u25B2', color:'#E84142'},
    {id:'chainlink',       code:'LINK', name:'Chainlink', icon:'\u2B21', color:'#2A5ADA'},
    {id:'tron',            code:'TRX',  name:'TRON',      icon:'\u2B2B', color:'#FF0013'},
    {id:'matic-network',   code:'MATIC',name:'Polygon',   icon:'\u2B21', color:'#8247E5'},
    {id:'shiba-inu',       code:'SHIB', name:'Shiba Inu', icon:'\u0160', color:'#FFA409'}
  ];

  /* ── Fallback prices ── */
  var fallbackPrices = {
    'bitcoin':         {current_price:104800, price_change_percentage_24h: 1.24},
    'ethereum':        {current_price:3320,   price_change_percentage_24h: 2.15},
    'tether':          {current_price:1.00,   price_change_percentage_24h: 0.01},
    'binancecoin':     {current_price:640,    price_change_percentage_24h:-0.35},
    'solana':          {current_price:172,    price_change_percentage_24h: 3.82},
    'ripple':          {current_price:2.38,   price_change_percentage_24h: 0.67},
    'cardano':         {current_price:0.78,   price_change_percentage_24h:-1.20},
    'dogecoin':        {current_price:0.22,   price_change_percentage_24h: 5.40},
    'polkadot':        {current_price:7.15,   price_change_percentage_24h:-0.88},
    'the-open-network':{current_price:5.90,   price_change_percentage_24h: 1.95},
    'litecoin':        {current_price:98,     price_change_percentage_24h: 0.45},
    'avalanche-2':     {current_price:38,     price_change_percentage_24h: 2.70},
    'chainlink':       {current_price:18.5,   price_change_percentage_24h: 1.10},
    'tron':            {current_price:0.27,   price_change_percentage_24h:-0.60},
    'matic-network':   {current_price:0.72,   price_change_percentage_24h:-2.10},
    'shiba-inu':       {current_price:0.000024, price_change_percentage_24h: 4.30}
  };

  /* ── State ── */
  var marketData = {};
  var charts = {};
  var chartCache = {};        /* Cache fetched chart data: { coinId: {labels, values, time} } */
  var CACHE_TTL = 120000;     /* 2 minutes cache */
  var currentMainCoin = 'bitcoin';
  var useProxy = false;
  var fetchInProgress = {};   /* Prevent duplicate requests */

  /* ── Mock data generators ── */
  function generateMockPrices(basePrice, points, volatility){
    var prices = [];
    var price = basePrice;
    var now = Date.now();
    var interval = (7 * 24 * 3600000) / points;
    for(var i = 0; i < points; i++){
      var change = (Math.random() - 0.48) * volatility * price;
      price = Math.max(price * 0.85, price + change);
      prices.push([now - (points - i) * interval, price]);
    }
    return prices;
  }

  function getBasePrice(coinId){
    var fb = fallbackPrices[coinId];
    return fb ? fb.current_price : 100;
  }

  function getVolatility(coinId){
    var price = getBasePrice(coinId);
    if(price > 10000) return 0.008;
    if(price > 100) return 0.015;
    if(price > 1) return 0.025;
    return 0.04;
  }

  function generateSparkline(basePrice, volatility){
    var arr = [];
    var p = basePrice * (0.95 + Math.random() * 0.05);
    for(var i = 0; i < 168; i++){
      p += (Math.random() - 0.48) * volatility * p;
      p = Math.max(p * 0.8, p);
      arr.push(p);
    }
    return arr;
  }

  /* ── CORS-safe fetch ── */
  function safeFetch(url){
    if(!useProxy){
      return fetch(url)
        .then(function(r){
          if(r.status === 429) throw new Error('Rate limited');
          if(!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .catch(function(err){
          console.warn('[Markets] Direct fetch failed:', err.message);
          useProxy = true;
          return proxyFetch(url);
        });
    }
    return proxyFetch(url);
  }

  function proxyFetch(url){
    var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
    return fetch(proxyUrl)
      .then(function(r){
        if(!r.ok) throw new Error('Proxy HTTP ' + r.status);
        return r.json();
      });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function(){
    console.log('[Markets] Initializing v2.1...');
    initCoinButtons();
    fetchMarketData();
    fetchHistory('bitcoin',  'btcChart',  '#F7931A', false);
    fetchHistory('ethereum', 'ethChart',  '#627EEA', false);
    fetchHistory('bitcoin',  'mainChart', '#F7931A', true);

    setInterval(function(){
      chartCache = {};  /* Clear cache on refresh cycle */
      fetchMarketData();
    }, 60000);

    var refreshBtn = document.getElementById('refreshBtn');
    if(refreshBtn){
      refreshBtn.addEventListener('click', function(){
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Обновление...';
        chartCache = {};
        useProxy = false;
        Promise.all([
          fetchMarketData(),
          fetchHistory('bitcoin',  'btcChart',  '#F7931A', false),
          fetchHistory('ethereum', 'ethChart',  '#627EEA', false),
          fetchHistory(currentMainCoin, 'mainChart', getCoinColor(currentMainCoin), true)
        ]).then(function(){
          refreshBtn.disabled = false;
          refreshBtn.textContent = 'Обновить';
        }).catch(function(){
          refreshBtn.disabled = false;
          refreshBtn.textContent = 'Обновить';
        });
      });
    }
  });

  function getCoinColor(id){
    var c = coins.find(function(x){ return x.id === id; });
    return c ? c.color : '#6366f1';
  }

  /* ── Coin switcher buttons ── */
  function initCoinButtons(){
    var wrap = document.getElementById('chartCoinBtns');
    if(!wrap) return;
    wrap.innerHTML = '';
    var topCoins = ['bitcoin','ethereum','solana','binancecoin','ripple','dogecoin'];

    topCoins.forEach(function(id){
      var coin = coins.find(function(c){ return c.id === id; });
      if(!coin) return;

      var btn = document.createElement('button');
      btn.className = 'btn coin-switch-btn';
      btn.setAttribute('data-coin', id);
      btn.style.cssText =
        'padding:6px 14px;font-size:0.85rem;border-radius:8px;' +
        'border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);' +
        'color:inherit;cursor:pointer;transition:all 0.25s ease;';
      btn.textContent = coin.code;

      if(id === 'bitcoin'){
        btn.style.background = coin.color + '30';
        btn.style.borderColor = coin.color;
        btn.style.color = '#fff';
      }

      btn.addEventListener('click', function(){
        if(currentMainCoin === id) return;
        currentMainCoin = id;
        console.log('[Markets] Switching to:', coin.code);

        /* Update button styles */
        wrap.querySelectorAll('button').forEach(function(b){
          b.style.background = 'rgba(255,255,255,0.05)';
          b.style.borderColor = 'rgba(255,255,255,0.12)';
          b.style.color = 'inherit';
        });
        btn.style.background = coin.color + '30';
        btn.style.borderColor = coin.color;
        btn.style.color = '#fff';

        /* Update the chart title */
        var chartCard = document.getElementById('mainChart').closest('.chart-card');
        if(chartCard){
          var h3 = chartCard.querySelector('h3');
          if(h3) h3.textContent = coin.name + ' (' + coin.code + ') \u2014 7 дней';
        }

        /* Load chart (from cache or API) */
        fetchHistory(id, 'mainChart', coin.color, true);
      });

      wrap.appendChild(btn);
    });

    console.log('[Markets] Buttons created:', topCoins.length);
  }

  /* ── Fetch market data ── */
  function fetchMarketData(){
    var ids = coins.map(function(c){ return c.id; }).join(',');
    var url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' +
              ids + '&order=market_cap_desc&sparkline=true&price_change_percentage=24h';

    return safeFetch(url)
      .then(function(data){
        if(!Array.isArray(data)) throw new Error('bad data');
        data.forEach(function(item){ marketData[item.id] = item; });
        renderTable();
        updateStatus(true, false);
        console.log('[Markets] Table loaded from API');
      })
      .catch(function(err){
        console.warn('[Markets] API failed, using fallback:', err.message);
        useFallbackMarketData();
        renderTable();
        updateStatus(true, true);
      });
  }

  function useFallbackMarketData(){
    coins.forEach(function(coin){
      var fb = fallbackPrices[coin.id];
      if(!fb) return;
      var sparkArr = generateSparkline(fb.current_price, getVolatility(coin.id));
      marketData[coin.id] = {
        id: coin.id,
        current_price: fb.current_price,
        price_change_percentage_24h: fb.price_change_percentage_24h,
        sparkline_in_7d: { price: sparkArr }
      };
    });
  }

  function updateStatus(ok, isFallback){
    var el = document.getElementById('marketStatus');
    if(!el) return;
    var t = new Date().toLocaleTimeString('ru-RU');
    if(ok){
      if(isFallback){
        el.textContent = 'Демо-режим — ' + t;
        el.style.color = '#f59e0b';
      } else {
        el.textContent = 'Обновлено: ' + t;
        el.style.color = '#22c55e';
      }
    } else {
      el.textContent = 'Ошибка соединения';
      el.style.color = '#ef4444';
    }
  }

  /* ── Table renderer ── */
  function renderTable(){
    var tbody = document.getElementById('marketTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    coins.forEach(function(coin, idx){
      var data = marketData[coin.id];
      if(!data) return;

      var tr = document.createElement('tr');

      var tdNum = document.createElement('td');
      tdNum.textContent = idx + 1;
      tdNum.style.opacity = '0.6';
      tr.appendChild(tdNum);

      var tdCoin = document.createElement('td');
      tdCoin.innerHTML =
        '<div class="coin-cell">' +
          '<span class="coin-icon" style="color:' + coin.color +
          ';text-shadow:0 0 8px ' + coin.color + '40;">' + coin.icon + '</span>' +
          '<div><div class="coin-name">' + coin.code +
          '</div><div class="coin-full">' + coin.name + '</div></div>' +
        '</div>';
      tr.appendChild(tdCoin);

      var tdPrice = document.createElement('td');
      var price = data.current_price || 0;
      tdPrice.style.fontWeight = '600';
      tdPrice.textContent = '$' + (price < 0.01
        ? price.toFixed(6)
        : price.toLocaleString('en-US', {maximumFractionDigits: 2}));
      tr.appendChild(tdPrice);

      var tdChange = document.createElement('td');
      var change = data.price_change_percentage_24h || 0;
      tdChange.className = change >= 0 ? 'price-up' : 'price-down';
      tdChange.style.fontWeight = '600';
      tdChange.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
      tr.appendChild(tdChange);

      var tdSpark = document.createElement('td');
      tdSpark.className = 'sparkline-cell';
      var sparkCanvas = document.createElement('canvas');
      sparkCanvas.id = 'spark_' + coin.code;
      tdSpark.appendChild(sparkCanvas);
      tr.appendChild(tdSpark);
      tbody.appendChild(tr);

      if(data.sparkline_in_7d && data.sparkline_in_7d.price){
        drawSparkline(sparkCanvas, data.sparkline_in_7d.price,
          change >= 0 ? '#22c55e' : '#ef4444');
      }
    });
  }

  function drawSparkline(canvas, prices, color){
    var ctx = canvas.getContext('2d');
    var w = canvas.width = 100;
    var h = canvas.height = 32;
    var min = Math.min.apply(null, prices);
    var max = Math.max.apply(null, prices);
    var range = max - min || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    prices.forEach(function(p, i){
      var x = (i / (prices.length - 1)) * w;
      var y = h - ((p - min) / range) * h;
      if(i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  /* ── Fetch chart history WITH CACHE ── */
  function fetchHistory(coinId, canvasId, color, isMain){
    var cacheKey = coinId + '_' + (isMain ? '7d' : '1d');

    /* 1) Check cache */
    if(chartCache[cacheKey] && (Date.now() - chartCache[cacheKey].time < CACHE_TTL)){
      console.log('[Markets] Using cached data for:', coinId);
      renderChart(canvasId, chartCache[cacheKey].labels, chartCache[cacheKey].values, color, isMain);
      return Promise.resolve();
    }

    /* 2) Prevent duplicate in-flight requests */
    if(fetchInProgress[cacheKey]){
      console.log('[Markets] Request already in progress for:', coinId);
      return fetchInProgress[cacheKey].then(function(){
        if(chartCache[cacheKey]){
          renderChart(canvasId, chartCache[cacheKey].labels, chartCache[cacheKey].values, color, isMain);
        }
      });
    }

    /* 3) Fetch from API */
    var days = isMain ? 7 : 1;
    var url = 'https://api.coingecko.com/api/v3/coins/' + coinId +
              '/market_chart?vs_currency=usd&days=' + days;

    var promise = safeFetch(url)
      .then(function(data){
        if(!data.prices) throw new Error('no prices');
        var labels = data.prices.map(function(p){
          var d = new Date(p[0]);
          return isMain
            ? (d.getMonth()+1) + '/' + d.getDate()
            : d.getHours() + ':00';
        });
        var values = data.prices.map(function(p){ return p[1]; });

        /* Save to cache */
        chartCache[cacheKey] = { labels: labels, values: values, time: Date.now() };

        renderChart(canvasId, labels, values, color, isMain);
        console.log('[Markets] Chart from API:', coinId);
      })
      .catch(function(err){
        console.warn('[Markets] API failed for', coinId, '— using mock');
        useFallbackChart(coinId, canvasId, color, isMain);
      })
      .then(function(){
        delete fetchInProgress[cacheKey];
      });

    fetchInProgress[cacheKey] = promise;
    return promise;
  }

  /* ── Fallback chart ── */
  function useFallbackChart(coinId, canvasId, color, isMain){
    var base = getBasePrice(coinId);
    var vol = getVolatility(coinId);
    var points = isMain ? 168 : 24;
    var mockPrices = generateMockPrices(base, points, vol);

    var labels = mockPrices.map(function(p){
      var d = new Date(p[0]);
      return isMain
        ? (d.getMonth()+1) + '/' + d.getDate()
        : d.getHours() + ':00';
    });
    var values = mockPrices.map(function(p){ return p[1]; });

    /* Cache the mock too */
    var cacheKey = coinId + '_' + (isMain ? '7d' : '1d');
    chartCache[cacheKey] = { labels: labels, values: values, time: Date.now() };

    renderChart(canvasId, labels, values, color, isMain);
  }

  /* ── Chart.js renderer ── */
  function renderChart(canvasId, labels, values, color, isMain){
    var canvas = document.getElementById(canvasId);
    if(!canvas){
      console.warn('[Markets] Canvas not found:', canvasId);
      return;
    }
    if(typeof Chart === 'undefined'){
      console.warn('[Markets] Chart.js not loaded!');
      return;
    }

    /* Destroy previous */
    if(charts[canvasId]){
      charts[canvasId].destroy();
      charts[canvasId] = null;
    }

    var ctx = canvas.getContext('2d');
    var h = isMain ? 400 : 300;
    var gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '60');
    gradient.addColorStop(1, color + '05');

    charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'USD',
          data: values,
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: color,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
            callbacks: {
              label: function(context){
                return '$' + context.parsed.y.toLocaleString('en-US', {maximumFractionDigits: 2});
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.5)', maxTicksLimit: 8 }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              callback: function(v){ return '$' + v.toLocaleString('en-US'); }
            }
          }
        },
        interaction: { mode: 'nearest', intersect: false }
      }
    });

    console.log('[Markets] Chart rendered:', canvasId, '(' + color + ')');
  }

})();
