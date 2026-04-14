(function(){
/* === COIN DATABASE === */
var coins=[
{id:"btc",name:"Bitcoin",symbol:"BTC",icon:"\u20BF",price:104500,cls:"coin-btc",type:"crypto"},
{id:"eth",name:"Ethereum",symbol:"ETH",icon:"\u039E",price:3280,cls:"coin-eth",type:"crypto"},
{id:"usdt",name:"Tether",symbol:"USDT",icon:"\u20AE",price:1,cls:"coin-usdt",type:"crypto"},
{id:"bnb",name:"BNB",symbol:"BNB",icon:"B",price:710,cls:"coin-bnb",type:"crypto"},
{id:"sol",name:"Solana",symbol:"SOL",icon:"S",price:178,cls:"coin-sol",type:"crypto"},
{id:"xrp",name:"Ripple",symbol:"XRP",icon:"X",price:2.48,cls:"coin-xrp",type:"crypto"},
{id:"ada",name:"Cardano",symbol:"ADA",icon:"A",price:0.82,cls:"coin-ada",type:"crypto"},
{id:"doge",name:"Dogecoin",symbol:"DOGE",icon:"D",price:0.24,cls:"coin-doge",type:"crypto"},
{id:"dot",name:"Polkadot",symbol:"DOT",icon:"\u25CF",price:8.9,cls:"coin-dot",type:"crypto"},
{id:"matic",name:"Polygon",symbol:"MATIC",icon:"M",price:0.58,cls:"coin-matic",type:"crypto"},
{id:"link",name:"Chainlink",symbol:"LINK",icon:"\u2B21",price:18.5,cls:"coin-link",type:"crypto"},
{id:"avax",name:"Avalanche",symbol:"AVAX",icon:"A",price:42,cls:"coin-avax",type:"crypto"},
{id:"uni",name:"Uniswap",symbol:"UNI",icon:"U",price:12.4,cls:"coin-uni",type:"crypto"},
{id:"ltc",name:"Litecoin",symbol:"LTC",icon:"\u0141",price:115,cls:"coin-ltc",type:"crypto"},
{id:"atom",name:"Cosmos",symbol:"ATOM",icon:"\u269B",price:11.2,cls:"coin-atom",type:"crypto"},
{id:"ton",name:"Toncoin",symbol:"TON",icon:"T",price:7.2,cls:"coin-ton",type:"crypto"},
{id:"trx",name:"TRON",symbol:"TRX",icon:"T",price:0.27,cls:"coin-trx",type:"crypto"},
{id:"shib",name:"Shiba Inu",symbol:"SHIB",icon:"S",price:0.000027,cls:"coin-shib",type:"crypto"},
{id:"near",name:"NEAR",symbol:"NEAR",icon:"N",price:6.5,cls:"coin-near",type:"crypto"},
{id:"arb",name:"Arbitrum",symbol:"ARB",icon:"A",price:1.1,cls:"coin-arb",type:"crypto"},
{id:"op",name:"Optimism",symbol:"OP",icon:"O",price:2.3,cls:"coin-op",type:"crypto"},
{id:"apt",name:"Aptos",symbol:"APT",icon:"A",price:8.2,cls:"coin-apt",type:"crypto"},
{id:"sui",name:"Sui",symbol:"SUI",icon:"S",price:3.6,cls:"coin-sui",type:"crypto"},
{id:"inj",name:"Injective",symbol:"INJ",icon:"I",price:24,cls:"coin-inj",type:"crypto"},
{id:"pepe",name:"Pepe",symbol:"PEPE",icon:"P",price:0.0000088,cls:"coin-pepe",type:"crypto"},
{id:"usd",name:"US Dollar",symbol:"USD",icon:"$",price:1,cls:"coin-usd",type:"fiat"},
{id:"eur",name:"Euro",symbol:"EUR",icon:"\u20AC",price:1.09,cls:"coin-eur",type:"fiat"},
{id:"rub",name:"Russian Ruble",symbol:"RUB",icon:"\u20BD",price:0.0106,cls:"coin-rub",type:"fiat"},
{id:"gbp",name:"British Pound",symbol:"GBP",icon:"\u00A3",price:1.27,cls:"coin-gbp",type:"fiat"},
{id:"cny",name:"Chinese Yuan",symbol:"CNY",icon:"\u00A5",price:0.138,cls:"coin-cny",type:"fiat"},
{id:"jpy",name:"Japanese Yen",symbol:"JPY",icon:"\u00A5",price:0.0067,cls:"coin-jpy",type:"fiat"},
{id:"try",name:"Turkish Lira",symbol:"TRY",icon:"\u20BA",price:0.031,cls:"coin-try",type:"fiat"},
{id:"uah",name:"Ukrainian Hryvnia",symbol:"UAH",icon:"\u20B4",price:0.024,cls:"coin-uah",type:"fiat"},
{id:"kzt",name:"Kazakh Tenge",symbol:"KZT",icon:"\u20B8",price:0.002,cls:"coin-kzt",type:"fiat"},
{id:"aed",name:"UAE Dirham",symbol:"AED",icon:"\u062F",price:0.272,cls:"coin-aed",type:"fiat"},
{id:"inr",name:"Indian Rupee",symbol:"INR",icon:"\u20B9",price:0.012,cls:"coin-inr",type:"fiat"},
{id:"chf",name:"Swiss Franc",symbol:"CHF",icon:"Fr",price:1.13,cls:"coin-chf",type:"fiat"},
{id:"pln",name:"Polish Zloty",symbol:"PLN",icon:"z\u0142",price:0.257,cls:"coin-pln",type:"fiat"},
{id:"gel",name:"Georgian Lari",symbol:"GEL",icon:"\u20BE",price:0.366,cls:"coin-gel",type:"fiat"}
];

var geckoMap={btc:"bitcoin",eth:"ethereum",usdt:"tether",bnb:"binancecoin",sol:"solana",xrp:"ripple",ada:"cardano",doge:"dogecoin",dot:"polkadot",matic:"matic-network",link:"chainlink",avax:"avalanche-2",uni:"uniswap",ltc:"litecoin",atom:"cosmos",ton:"the-open-network",trx:"tron",shib:"shiba-inu",near:"near",arb:"arbitrum",op:"optimism",apt:"aptos",sui:"sui",inj:"injective-protocol",pepe:"pepe"};

var fromCoin=coins[0], toCoin=coins[2];

/* === PRICE FETCHING === */
function fetchPrices(){
  var ids=[];for(var k in geckoMap)ids.push(geckoMap[k]);
  fetch("https://api.coingecko.com/api/v3/simple/price?ids="+ids.join(",")+"&vs_currencies=usd")
    .then(function(r){return r.json()})
    .then(function(d){
      coins.forEach(function(c){
        if(c.type!=="crypto")return;
        var g=geckoMap[c.id];
        if(g&&d[g]&&d[g].usd)c.price=d[g].usd;
      });
      calc();
    }).catch(function(){});
  fetch("https://api.exchangerate-api.com/v4/latest/USD")
    .then(function(r){return r.json()})
    .then(function(d){
      if(d&&d.rates){
        coins.forEach(function(c){
          if(c.type!=="fiat")return;
          if(d.rates[c.symbol])c.price=1/d.rates[c.symbol];
        });
      }
      calc();
    }).catch(function(){});
}
fetchPrices();
setInterval(fetchPrices,60000);

/* === RENDER COIN LIST === */
function renderList(listEl,searchEl,exclude,onSelect,filterType){
  var q=(searchEl.value||"").toLowerCase();
  var ft=filterType||"crypto";
  listEl.innerHTML="";
  var count=0;
  coins.forEach(function(c){
    if(c.id===exclude)return;
    if(c.type!==ft)return;
    if(q&&c.name.toLowerCase().indexOf(q)===-1&&c.symbol.toLowerCase().indexOf(q)===-1)return;
    count++;
    var it=document.createElement("div");
    it.className="ex-coin-item";
    var ps=c.price<0.01?c.price.toFixed(6):c.price.toLocaleString("en-US",{maximumFractionDigits:2});
    it.innerHTML="<span class=\"coin-icon "+c.cls+"\">"+c.icon+"</span>"
      +"<div class=\"coin-info\"><span class=\"coin-ticker\">"+c.symbol+"</span>"
      +"<span class=\"coin-fullname\">"+c.name+"</span></div>"
      +"<span class=\"coin-price\">$"+ps+"</span>";
    it.addEventListener("click",function(){onSelect(c)});
    listEl.appendChild(it);
  });
  if(count===0){
    var em=document.createElement("div");
    em.className="ex-coin-item";
    em.style.justifyContent="center";
    em.style.opacity="0.4";
    em.innerHTML="<span>Ничего не найдено</span>";
    listEl.appendChild(em);
  }
}

/* === BUILD TABS === */
function buildTabs(dd,searchEl,listEl,exclude,onSelect){
  // Удаляем старые табы если есть
  var old=dd.querySelector(".ex-dropdown-tabs");
  if(old)old.remove();
  // Удаляем старый заголовок
  var oldH=dd.querySelector(".ex-dropdown-header");
  if(oldH)oldH.style.display="none";

  var tabsDiv=document.createElement("div");
  tabsDiv.className="ex-dropdown-tabs";

  var cryptoCount=0,fiatCount=0;
  coins.forEach(function(c){
    if(c.id===exclude)return;
    if(c.type==="crypto")cryptoCount++;
    if(c.type==="fiat")fiatCount++;
  });

  var btnCrypto=document.createElement("button");
  btnCrypto.type="button";
  btnCrypto.className="ex-dropdown-tab active";
  btnCrypto.setAttribute("data-tab","crypto");
  btnCrypto.innerHTML="\u26D3 Крипто <span class=\"tab-count\">"+cryptoCount+"</span>";

  var btnFiat=document.createElement("button");
  btnFiat.type="button";
  btnFiat.className="ex-dropdown-tab";
  btnFiat.setAttribute("data-tab","fiat");
  btnFiat.innerHTML="\uD83C\uDFE6 Фиат <span class=\"tab-count\">"+fiatCount+"</span>";

  tabsDiv.appendChild(btnCrypto);
  tabsDiv.appendChild(btnFiat);

  // Вставляем табы ПЕРЕД поиском
  var searchWrap=dd.querySelector(".ex-search-wrap");
  if(searchWrap){
    dd.insertBefore(tabsDiv,searchWrap);
  }else{
    dd.insertBefore(tabsDiv,dd.firstChild);
  }

  // Восстанавливаем активный таб
  var activeType=dd._activeType||"crypto";
  btnCrypto.classList.toggle("active",activeType==="crypto");
  btnFiat.classList.toggle("active",activeType==="fiat");

  function switchTab(type){
    activeType=type;
    dd._activeType=type;
    btnCrypto.classList.toggle("active",type==="crypto");
    btnFiat.classList.toggle("active",type==="fiat");
    renderList(listEl,searchEl,exclude,onSelect,type);
  }

  btnCrypto.addEventListener("click",function(e){
    e.preventDefault();e.stopPropagation();
    switchTab("crypto");
  });
  btnFiat.addEventListener("click",function(e){
    e.preventDefault();e.stopPropagation();
    switchTab("fiat");
  });

  return activeType;
}

/* === SETTERS === */
function setFrom(c){
  fromCoin=c;
  var nameEl=document.getElementById("hFromCoinName");
  if(nameEl)nameEl.textContent=c.symbol;
  var iconWrap=document.querySelector("#hFromSelectBtn .coin-icon-wrap");
  if(iconWrap)iconWrap.innerHTML="<span class=\"coin-icon "+c.cls+"\">"+c.icon+"</span>";
  closeAll();
  calc();
}
function setTo(c){
  toCoin=c;
  var nameEl=document.getElementById("hToCoinName");
  if(nameEl)nameEl.textContent=c.symbol;
  var iconWrap=document.querySelector("#hToSelectBtn .coin-icon-wrap");
  if(iconWrap)iconWrap.innerHTML="<span class=\"coin-icon "+c.cls+"\">"+c.icon+"</span>";
  closeAll();
  calc();
}

/* === CLOSE DROPDOWNS === */
function closeAll(){
  var f=document.getElementById("hFromDropdown");
  var t=document.getElementById("hToDropdown");
  if(f){
    f.classList.remove("open");
    var tabs1=f.querySelector(".ex-dropdown-tabs");
    if(tabs1)tabs1.remove();
  }
  if(t){
    t.classList.remove("open");
    var tabs2=t.querySelector(".ex-dropdown-tabs");
    if(tabs2)tabs2.remove();
  }
}

/* === CALC === */
function calc(){
  var a=parseFloat(document.getElementById("hFromAmount").value)||0;
  var r=fromCoin.price/toCoin.price;
  var res=a*r*0.995;
  var toAmtEl=document.getElementById("hToAmount");
  if(toAmtEl)toAmtEl.value=res?res.toFixed(6):"";
  var rs=r<0.001?r.toFixed(8):(r<1?r.toFixed(6):r.toLocaleString("en-US",{maximumFractionDigits:2}));
  var rateEl=document.getElementById("hExchangeRate");
  if(rateEl)rateEl.textContent="1 "+fromCoin.symbol+" \u2248 "+rs+" "+toCoin.symbol;
}

/* === DROPDOWN OPEN/CLOSE LOGIC === */
function openFrom(){
  var fd=document.getElementById("hFromDropdown");
  if(!fd)return;
  fd.classList.add("open");
  var se=document.getElementById("hFromSearch");
  if(se)se.value="";
  var list=document.getElementById("hFromList");
  var at=buildTabs(fd,se,list,toCoin.id,setFrom);
  renderList(list,se,toCoin.id,setFrom,at);
  if(se)se.focus();
}
function openTo(){
  var td=document.getElementById("hToDropdown");
  if(!td)return;
  td.classList.add("open");
  var se=document.getElementById("hToSearch");
  if(se)se.value="";
  var list=document.getElementById("hToList");
  var at=buildTabs(td,se,list,fromCoin.id,setTo);
  renderList(list,se,fromCoin.id,setTo,at);
  if(se)se.focus();
}

/* === EVENT LISTENERS === */
document.addEventListener("click",function(e){
  var fb=document.getElementById("hFromSelectBtn");
  var tb=document.getElementById("hToSelectBtn");
  var fd=document.getElementById("hFromDropdown");
  var td=document.getElementById("hToDropdown");
  if(!fb||!tb)return;

  if(fb.contains(e.target)){
    e.preventDefault();e.stopPropagation();
    var wasOpen=fd.classList.contains("open");
    closeAll();
    if(!wasOpen)openFrom();
    return;
  }
  if(tb.contains(e.target)){
    e.preventDefault();e.stopPropagation();
    var wasOpen2=td.classList.contains("open");
    closeAll();
    if(!wasOpen2)openTo();
    return;
  }
  if(fd&&!fd.contains(e.target)&&td&&!td.contains(e.target)){
    closeAll();
  }
},true);

/* search inputs */
var hfs=document.getElementById("hFromSearch");
if(hfs)hfs.addEventListener("input",function(){
  var fd=document.getElementById("hFromDropdown");
  var at=fd._activeType||"crypto";
  renderList(document.getElementById("hFromList"),this,toCoin.id,setFrom,at);
});
var hts=document.getElementById("hToSearch");
if(hts)hts.addEventListener("input",function(){
  var td=document.getElementById("hToDropdown");
  var at=td._activeType||"crypto";
  renderList(document.getElementById("hToList"),this,fromCoin.id,setTo,at);
});

/* amount input */
var hfa=document.getElementById("hFromAmount");
if(hfa)hfa.addEventListener("input",calc);

/* swap button */
var hsb=document.getElementById("hSwapBtn");
if(hsb)hsb.addEventListener("click",function(){
  var t=fromCoin;
  setFrom(toCoin);
  setTo(t);
  calc();
});

/* exchange button */
var heb=document.getElementById("hExchangeBtn");
if(heb)heb.addEventListener("click",function(){
  var a=document.getElementById("hFromAmount").value;
  if(!a||parseFloat(a)<=0){alert("Введите сумму");return}
  window.location.href="exchange.html?from="+fromCoin.symbol+"&to="+toCoin.symbol+"&amount="+a;
});

/* init */
document.getElementById("hFromAmount").value=1;
calc();

console.log("hero-calc.js loaded: "+coins.length+" coins ("+coins.filter(function(c){return c.type==="crypto"}).length+" crypto, "+coins.filter(function(c){return c.type==="fiat"}).length+" fiat)");
})();