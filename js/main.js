/* ================================================================
   main.js — CryptoFlow by Muravsky Page-Specific Logic
   
   Components.js handles: header, footer, auth modal, burger,
   theme toggle, back-to-top, toast, auth state
   
   This file handles: page-specific widgets only
   ================================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* --- Smooth Scroll --- */
const SmoothScroll = (() => {
  const init = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const header = $('.header');
      const offset = header ? header.offsetHeight + 16 : 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  };
  return { init };
})();

/* --- Scroll Reveal --- */
const ScrollReveal = (() => {
  const init = () => {
    const els = $$('[data-reveal]');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('revealed'), Number(en.target.dataset.revealDelay || 0));
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => obs.observe(el));
  };
  return { init };
})();

/* --- Exchange Widget --- */
const ExchangeWidget = (() => {
  const rates = {
    BTC: { USD:67432.50, EUR:62100, RUB:6120000 },
    ETH: { USD:3521.80, EUR:3242.50, RUB:319800 },
    USDT:{ USD:1, EUR:0.92, RUB:90.75 },
    SOL: { USD:178.45, EUR:164.20, RUB:16180 },
    BNB: { USD:598.30, EUR:550.80, RUB:54300 },
    XRP: { USD:0.5234, EUR:0.4820, RUB:47.50 },
    ADA: { USD:0.4512, EUR:0.4155, RUB:40.95 },
    DOGE:{ USD:0.1523, EUR:0.1402, RUB:13.82 }
  };
  const giveInput=$('#give-amount'),getInput=$('#get-amount'),giveSelect=$('#give-currency'),getSelect=$('#get-currency'),rateDisplay=$('#exchange-rate'),swapBtn=$('#swap-btn');
  if(!giveInput||!getInput)return{init:()=>{}};
  const calc=()=>{
    const amt=parseFloat(giveInput.value)||0,gC=giveSelect?giveSelect.value:'USDT',rC=getSelect?getSelect.value:'BTC';
    let rate=1;
    if(rates[rC]&&rates[rC][gC])rate=1/rates[rC][gC];
    else if(rates[gC]&&rates[gC][rC])rate=rates[gC][rC];
    else if(rates[gC]&&rates[rC])rate=(rates[gC].USD||1)/(rates[rC].USD||1);
    const res=amt*rate;
    getInput.value=res>1000?res.toFixed(2):res>1?res.toFixed(4):res.toFixed(8);
    if(rateDisplay)rateDisplay.textContent=`1 ${gC} ≈ ${(rate>1?rate.toFixed(2):rate.toFixed(8))} ${rC}`;
  };
  const init=()=>{
    giveInput.addEventListener('input',calc);
    if(giveSelect)giveSelect.addEventListener('change',calc);
    if(getSelect)getSelect.addEventListener('change',calc);
    if(swapBtn)swapBtn.addEventListener('click',()=>{
      if(!giveSelect||!getSelect)return;
      const t=giveSelect.value;giveSelect.value=getSelect.value;getSelect.value=t;
      giveInput.value=getInput.value;calc();
    });
    calc();
  };
  return{init};
})();

/* --- Ticker --- */
const Ticker = (() => {
  const c=$('.ticker-track');
  if(!c)return{init:()=>{}};
  const coins=[
    {s:'BTC',p:'67,432.50',ch:'+2.34%',u:true},{s:'ETH',p:'3,521.80',ch:'+1.87%',u:true},
    {s:'BNB',p:'598.30',ch:'-0.42%',u:false},{s:'SOL',p:'178.45',ch:'+5.12%',u:true},
    {s:'XRP',p:'0.5234',ch:'-1.05%',u:false},{s:'ADA',p:'0.4512',ch:'+0.78%',u:true},
    {s:'DOGE',p:'0.1523',ch:'+3.45%',u:true},{s:'AVAX',p:'38.92',ch:'-2.18%',u:false},
    {s:'DOT',p:'7.45',ch:'+1.23%',u:true},{s:'LINK',p:'14.78',ch:'+0.56%',u:true}
  ];
  const init=()=>{
    const h=coins.map(x=>`<div class="ticker-item"><span class="ticker-symbol">${x.s}</span><span class="ticker-price">$${x.p}</span><span class="ticker-change ${x.u?'up':'down'}">${x.ch}</span></div>`).join('');
    c.innerHTML=h+h;
  };
  return{init};
})();

/* --- FAQ --- */
const FAQ = (() => {
  let activeCat = 'all';

  const filterAll = () => {
    const si = $('.faq-search input');
    const q = si ? si.value.toLowerCase().trim() : '';
    const emptyEl = $('#faqEmpty');
    let shown = 0;

    $$('.faq-item').forEach(item => {
      const itemCat = item.dataset.cat || '';
      const text = item.textContent.toLowerCase();
      const catMatch = activeCat === 'all' || itemCat === activeCat;
      const txtMatch = !q || text.includes(q);

      if (catMatch && txtMatch) {
        item.style.display = '';
        shown++;
      } else {
        item.style.display = 'none';
        item.classList.remove('open');
        const a = item.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      }
    });

    if (emptyEl) emptyEl.style.display = shown === 0 ? 'block' : 'none';
  };

  const init = () => {
    /* Accordion */
    document.addEventListener('click', (e) => {
      const q = e.target.closest('.faq-question');
      if (!q) return;
      const item = q.closest('.faq-item');
      if (!item) return;
      const list = item.closest('.faq-list');
      const isOpen = item.classList.contains('open');

      if (list) $$('.faq-item.open', list).forEach(o => {
        if (o !== item) {
          o.classList.remove('open');
          const a = o.querySelector('.faq-answer');
          if (a) { a.style.maxHeight = '0'; a.style.opacity = '0'; }
          const c = o.querySelector('.faq-chevron');
          if (c) c.style.transform = 'rotate(0deg)';
        }
      });

      item.classList.toggle('open', !isOpen);
      const ans = item.querySelector('.faq-answer');
      const chevron = q.querySelector('.faq-chevron');

      if (ans) {
        if (!isOpen) {
          ans.style.maxHeight = ans.scrollHeight + 32 + 'px';
          ans.style.opacity = '1';
          ans.style.paddingTop = '16px';
          ans.style.paddingBottom = '16px';
        } else {
          ans.style.maxHeight = '0';
          ans.style.opacity = '0';
          ans.style.paddingTop = '0';
          ans.style.paddingBottom = '0';
        }
      }
      if (chevron) chevron.style.transform = !isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    /* Search */
    const si = $('.faq-search input');
    if (si) si.addEventListener('input', filterAll);

    /* Categories — data-cat */
    $$('.faq-cat').forEach(c => {
      c.addEventListener('click', () => {
        $$('.faq-cat').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        activeCat = c.dataset.cat || 'all';
        if (si) si.value = '';
        filterAll();
      });
    });
  };

  return { init };
})();

/* --- Animated Counters --- */
const AnimatedCounters = (() => {
  const anim=(el)=>{
    const tgt=parseFloat(el.dataset.count),suf=el.dataset.suffix||'',pre=el.dataset.prefix||'',dec=parseInt(el.dataset.decimals)||0,dur=2000,st=performance.now();
    const step=(now)=>{const p=Math.min((now-st)/dur,1),e=p===1?1:1-Math.pow(2,-10*p),cur=tgt*e;el.textContent=dec>0?pre+cur.toFixed(dec)+suf:pre+Math.floor(cur).toLocaleString('ru-RU')+suf;if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  };
  const init=()=>{
    const els=$$('[data-count]');if(!els.length)return;
    const obs=new IntersectionObserver((en)=>{en.forEach(e=>{if(e.isIntersecting){anim(e.target);obs.unobserve(e.target);}});},{threshold:0.3});
    els.forEach(el=>obs.observe(el));
  };
  return{init};
})();

/* --- Legal Tabs --- */
const LegalTabs = (() => {
  const init=()=>{$$('.legal-tab').forEach(t=>{t.addEventListener('click',()=>{const tg=t.dataset.tab,sec=t.closest('section')||document;$$('.legal-tab',sec).forEach(x=>x.classList.remove('active'));t.classList.add('active');$$('.legal-content',sec).forEach(c=>c.classList.toggle('active',c.id==='tab-'+tg));});});};
  return{init};
})();

/* --- Settings Nav --- */
const SettingsNav = (() => {
  const init=()=>{$$('.settings-nav-item').forEach(i=>{i.addEventListener('click',()=>{const tg=i.dataset.panel;if(!tg)return;$$('.settings-nav-item').forEach(n=>n.classList.remove('active'));i.classList.add('active');$$('.settings-panel').forEach(p=>p.classList.toggle('active',p.id===tg));});});};
  return{init};
})();

/* --- Rates Table --- */
const RatesTable = (() => {
  const init=()=>{
    const si=$('.rates-search input'),tbl=$('.rates-table');if(!si||!tbl)return;
    si.addEventListener('input',(e)=>{const q=e.target.value.toLowerCase().trim();$$('tbody tr',tbl).forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';});});
    $$('.rates-filter').forEach(b=>{b.addEventListener('click',()=>{$$('.rates-filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');const cat=b.dataset.filter;$$('tbody tr',tbl).forEach(r=>{r.style.display=(cat==='all'||r.dataset.cat===cat)?'':'none';});});});
    $$('th[data-sort]',tbl).forEach(th=>{th.style.cursor='pointer';th.addEventListener('click',()=>{const tb=$('tbody',tbl);if(!tb)return;const rows=$$('tr',tb),idx=[...th.parentNode.children].indexOf(th),asc=!th.classList.contains('sort-asc');$$('th[data-sort]',tbl).forEach(h=>h.classList.remove('sort-asc','sort-desc'));th.classList.add(asc?'sort-asc':'sort-desc');rows.sort((a,b)=>{const vA=a.children[idx]?.textContent.trim()||'',vB=b.children[idx]?.textContent.trim()||'',nA=parseFloat(vA.replace(/[^0-9.\-]/g,'')),nB=parseFloat(vB.replace(/[^0-9.\-]/g,''));if(!isNaN(nA)&&!isNaN(nB))return asc?nA-nB:nB-nA;return asc?vA.localeCompare(vB):vB.localeCompare(vA);});rows.forEach(r=>tb.appendChild(r));});});
  };
  return{init};
})();

/* --- Contact Form --- */
const ContactForm = (() => {
  const init=()=>{
    const f=$('#contact-form');if(!f)return;
    f.addEventListener('submit',(e)=>{
      e.preventDefault();
      const n=f.querySelector('[name="name"]'),em=f.querySelector('[name="email"]'),m=f.querySelector('[name="message"]');
      if(n&&!n.value.trim()){if(window.showToast)showToast('Укажите имя','warning');n.focus();return;}
      if(em&&!em.value.includes('@')){if(window.showToast)showToast('Укажите корректный email','warning');em.focus();return;}
      if(m&&!m.value.trim()){if(window.showToast)showToast('Напишите сообщение','warning');m.focus();return;}
      if(window.showToast)showToast('Сообщение отправлено!','success');f.reset();
    });
  };
  return{init};
})();

/* --- Settings Save --- */
const SettingsSave = (() => {
  const init=()=>{$$('.btn-save-settings').forEach(b=>{b.addEventListener('click',(e)=>{e.preventDefault();const o=b.textContent;b.textContent='Сохранение...';b.disabled=true;b.style.opacity='0.7';setTimeout(()=>{b.textContent=o;b.disabled=false;b.style.opacity='1';if(window.showToast)showToast('Настройки сохранены','success');},800);});});};
  return{init};
})();

/* --- Dashboard Mini Charts --- */
const DashCharts = (() => {
  const draw=(cv,data,color)=>{if(!cv||!cv.getContext)return;const ctx=cv.getContext('2d');cv.width=cv.offsetWidth*2;cv.height=cv.offsetHeight*2;ctx.scale(2,2);const w=cv.offsetWidth,h=cv.offsetHeight,max=Math.max(...data),min=Math.min(...data),range=max-min||1,step=w/(data.length-1);const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,color+'30');gr.addColorStop(1,color+'00');ctx.beginPath();ctx.moveTo(0,h);data.forEach((v,i)=>ctx.lineTo(i*step,h-((v-min)/range)*h*0.8-h*0.1));ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle=gr;ctx.fill();ctx.beginPath();data.forEach((v,i)=>{const x=i*step,y=h-((v-min)/range)*h*0.8-h*0.1;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.stroke();};
  const init=()=>{$$('.mini-chart').forEach(cv=>{const d=Array.from({length:20},(_,i)=>Math.random()*100+50+i*3);draw(cv,d,cv.dataset.color||'#6366f1');});};
  return{init};
})();

/* --- Parallax --- */
const Parallax = (() => {
  const init=()=>{const hero=$('.hero');if(!hero)return;const orbs=$$('.hero-orb',hero);if(!orbs.length)return;let tick=false;window.addEventListener('mousemove',(e)=>{if(tick)return;tick=true;requestAnimationFrame(()=>{const x=(e.clientX/window.innerWidth-0.5)*2,y=(e.clientY/window.innerHeight-0.5)*2;orbs.forEach((o,i)=>{o.style.transform=`translate(${x*(i+1)*15}px,${y*(i+1)*15}px)`;});tick=false;});},{passive:true});};
  return{init};
})();

/* --- Price Simulator --- */
const PriceSimulator = (() => {
  const init=()=>{const cells=$$('[data-live-price]');if(!cells.length)return;setInterval(()=>{cells.forEach(c=>{const b=parseFloat(c.dataset.livePrice)||0;if(!b)return;const ch=b*(Math.random()*0.01-0.005),np=b+ch;c.dataset.livePrice=np.toString();let f;if(np>1000)f='$'+np.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');else if(np>1)f='$'+np.toFixed(4);else f='$'+np.toFixed(6);c.textContent=f;c.style.transition='color 0.3s';c.style.color=ch>0?'#22c55e':'#ef4444';setTimeout(()=>{c.style.color='';},600);});},3000);};
  return{init};
})();

/* --- Copy Clipboard --- */
const CopyClipboard = (() => {
  const init=()=>{document.addEventListener('click',(e)=>{const b=e.target.closest('[data-copy]');if(!b)return;const t=b.dataset.copy;if(!t)return;navigator.clipboard.writeText(t).then(()=>{if(window.showToast)showToast('Скопировано!','success');const o=b.textContent;b.textContent='✓';setTimeout(()=>{b.textContent=o;},1500);}).catch(()=>{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();});});};
  return{init};
})();

/* --- Exchange Submit --- */
const ExchangeSubmit = (() => {
  const init=()=>{
    const btn=$('#exchange-submit');if(!btn)return;
    btn.addEventListener('click',(e)=>{
      e.preventDefault();
      const user=JSON.parse(localStorage.getItem('nx_user')||'null');
      if(!user){if(window.showToast)showToast('Сначала войдите в аккаунт','warning');return;}
      const amt=$('#give-amount');
      if(amt&&(!amt.value||parseFloat(amt.value)<=0)){if(window.showToast)showToast('Введите сумму','warning');amt.focus();return;}
      if(window.showToast)showToast('Заявка на обмен создана!','success');
    });
  };
  return{init};
})();

/* --- INIT --- */
document.addEventListener('DOMContentLoaded', () => {
  SmoothScroll.init();
  ScrollReveal.init();
  ExchangeWidget.init();
  Ticker.init();
  FAQ.init();
  AnimatedCounters.init();
  LegalTabs.init();
  SettingsNav.init();
  RatesTable.init();
  ContactForm.init();
  SettingsSave.init();
  DashCharts.init();
  Parallax.init();
  PriceSimulator.init();
  CopyClipboard.init();
  ExchangeSubmit.init();

  console.log('%c CryptoFlow by Muravsky %c Ready ', 'background:#6366f1;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold', 'background:#22c55e;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;font-weight:bold');
});



