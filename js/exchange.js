/* ============================================
   CryptoFlow — Exchange Widget Engine v3
   LIVE rates from CoinGecko API
   Auto-refresh every 30 seconds
   ============================================ */
(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', function(){
    console.log('[EXCHANGE] v3 initializing...');

    /* ========== EXPANDED CURRENCY CONFIG ========== */
    var currencies = [
      /* === TOP CRYPTO === */
      { code:'BTC',    name:'Bitcoin',         type:'crypto', icon:'\u20BF', color:'#F7931A', geckoId:'bitcoin',            price:0 },
      { code:'ETH',    name:'Ethereum',        type:'crypto', icon:'\u039E', color:'#627EEA', geckoId:'ethereum',           price:0 },
      { code:'USDT',   name:'Tether',          type:'crypto', icon:'₮',     color:'#26A17B', geckoId:'tether',             price:0 },
      { code:'BNB',    name:'BNB',             type:'crypto', icon:'◆',     color:'#F3BA2F', geckoId:'binancecoin',        price:0 },
      { code:'SOL',    name:'Solana',          type:'crypto', icon:'◎',     color:'#9945FF', geckoId:'solana',             price:0 },
      { code:'XRP',    name:'Ripple',          type:'crypto', icon:'✕',     color:'#00AAE4', geckoId:'ripple',             price:0 },
      { code:'ADA',    name:'Cardano',         type:'crypto', icon:'◇',     color:'#0033AD', geckoId:'cardano',            price:0 },
      { code:'DOGE',   name:'Dogecoin',        type:'crypto', icon:'Ð',     color:'#C2A633', geckoId:'dogecoin',           price:0 },
      { code:'DOT',    name:'Polkadot',        type:'crypto', icon:'●',     color:'#E6007A', geckoId:'polkadot',           price:0 },
      { code:'MATIC',  name:'Polygon',         type:'crypto', icon:'⬡',     color:'#8247E5', geckoId:'matic-network',      price:0 },
      { code:'LTC',    name:'Litecoin',        type:'crypto', icon:'Ł',     color:'#BFBBBB', geckoId:'litecoin',           price:0 },
      { code:'AVAX',   name:'Avalanche',       type:'crypto', icon:'▲',     color:'#E84142', geckoId:'avalanche-2',        price:0 },
      { code:'LINK',   name:'Chainlink',       type:'crypto', icon:'⬡',     color:'#2A5ADA', geckoId:'chainlink',          price:0 },
      { code:'TRX',    name:'TRON',            type:'crypto', icon:'⬫',     color:'#FF0013', geckoId:'tron',               price:0 },
      { code:'TON',    name:'Toncoin',         type:'crypto', icon:'◈',     color:'#0098EA', geckoId:'the-open-network',   price:0 },
      { code:'SHIB',   name:'Shiba Inu',       type:'crypto', icon:'Š',     color:'#FFA409', geckoId:'shiba-inu',          price:0 },
      { code:'UNI',    name:'Uniswap',         type:'crypto', icon:'🦄',    color:'#FF007A', geckoId:'uniswap',            price:0 },
      { code:'XLM',    name:'Stellar',         type:'crypto', icon:'✦',     color:'#14B6E7', geckoId:'stellar',            price:0 },
      { code:'ATOM',   name:'Cosmos',          type:'crypto', icon:'⚛',     color:'#2E3148', geckoId:'cosmos',             price:0 },
      { code:'FIL',    name:'Filecoin',        type:'crypto', icon:'⨍',     color:'#0090FF', geckoId:'filecoin',           price:0 },
      { code:'APT',    name:'Aptos',           type:'crypto', icon:'◆',     color:'#4DBA87', geckoId:'aptos',              price:0 },
      { code:'NEAR',   name:'NEAR Protocol',   type:'crypto', icon:'Ⓝ',     color:'#00C1DE', geckoId:'near',              price:0 },
      { code:'ARB',    name:'Arbitrum',         type:'crypto', icon:'◈',     color:'#28A0F0', geckoId:'arbitrum',           price:0 },
      { code:'OP',     name:'Optimism',         type:'crypto', icon:'⊕',     color:'#FF0420', geckoId:'optimism',           price:0 },
      { code:'ALGO',   name:'Algorand',         type:'crypto', icon:'Å',     color:'#000000', geckoId:'algorand',           price:0 },
      { code:'VET',    name:'VeChain',          type:'crypto', icon:'V',     color:'#15BDFF', geckoId:'vechain',            price:0 },
      { code:'FTM',    name:'Fantom',           type:'crypto', icon:'⟐',     color:'#1969FF', geckoId:'fantom',             price:0 },
      { code:'AAVE',   name:'Aave',             type:'crypto', icon:'Ⓐ',     color:'#B6509E', geckoId:'aave',              price:0 },
      { code:'EOS',    name:'EOS',              type:'crypto', icon:'◎',     color:'#000000', geckoId:'eos',               price:0 },
      { code:'SAND',   name:'The Sandbox',      type:'crypto', icon:'S',     color:'#04ADEF', geckoId:'the-sandbox',       price:0 },
      { code:'MANA',   name:'Decentraland',     type:'crypto', icon:'M',     color:'#FF2D55', geckoId:'decentraland',      price:0 },
      { code:'CRO',    name:'Cronos',           type:'crypto', icon:'C',     color:'#002D74', geckoId:'crypto-com-chain',  price:0 },
      { code:'IMX',    name:'Immutable',         type:'crypto', icon:'I',     color:'#00C2FF', geckoId:'immutable-x',       price:0 },
      { code:'HBAR',   name:'Hedera',           type:'crypto', icon:'ℏ',     color:'#000000', geckoId:'hedera-hashgraph',  price:0 },
      { code:'ICP',    name:'Internet Computer', type:'crypto', icon:'∞',    color:'#3B00B9', geckoId:'internet-computer',  price:0 },
      { code:'PEPE',   name:'Pepe',             type:'crypto', icon:'🐸',    color:'#4D8B31', geckoId:'pepe',              price:0 },
      { code:'WIF',    name:'dogwifhat',        type:'crypto', icon:'🐕',    color:'#E8A838', geckoId:'dogwifcoin',         price:0 },
      { code:'SUI',    name:'Sui',              type:'crypto', icon:'S',     color:'#6FBCF0', geckoId:'sui',               price:0 },
      { code:'SEI',    name:'Sei',              type:'crypto', icon:'S',     color:'#9B1C1C', geckoId:'sei-network',        price:0 },
      { code:'INJ',    name:'Injective',        type:'crypto', icon:'I',     color:'#00F2FE', geckoId:'injective-protocol', price:0 },
      { code:'RENDER', name:'Render',           type:'crypto', icon:'R',     color:'#000000', geckoId:'render-token',       price:0 },
      /* === FIAT — 10 most popular === */
      { code:'USD',  name:'US Dollar',          type:'fiat', icon:'$',  color:'#85BB65', geckoId:null, price:1 },
      { code:'EUR',  name:'Euro',               type:'fiat', icon:'€',  color:'#003399', geckoId:null, price:0 },
      { code:'RUB',  name:'Российский рубль',   type:'fiat', icon:'₽',  color:'#CC0000', geckoId:null, price:0 },
      { code:'UAH',  name:'Українська гривня',  type:'fiat', icon:'₴',  color:'#FFD700', geckoId:null, price:0 },
      { code:'GBP',  name:'British Pound',      type:'fiat', icon:'£',  color:'#4B0082', geckoId:null, price:0 },
      { code:'CNY',  name:'Chinese Yuan',       type:'fiat', icon:'¥',  color:'#DE2910', geckoId:null, price:0 },
      { code:'JPY',  name:'Japanese Yen',       type:'fiat', icon:'¥',  color:'#BC002D', geckoId:null, price:0 },
      { code:'KRW',  name:'Korean Won',         type:'fiat', icon:'₩',  color:'#003478', geckoId:null, price:0 },
      { code:'TRY',  name:'Turkish Lira',       type:'fiat', icon:'₺',  color:'#E30A17', geckoId:null, price:0 },
      { code:'INR',  name:'Indian Rupee',       type:'fiat', icon:'₹',  color:'#FF9933', geckoId:null, price:0 }
    ];

    /* Fallback prices if API fails */
    var fallbackPrices = {
      BTC:67420, ETH:3520, USDT:1, BNB:610, SOL:178, XRP:0.62,
      ADA:0.45, DOGE:0.15, DOT:7.2, MATIC:0.72, LTC:84, AVAX:36.5,
      LINK:14.8, TRX:0.13, TON:7.2, SHIB:0.000027,
      UNI:7.5, XLM:0.11, ATOM:8.9, FIL:5.8, APT:8.2, NEAR:6.5,
      ARB:1.1, OP:2.3, ALGO:0.18, VET:0.035, FTM:0.68, AAVE:92,
      EOS:0.82, SAND:0.43, MANA:0.41, CRO:0.12, IMX:2.1, HBAR:0.075,
      ICP:12.5, PEPE:0.0000088, WIF:2.4, SUI:3.6, SEI:0.52, INJ:24,
      RENDER:7.8,
      USD:1, EUR:1.08, RUB:0.011, UAH:0.024, GBP:1.27, CNY:0.14,
      JPY:0.0067, KRW:0.00074, TRY:0.031, INR:0.012
    };

    /* Apply fallbacks initially */
    currencies.forEach(function(c){
      if(c.price === 0 && fallbackPrices[c.code]) c.price = fallbackPrices[c.code];
    });

    /* ========== LIVE PRICE FETCH ========== */
    var lastUpdate = null;

    function fetchPrices(){
      var geckoIds = currencies.filter(function(c){ return c.geckoId; }).map(function(c){ return c.geckoId; });
      var url = 'https://api.coingecko.com/api/v3/simple/price?ids=' +
        geckoIds.join(',') +
        '&vs_currencies=usd,eur,rub,uah,gbp,cny,jpy,krw,try,inr&include_24hr_change=true';

      fetch(url)
        .then(function(r){ return r.json(); })
        .then(function(data){
          currencies.forEach(function(c){
            if(c.geckoId && data[c.geckoId]){
              c.price = data[c.geckoId].usd || c.price;
              c.change24h = data[c.geckoId].usd_24h_change || 0;
            }
          });

          /* Update fiat from BTC rates */
          var btcData = data.bitcoin;
          if(btcData){
            var btcUsd = btcData.usd;
            currencies.forEach(function(c){
              if(c.type === 'fiat' && c.code !== 'USD'){
                var fiatKey = c.code.toLowerCase();
                if(btcData[fiatKey]){
                  c.price = btcUsd / btcData[fiatKey];
                }
              }
            });
          }

          lastUpdate = new Date();
          updateStatusIndicator(true);
          calculate();
          console.log('[EXCHANGE] Prices updated from CoinGecko');

          /* Save for markets page */
          try{
            localStorage.setItem('nx_prices', JSON.stringify({
              time: lastUpdate.toISOString(),
              data: currencies.map(function(c){ return { code:c.code, price:c.price, change24h:c.change24h||0, type:c.type }; })
            }));
          }catch(e){}
        })
        .catch(function(err){
          console.warn('[EXCHANGE] API fetch failed, using fallback prices:', err);
          updateStatusIndicator(false);
        });
    }

    function updateStatusIndicator(ok){
      var el = document.getElementById('rateStatus');
      if(!el) return;
      if(ok && lastUpdate){
        var t = lastUpdate.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
        el.innerHTML = '<span style="color:#22c55e;margin-right:6px;">●</span>LIVE — ' + t;
        el.style.color = '#22c55e';
      } else {
        el.innerHTML = '<span style="color:#ef4444;margin-right:6px;">●</span>Оффлайн';
        el.style.color = '#ef4444';
      }
    }

    /* Fetch immediately, then every 30 sec */
    fetchPrices();
    setInterval(fetchPrices, 30000);

    /* ========== STATE ========== */
    var state = {
      from: currencies[0],  /* BTC */
      to: currencies[2],    /* USDT */
      fromAmount: 1,
      toAmount: 0,
      direction: 'from' /* which input user last typed into */
    };

    /* ========== DOM ELEMENTS ========== */
    var fromBtn      = document.getElementById('fromCurrencyBtn');
    var toBtn        = document.getElementById('toCurrencyBtn');
    var fromDrop     = document.getElementById('fromCurrencyDropdown');
    var toDrop       = document.getElementById('toCurrencyDropdown');
    var fromList     = document.getElementById('fromCurrencyList');
    var toList       = document.getElementById('toCurrencyList');
    var fromInput    = document.getElementById('fromAmount');
    var toInput      = document.getElementById('toAmount');
    var swapBtn      = document.getElementById('swapBtn');
    var rateDisplay  = document.getElementById('exchangeRate');
    var feeDisplay   = document.getElementById('exchangeFee');
    var receiveDisp  = document.getElementById('exchangeReceive');
    var submitBtn    = document.getElementById('exchangeSubmit');

    /* Safety check */
    if(!fromBtn){
      console.warn('[EXCHANGE] #fromCurrencyBtn not found, trying fallback');
      fromBtn = document.querySelector('.exchange-currency-btn');
    }
    if(!toBtn){
      var allBtns = document.querySelectorAll('.exchange-currency-btn');
      if(allBtns.length > 1) toBtn = allBtns[1];
    }
    if(!fromBtn || !toBtn){
      console.error('[EXCHANGE] Cannot find currency buttons — aborting');
      return;
    }

    console.log('[EXCHANGE] All DOM elements found');

    /* ========== RENDER CURRENCY BUTTON ========== */
    function renderBtn(btn, cur){
      btn.innerHTML = '';

      var ic = document.createElement('span');
      ic.className = 'currency-icon-circle';
      ic.textContent = cur.icon;

      var cd = document.createElement('span');
      cd.className = 'currency-btn-code';
      cd.textContent = cur.code;

      var ar = document.createElement('span');
      ar.className = 'currency-btn-arrow';
      ar.textContent = '▼';

      btn.appendChild(ic);
      btn.appendChild(cd);
      btn.appendChild(ar);
    }

    /* ========== RENDER CURRENCY LIST ========== */
    function renderList(listEl, side, filter, search){
      filter = filter || 'all';
      search = (search || '').toLowerCase();
      listEl.innerHTML = '';
      var current = side === 'from' ? state.from : state.to;

      currencies.forEach(function(c){
        if(filter !== 'all' && c.type !== filter) return;
        if(search && c.code.toLowerCase().indexOf(search) === -1 && c.name.toLowerCase().indexOf(search) === -1) return;

        var li = document.createElement('li');
        li.className = 'currency-option' + (c.code === current.code ? ' selected' : '');

        /* Icon */
        var iconEl = document.createElement('span');
        iconEl.className = 'currency-option-icon';
        iconEl.style.color = c.color;
        iconEl.textContent = c.icon;

        /* Info */
        var infoEl = document.createElement('span');
        infoEl.className = 'currency-option-info';

        var nameEl = document.createElement('span');
        nameEl.className = 'currency-option-name';
        nameEl.textContent = c.code;

        var fullEl = document.createElement('span');
        fullEl.className = 'currency-option-full';
        fullEl.textContent = c.name;

        infoEl.appendChild(nameEl);
        infoEl.appendChild(fullEl);

        /* Price */
        var priceWrap = document.createElement('span');
        priceWrap.className = 'currency-option-price';

        var priceEl = document.createElement('div');
        priceEl.className = 'currency-option-usd';
        if(c.type === 'fiat'){
          priceEl.textContent = c.icon + (c.code === 'USD' ? '1.00' : (1/c.price).toFixed(2));
        } else {
          priceEl.textContent = '$' + (c.price < 0.01 ? c.price.toFixed(6) : c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString('en-US', {maximumFractionDigits:2}));
        }
        priceWrap.appendChild(priceEl);

        if(c.change24h !== undefined && c.change24h !== 0 && c.type === 'crypto'){
          var chEl = document.createElement('div');
          chEl.className = 'currency-option-change ' + (c.change24h >= 0 ? 'positive' : 'negative');
          chEl.textContent = (c.change24h >= 0 ? '+' : '') + c.change24h.toFixed(2) + '%';
          priceWrap.appendChild(chEl);
        }

        li.appendChild(iconEl);
        li.appendChild(infoEl);
        li.appendChild(priceWrap);

        li.addEventListener('click', function(){
          if(side === 'from'){
            state.from = c;
            renderBtn(fromBtn, c);
          } else {
            state.to = c;
            renderBtn(toBtn, c);
          }
          closeAllDropdowns();
          calculate();
        });

        listEl.appendChild(li);
      });

      /* Empty state */
      if(listEl.children.length === 0){
        var empty = document.createElement('li');
        empty.className = 'currency-option-empty';
        empty.textContent = 'Ничего не найдено';
        listEl.appendChild(empty);
      }
    }

    /* ========== CALCULATE ========== */
    function calculate(){
      if(state.direction === 'to'){
        var toUSD = state.toAmount * state.to.price;
        state.fromAmount = toUSD / (state.from.price * 0.995);
        if(fromInput) fromInput.value = state.fromAmount > 0 ? smartRound(state.fromAmount) : '';
      } else {
        var fromUSD = state.fromAmount * state.from.price;
        var afterFee = fromUSD * 0.995;
        state.toAmount = afterFee / state.to.price;
        if(toInput) toInput.value = state.toAmount > 0 ? smartRound(state.toAmount) : '';
      }

      /* Rate display */
      if(rateDisplay){
        var rate = state.from.price / state.to.price;
        rateDisplay.textContent = '1 ' + state.from.code + ' ≈ ' + smartRound(rate) + ' ' + state.to.code;
      }
      if(feeDisplay) feeDisplay.textContent = '0.5%';
      if(receiveDisp){
        receiveDisp.textContent = state.toAmount > 0 ? smartRound(state.toAmount) + ' ' + state.to.code : '—';
      }
    }

    function smartRound(n){
      if(n === 0) return '0';
      if(Math.abs(n) >= 1000) return n.toLocaleString('en-US', {maximumFractionDigits:2});
      if(Math.abs(n) >= 1) return n.toFixed(4);
      if(Math.abs(n) >= 0.001) return n.toFixed(6);
      return n.toFixed(8);
    }

    /* ========== DROPDOWN LOGIC ========== */
    var activeDropdown = null;

    function closeAllDropdowns(){
      [fromDrop, toDrop].forEach(function(d){ if(d) d.classList.remove('open'); });
      [fromBtn, toBtn].forEach(function(b){ if(b) b.classList.remove('active'); });
      activeDropdown = null;
    }

    function openDropdown(btn, drop, listEl, side){
      var wasOpen = drop.classList.contains('open');
      closeAllDropdowns();

      if(!wasOpen){
        drop.classList.add('open');
        btn.classList.add('active');
        activeDropdown = drop;

        /* Render full list */
        var activeTab = drop.querySelector('.currency-tab.active');
        var filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
        renderList(listEl, side, filter, '');

        /* Focus search */
        var searchInput = drop.querySelector('.currency-search');
        if(searchInput){
          searchInput.value = '';
          setTimeout(function(){ searchInput.focus(); }, 50);
        }
      }
    }

    /* Button click handlers */
    fromBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      console.log('[EXCHANGE] From button clicked');
      openDropdown(fromBtn, fromDrop, fromList, 'from');
    });

    toBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      console.log('[EXCHANGE] To button clicked');
      openDropdown(toBtn, toDrop, toList, 'to');
    });

    /* Search in dropdowns */
    [fromDrop, toDrop].forEach(function(drop, idx){
      if(!drop) return;
      var searchInput = drop.querySelector('.currency-search');
      var listEl = idx === 0 ? fromList : toList;
      var side = idx === 0 ? 'from' : 'to';

      if(searchInput){
        searchInput.addEventListener('input', function(){
          var activeTab = drop.querySelector('.currency-tab.active');
          var filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
          renderList(listEl, side, filter, this.value);
        });
        searchInput.addEventListener('click', function(e){ e.stopPropagation(); });
      }
    });

    /* Filter tabs */
    [fromDrop, toDrop].forEach(function(drop, idx){
      if(!drop) return;
      var tabs = drop.querySelectorAll('.currency-tab');
      var listEl = idx === 0 ? fromList : toList;
      var side = idx === 0 ? 'from' : 'to';

      tabs.forEach(function(tab){
        tab.addEventListener('click', function(e){
          e.stopPropagation();
          tabs.forEach(function(t){ t.classList.remove('active'); });
          tab.classList.add('active');
          var searchInput = drop.querySelector('.currency-search');
          var search = searchInput ? searchInput.value : '';
          renderList(listEl, side, tab.getAttribute('data-filter'), search);
        });
      });
    });

    /* Close on outside click */
    document.addEventListener('click', function(e){
      if(activeDropdown && !activeDropdown.contains(e.target)){
        closeAllDropdowns();
      }
    });

    /* Prevent dropdown close on internal click */
    [fromDrop, toDrop].forEach(function(d){
      if(d) d.addEventListener('click', function(e){ e.stopPropagation(); });
    });

    /* ========== INPUT HANDLERS ========== */
    if(fromInput){
      fromInput.addEventListener('input', function(){
        state.fromAmount = parseFloat(this.value) || 0;
        state.direction = 'from';
        calculate();
      });
      fromInput.addEventListener('focus', function(){ state.direction = 'from'; });
    }

    if(toInput){
      toInput.addEventListener('input', function(){
        state.toAmount = parseFloat(this.value) || 0;
        state.direction = 'to';
        calculate();
      });
      toInput.addEventListener('focus', function(){ state.direction = 'to'; });
    }

    /* ========== SWAP BUTTON ========== */
    if(swapBtn){
      swapBtn.addEventListener('click', function(){
        var temp = state.from;
        state.from = state.to;
        state.to = temp;
        renderBtn(fromBtn, state.from);
        renderBtn(toBtn, state.to);

        /* Animation */
        this.style.transform = 'rotate(180deg)';
        var self = this;
        setTimeout(function(){ self.style.transform = ''; }, 300);

        calculate();
        console.log('[EXCHANGE] Swapped: ' + state.from.code + ' <-> ' + state.to.code);
      });
    }

    /* ========== SUBMIT BUTTON ========== */
    if(submitBtn){
      submitBtn.addEventListener('click', function(){
        if(state.fromAmount <= 0){
          if(window.NX && window.NX.toast) window.NX.toast('Введите сумму', 'error');
          if(fromInput) fromInput.focus();
          return;
        }
        if(window.NX && window.NX.toast){
          window.NX.toast(
            'Обмен ' + smartRound(state.fromAmount) + ' ' + state.from.code +
            ' → ' + smartRound(state.toAmount) + ' ' + state.to.code + ' выполнен!',
            'success'
          );
        }
      });
    }

    /* ========== INIT ========== */
    renderBtn(fromBtn, state.from);
    renderBtn(toBtn, state.to);
    if(fromInput) fromInput.value = state.fromAmount;
    calculate();

    /* Expose for markets page */
    window.NXExchange = {
      currencies: currencies,
      fetchPrices: fetchPrices,
      getLastUpdate: function(){ return lastUpdate; }
    };

    console.log('[EXCHANGE] Widget ready! ' + currencies.length + ' currencies loaded');
  });
})();
